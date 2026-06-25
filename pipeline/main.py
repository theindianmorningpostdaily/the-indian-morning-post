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
from src.dedupe import cluster_items, drop_already_published
from src.verify import verify_clusters
from src.rank import rank_clusters
from src.generate import generate_article
from src.images import attach_image
from src.publish import publish, trigger_rebuild


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

    # 3. Verify (>= MIN_SOURCES trusted outlets, or a primary outlet)
    clusters = verify_clusters(clusters)
    if not clusters:
        print("No verified stories today. Exiting without publishing.")
        return 0

    # 4. Rank & select top stories
    top = rank_clusters(clusters, top_n=limit)

    # 5/6. Generate -> image -> publish
    published = 0
    for idx, cluster in enumerate(top):
        print(f"\n--- Story {idx + 1}/{len(top)} ---")
        article = generate_article(cluster)
        if not article:
            continue
        article.is_breaking = breaking
        # seed image deterministically from cluster key for reproducibility
        seed = int(cluster.key[:6], 16) % 1_000_000
        article.image_url = attach_image(article.image_prompt, seed=seed)
        if publish(article, cluster):
            published += 1

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
