"""Stage 5 — Generate. Turn a verified story cluster into an ORIGINAL article
using Gemini's free tier. The model is given the FACTS extracted from trusted
feeds and is explicitly instructed to write original journalism, never to copy.
Output is strict JSON which we validate before publishing."""
from __future__ import annotations
import json
import re

import requests
from slugify import slugify
from tenacity import retry, stop_after_attempt, wait_exponential

from config import GEMINI_API_KEY, GEMINI_MODEL, CATEGORIES
from src.models import StoryCluster, Article
from src.utils import estimate_read_minutes

GEMINI_ENDPOINT = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "{model}:generateContent"
)

SYSTEM_INSTRUCTION = """You are a senior wire editor at "The Indian Morning Post", a \
premium international newspaper. You write original, neutral, fact-based world \
journalism in the style of Reuters and the Guardian.

ABSOLUTE RULES:
- Write 100% ORIGINAL prose. Never copy sentences or phrasing from the sources.
- Report ONLY facts supported by the provided source material. Do not invent \
quotes, statistics, names, or events. If a detail is not in the sources, omit it.
- Neutral, professional tone. No opinion, no sensationalism, no clickbait.
- British/International English. Third person. Inverted-pyramid structure.
- If the sources are too thin to write responsibly, set "publishable" to false.
"""

USER_TEMPLATE = """Below are facts gathered from {n} trusted news sources about \
ONE story. Synthesize them into a single original article.

SOURCES:
{sources}

Return ONLY a JSON object (no markdown fence) with EXACTLY these keys:
{{
  "publishable": true,
  "category": one of {categories} (use "india" when the story is primarily \
about India — its government, economy, society, or events within India),
  "headline": "compelling, accurate, <= 90 chars",
  "subtitle": "one-sentence deck, <= 160 chars",
  "summary": "2-3 sentence standfirst summary",
  "body": "the full article in Markdown, 450-700 words, 4-7 short paragraphs, \
optionally with '## ' subheadings. Lead with the most important fact.",
  "seo_title": "<= 60 chars, keyword-rich",
  "meta_description": "<= 155 chars",
  "keywords": ["5-8", "lowercase", "seo", "keywords"],
  "image_query": "2-4 simple, concrete words to find a REAL stock photo for this \
story — a searchable real-world subject, NO people, e.g. 'earthquake damaged buildings', \
'oil refinery', 'parliament building', 'cargo ship port', 'wind turbines'",
  "image_prompt": "a photorealistic editorial scene for this story with NO people, \
NO faces, NO hands, NO crowds. Depict a relevant PLACE, BUILDING, LANDSCAPE, OBJECT \
or symbolic wide establishing shot instead — e.g. a city skyline, a government or \
parliament building, a stock-exchange trading floor, damaged terrain, infrastructure, \
national flags, a harbour, or natural scenery. Describe the setting, mood and lighting. \
NO text, NO logos, NO watermarks."
}}
"""


def _build_sources_block(cluster: StoryCluster) -> str:
    lines = []
    for i, item in enumerate(cluster.items[:6], 1):
        body = (item.content or item.summary or "").strip()
        lines.append(
            f"[Source {i}] {item.source_name} (trust {item.credibility}/10)\n"
            f"Title: {item.title}\n"
            f"Reported: {body[:1500]}\n"
        )
    return "\n".join(lines)


def _extract_json(text: str) -> dict:
    """Models sometimes wrap JSON in ```json fences — strip them."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in model output")
    return json.loads(text[start:end + 1])


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=30))
def _call_gemini(prompt: str) -> str:
    url = GEMINI_ENDPOINT.format(model=GEMINI_MODEL)
    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.6,
            # Generous cap: Gemini 2.5 models spend some tokens on internal
            # reasoning before the visible output, so leave plenty of headroom.
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json",
        },
    }
    # New-format Google AI Studio keys (prefix "AQ.") authenticate via the
    # x-goog-api-key header, NOT the ?key= query parameter.
    resp = requests.post(
        url,
        headers={"x-goog-api-key": GEMINI_API_KEY},
        json=payload,
        timeout=120,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["candidates"][0]["content"]["parts"][0]["text"]


def generate_article(cluster: StoryCluster) -> Article | None:
    prompt = USER_TEMPLATE.format(
        n=cluster.source_count,
        sources=_build_sources_block(cluster),
        categories=CATEGORIES,
    )
    try:
        raw = _call_gemini(prompt)
        data = _extract_json(raw)
    except Exception as exc:
        print(f"  [generate] FAILED for '{cluster.lead.title[:50]}': {exc}")
        return None

    if not data.get("publishable", False):
        print(f"  [generate] model declined (thin sourcing): {cluster.lead.title[:50]}")
        return None

    category = data.get("category", cluster.lead.category_hint)
    if category not in CATEGORIES:
        category = cluster.lead.category_hint if cluster.lead.category_hint in CATEGORIES else "world"

    headline = data["headline"].strip()
    body = data["body"].strip()
    slug = slugify(headline)[:80] or slugify(cluster.lead.title)[:80]

    article = Article(
        slug=slug,
        headline=headline,
        subtitle=data.get("subtitle", "").strip(),
        summary=data.get("summary", "").strip(),
        body=body,
        category=category,
        seo_title=data.get("seo_title", headline)[:60],
        meta_description=data.get("meta_description", "")[:155],
        keywords=[k.strip().lower() for k in data.get("keywords", []) if k.strip()][:8],
        image_url="",            # filled by images stage
        image_prompt=data.get("image_prompt", headline).strip(),
        image_query=data.get("image_query", category).strip(),
        credibility_score=cluster.avg_credibility,
        source_count=cluster.source_count,
        read_minutes=estimate_read_minutes(body),
        cluster_key=cluster.key,
    )
    print(f"  [generate] OK -> {article.headline[:70]} [{article.category}]")
    return article
