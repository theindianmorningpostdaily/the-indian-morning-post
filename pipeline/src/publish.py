"""Stage 6 — Publish. Persist the article + its internal source references to
Supabase. Records the cluster in the dedupe ledger so it never reruns."""
from __future__ import annotations

import requests

from config import DRY_RUN, CF_PAGES_DEPLOY_HOOK
from src import db
from src.models import Article, StoryCluster


def _unique_slug(slug: str) -> str:
    """Avoid slug collisions across days (e.g. recurring topics)."""
    if not db.slug_exists(slug):
        return slug
    for n in range(2, 50):
        candidate = f"{slug}-{n}"
        if not db.slug_exists(candidate):
            return candidate
    return slug  # give up gracefully; DB unique constraint will guard


def publish(article: Article, cluster: StoryCluster) -> bool:
    if DRY_RUN:
        print(f"  [publish] DRY_RUN — would publish: {article.headline}")
        return True

    slug = _unique_slug(article.slug)
    row = {
        "slug": slug,
        "headline": article.headline,
        "subtitle": article.subtitle,
        "summary": article.summary,
        "body": article.body,
        "category": article.category,
        "seo_title": article.seo_title,
        "meta_description": article.meta_description,
        "keywords": article.keywords,
        "image_url": article.image_url,
        "image_prompt": article.image_prompt,
        "author": article.author,
        "status": "published",
        "is_breaking": article.is_breaking,
        "credibility_score": article.credibility_score,
        "source_count": article.source_count,
        "read_minutes": article.read_minutes,
        "cluster_key": article.cluster_key,
    }

    try:
        created = db.insert("articles", [row])
        article_id = created[0]["id"]
    except requests.HTTPError as exc:
        print(f"  [publish] FAILED to insert article: {exc}")
        return False

    # Internal source attribution (compliance — not shown verbatim to readers)
    sources = [{
        "article_id": article_id,
        "source_name": it.source_name,
        "source_url": it.url,
        "source_title": it.title,
        "credibility": it.credibility,
    } for it in cluster.items[:10]]
    try:
        db.insert("article_sources", sources)
    except requests.HTTPError as exc:
        print(f"  [publish] WARN: could not store sources: {exc}")

    print(f"  [publish] PUBLISHED /{article.category}/{slug}")
    return True


def trigger_rebuild() -> None:
    """Ask Cloudflare Pages to rebuild the static frontend with the new data."""
    if DRY_RUN or not CF_PAGES_DEPLOY_HOOK:
        return
    try:
        requests.post(CF_PAGES_DEPLOY_HOOK, timeout=20)
        print("  [publish] triggered Cloudflare Pages rebuild")
    except requests.RequestException as exc:
        print(f"  [publish] WARN: rebuild hook failed: {exc}")
