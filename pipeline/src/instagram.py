"""Optional — auto-post each published article to Instagram via the official
Graph API (free, ToS-compliant). Needs an IG Business/Creator account linked to
a Facebook Page, plus a long-lived access token (see DEPLOY.md / setup guide).

If IG_USER_ID / IG_ACCESS_TOKEN aren't set, posting is silently skipped.
"""
from __future__ import annotations
import re
import time

import requests

from config import IG_USER_ID, IG_ACCESS_TOKEN, SITE_URL, DRY_RUN
from src.models import Article

GRAPH = "https://graph.facebook.com/v21.0"

# A few evergreen tags added to every post.
BASE_HASHTAGS = ["news", "worldnews", "breakingnews", "currentaffairs",
                 "globalnews", "theindianmorningpost"]


def _camel_tag(text: str) -> str:
    words = re.findall(r"[A-Za-z0-9]+", text)
    return "".join(w.capitalize() for w in words)


def build_hashtags(article: Article, limit: int = 18) -> list[str]:
    tags: list[str] = []
    seen: set[str] = set()

    def add(raw: str):
        t = _camel_tag(raw)
        if t and t.lower() not in seen:
            seen.add(t.lower())
            tags.append("#" + t)

    add(article.category)
    for kw in article.keywords:
        add(kw)
    for b in BASE_HASHTAGS:
        add(b)
    return tags[:limit]


def build_caption(article: Article, slug: str) -> str:
    url = f"{SITE_URL}/article/{slug}/"
    hashtags = " ".join(build_hashtags(article))
    parts = [
        article.headline,
        "",
        (article.summary or article.subtitle or "").strip(),
        "",
        "📰 The Indian Morning Post — Trusted Global News, Every Morning",
        f"🔗 {url}",
        "",
        hashtags,
    ]
    caption = "\n".join(p for p in parts if p is not None)
    return caption[:2200]  # IG caption hard limit


def _enabled() -> bool:
    return bool(IG_USER_ID and IG_ACCESS_TOKEN) and not DRY_RUN


def post_to_instagram(article: Article, slug: str) -> bool:
    """Create a media container from the article image + caption, then publish.
    Returns True on success. Never raises — failures are logged and skipped."""
    if not _enabled():
        return False
    if not article.image_url:
        print("  [instagram] no image; skipping")
        return False

    caption = build_caption(article, slug)
    try:
        # 1. Create the media container
        create = requests.post(
            f"{GRAPH}/{IG_USER_ID}/media",
            data={
                "image_url": article.image_url,
                "caption": caption,
                "access_token": IG_ACCESS_TOKEN,
            },
            timeout=60,
        )
        if create.status_code != 200:
            print(f"  [instagram] container failed: {create.text[:200]}")
            return False
        creation_id = create.json().get("id")
        if not creation_id:
            print("  [instagram] no creation id")
            return False

        # 2. Publish (retry a few times if the container is still processing)
        for attempt in range(5):
            pub = requests.post(
                f"{GRAPH}/{IG_USER_ID}/media_publish",
                data={"creation_id": creation_id, "access_token": IG_ACCESS_TOKEN},
                timeout=60,
            )
            if pub.status_code == 200:
                print(f"  [instagram] posted: {article.headline[:50]}")
                return True
            # 9007 = media not ready yet
            if '"code":9007' in pub.text or "not ready" in pub.text.lower():
                time.sleep(5)
                continue
            print(f"  [instagram] publish failed: {pub.text[:200]}")
            return False
        print("  [instagram] media never became ready; skipping")
        return False
    except requests.RequestException as exc:
        print(f"  [instagram] error: {exc}")
        return False
