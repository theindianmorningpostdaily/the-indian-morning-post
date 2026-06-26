"""The Indian Morning Post — daily publishing pipeline orchestrator.

Run order:
  collect -> dedupe/cluster -> verify (>=2 sources) -> rank -> generate ->
  image -> publish -> trigger rebuild

Usage:
  python main.py            # daily run, publishes top MAX_ARTICLES
  python main.py --breaking # breaking mode: 1-2 stories, marks is_breaking
"""
from __future__ import annotations
import sys

import config
from src import db
from src.collect import collect_all
from src.dedupe import cluster_items, drop_already_published, drop_recently_covered
from src.verify import verify_clusters
from src.rank import rank_clusters
from src.generate import generate_article
from src.images import attach_image
from src.publish import publish, trigger_rebuild
from src.instagram import post_to_instagram


def run(breaking: bool = False) -> int:
    config.assert_ready()
    limit = 2 if breaking else config.MAX_ARTICLES
    mode = "BREAKING" if breaking else "DAILY"
    print(f"\n=== The Indian Morning Post — {mode} run (publishing up to {limit}) ===\n")

    # 1. Collect
    items = collect_all()
    if not items:
        print("No items collected. Exiting.")
        return 0

    # 2. Dedupe & cluster
    clusters = cluster_items(items)

    # ...and drop anything already published in earlier runs
    try:
        published_keys = db.existing_cluster_keys()
    except Exception as exc:
        print(f"  [main] WARN: could not load published keys ({exc}); continuing")
        published_keys = set()
    clusters = drop_already_published(clusters, published_keys)

    # ...and drop developing stories already covered in the last 3 days, even
    # if the headline (death toll, new figures) has since changed.
    try:
        recent_sigs = db.recent_published_signatures(hours=72)
    except Exception as exc:
        print(f"  [main] WARN: could not load recent signatures ({exc}); continuing")
        recent_sigs = []
    clusters = drop_recently_covered(clusters, recent_sigs)

    # 3. Verify (>= MIN_SOURCES trusted outlets, or a primary outlet)
    clusters = verify_clusters(clusters)
    if not clusters:
        print("No verified stories today. Exiting without publishing.")
        return 0

    # 4. Rank & select top stories
    # Rank extra candidates so we can skip near-duplicates and still hit `limit`.
    top = rank_clusters(clusters, top_n=limit * 2 + 2)

    # 5/6. Generate -> image -> publish
    published = 0
    seen_keywords: list[set[str]] = []
    for idx, cluster in enumerate(top):
        if published >= limit:
            break
        print(f"\n--- Story {idx + 1}/{len(top)} ---")
        article = generate_article(cluster)
        if not article:
            continue

        # Safety net: skip if this story heavily overlaps one already published
        # in THIS run (same event the clustering didn't merge).
        kw = {k.lower() for k in article.keywords}
        if any(len(kw & prev) >= 3 for prev in seen_keywords):
            print(f"  [dedupe] skipped near-duplicate: {article.headline[:60]}")
            continue

        article.is_breaking = breaking
        # seed image deterministically from cluster key for reproducibility
        seed = int(cluster.key[:6], 16) % 1_000_000
        article.image_url = attach_image(
            article.image_query, article.image_prompt, seed=seed
        )
        slug = publish(article, cluster)
        if slug:
            published += 1
            seen_keywords.append(kw)
            # Optional: auto-post to Instagram (no-op if not configured).
            try:
                post_to_instagram(article, slug)
            except Exception as exc:
                print(f"  [instagram] WARN: {exc}")

    print(f"\n=== Done. Published {published} article(s). ===")
    if published:
        trigger_rebuild()
    return published


if __name__ == "__main__":
    is_breaking = "--breaking" in sys.argv
    count = run(breaking=is_breaking)
    # Let CI know how many were published so it only rebuilds the site when
    # there's actually something new.
    try:
        with open("published_count.txt", "w", encoding="utf-8") as fh:
            fh.write(str(count))
    except OSError:
        pass
    # Non-zero exit only on hard config errors (handled above); 0 otherwise.
    sys.exit(0)
