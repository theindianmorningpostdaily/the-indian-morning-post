"""Publish a hand-written article from a JSON file in pipeline/manual/.

The automated pipeline writes articles the newsroom generates itself; this is
the escape hatch for editorial pieces written by a person — tributes, notices,
features — that no feed will ever produce.

    python manual_publish.py manual/chimnaramji-jodhaji-gehlot.json
    python manual_publish.py manual/foo.json --dry-run

Reuses the same Supabase insert and Cloudflare rebuild hook as the pipeline, so
a manual article is indistinguishable from any other once published.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import requests

from src import db
from src.publish import _unique_slug, trigger_rebuild

# Only these reach the database. Anything else in the JSON is a typo — better to
# fail loudly than to silently drop a field the author expected to be saved.
ALLOWED = {
    "slug", "headline", "subtitle", "summary", "body", "category",
    "seo_title", "meta_description", "keywords", "image_url", "image_prompt",
    "author", "is_breaking", "read_minutes", "published_at",
}
REQUIRED = {"slug", "headline", "body", "category"}

# Mirrors the DB column widths / SEO limits the pipeline enforces.
LIMITS = {"seo_title": 60, "meta_description": 155}


def load(path: Path) -> dict:
    article = json.loads(path.read_text(encoding="utf-8"))

    missing = REQUIRED - article.keys()
    if missing:
        sys.exit(f"ERROR: {path} is missing required field(s): {sorted(missing)}")

    unknown = article.keys() - ALLOWED
    if unknown:
        sys.exit(f"ERROR: {path} has unknown field(s): {sorted(unknown)}")

    for field, cap in LIMITS.items():
        value = article.get(field) or ""
        if len(value) > cap:
            sys.exit(f"ERROR: {field} is {len(value)} chars, max {cap}")

    return article


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("path", help="path to the article JSON")
    ap.add_argument("--dry-run", action="store_true",
                    help="validate and print, but do not write to the database")
    ap.add_argument("--update", action="store_true",
                    help="edit the existing article with this slug instead of "
                         "publishing a new one")
    args = ap.parse_args()

    path = Path(args.path)
    if not path.is_file():
        sys.exit(f"ERROR: no such file: {path}")

    article = load(path)

    # A manual piece has no feed cluster behind it, so the verification columns
    # stay at zero. Neither is shown to readers — they exist for the pipeline's
    # own bookkeeping, and inventing values here would be a false claim.
    row = {**article, "status": "published", "credibility_score": 0, "source_count": 0}

    category = row["category"]
    valid = {c["slug"] for c in db.select("categories", {"select": "slug"})}
    if category not in valid:
        sys.exit(f"ERROR: category '{category}' is not one of {sorted(valid)}")

    if args.update:
        slug = row["slug"]
        if not db.slug_exists(slug):
            sys.exit(f"ERROR: no published article with slug '{slug}' — "
                     "drop --update to publish it as a new article")

        # An edit is not a republish: keep the original published_at so the
        # piece holds its place in the timeline and its date does not change
        # under readers who already have the URL.
        patch = {k: v for k, v in row.items() if k != "published_at"}

        if args.dry_run:
            print(f"DRY RUN — nothing written. Would update '{slug}' with:\n")
            print(json.dumps(patch, indent=2, ensure_ascii=False))
            return

        try:
            changed = db.update("articles", {"slug": f"eq.{slug}"}, patch)
        except requests.HTTPError as exc:
            detail = getattr(exc.response, "text", "")[:400]
            sys.exit(f"ERROR: update failed: {exc}\n{detail}")
        if not changed:
            sys.exit(f"ERROR: update matched no rows for slug '{slug}'")

        print(f"UPDATED /{category}/{slug}")
        trigger_rebuild()
        return

    if args.dry_run:
        print("DRY RUN — nothing written. Row that would be inserted:\n")
        print(json.dumps(row, indent=2, ensure_ascii=False))
        return

    row["slug"] = _unique_slug(row["slug"])
    try:
        created = db.insert("articles", [row])
    except requests.HTTPError as exc:
        detail = getattr(exc.response, "text", "")[:400]
        sys.exit(f"ERROR: insert failed: {exc}\n{detail}")

    print(f"PUBLISHED /{category}/{row['slug']}  (id={created[0]['id']})")
    trigger_rebuild()


if __name__ == "__main__":
    main()