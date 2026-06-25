"""Stage 2 — Dedupe & cluster. Group items that describe the SAME event so
that "verified by N sources" becomes a simple count of distinct outlets in a
cluster. Also drops items we've already published (via raw_items ledger)."""
from __future__ import annotations

from rapidfuzz import fuzz

from src.models import RawItem, StoryCluster
from src.utils import normalize_title

# Two headlines belong to the same story if their normalized token-set
# similarity is at or above this threshold.
SIMILARITY_THRESHOLD = 72


def cluster_items(items: list[RawItem]) -> list[StoryCluster]:
    clusters: list[StoryCluster] = []

    for item in items:
        norm = normalize_title(item.title)
        placed = False
        for cluster in clusters:
            lead_norm = normalize_title(cluster.items[0].title)
            score = fuzz.token_set_ratio(norm, lead_norm)
            if score >= SIMILARITY_THRESHOLD:
                cluster.items.append(item)
                item.cluster_key = cluster.key
                placed = True
                break
        if not placed:
            key = item.fingerprint
            item.cluster_key = key
            clusters.append(StoryCluster(key=key, items=[item]))

    # Collapse exact-duplicate URLs inside each cluster
    for c in clusters:
        seen_urls: set[str] = set()
        unique: list[RawItem] = []
        for it in c.items:
            if it.url in seen_urls:
                continue
            seen_urls.add(it.url)
            unique.append(it)
        c.items = unique

    print(f"  [dedupe] {len(items)} items -> {len(clusters)} story clusters")
    return clusters


def drop_already_published(clusters: list[StoryCluster], published_keys: set[str]) -> list[StoryCluster]:
    fresh = [c for c in clusters if c.key not in published_keys]
    dropped = len(clusters) - len(fresh)
    if dropped:
        print(f"  [dedupe] dropped {dropped} clusters already published")
    return fresh
