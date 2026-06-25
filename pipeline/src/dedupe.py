"""Stage 2 — Dedupe & cluster. Group items that describe the SAME event so
that "verified by N sources" becomes a simple count of distinct outlets in a
cluster. Also drops items we've already published (via raw_items ledger)."""
from __future__ import annotations

from rapidfuzz import fuzz

from src.models import RawItem, StoryCluster
from src.utils import normalize_title

# A strong fuzzy match alone groups two headlines together.
SIMILARITY_THRESHOLD = 72
# A weaker fuzzy match still groups them IF they also share enough distinctive
# words (e.g. "Venezuela" + "earthquake") — catches same-event stories that are
# worded very differently across outlets.
WEAK_THRESHOLD = 55
MIN_SHARED_TOKENS = 2


def _tokens(norm_title: str) -> set[str]:
    # normalize_title already drops stopwords/short words; keep the meaty ones.
    return {t for t in norm_title.split() if len(t) > 3}


def _same_story(a_norm: str, b_norm: str) -> bool:
    score = fuzz.token_set_ratio(a_norm, b_norm)
    if score >= SIMILARITY_THRESHOLD:
        return True
    shared = _tokens(a_norm) & _tokens(b_norm)
    return score >= WEAK_THRESHOLD and len(shared) >= MIN_SHARED_TOKENS


def cluster_items(items: list[RawItem]) -> list[StoryCluster]:
    clusters: list[StoryCluster] = []

    for item in items:
        norm = normalize_title(item.title)
        placed = False
        for cluster in clusters:
            # Compare against EVERY member, not just the lead — long event
            # threads chain together even when the first headline drifts.
            if any(_same_story(norm, normalize_title(m.title)) for m in cluster.items):
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
