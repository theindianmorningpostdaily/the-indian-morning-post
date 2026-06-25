"""Stage 3 — Verify. A story is publishable only if it is corroborated by at
least MIN_SOURCES distinct trusted outlets. Single-source items, rumors, and
low-credibility-only clusters are rejected."""
from __future__ import annotations

from config import MIN_SOURCES
from src.models import StoryCluster

# A cluster also passes if a single source is an official/wire outlet of the
# highest credibility (e.g. WHO disease outbreak, Reuters), since those are
# themselves primary verified sources. Tune to taste.
PRIMARY_SOURCE_MIN_CREDIBILITY = 10


def verify_clusters(clusters: list[StoryCluster]) -> list[StoryCluster]:
    verified: list[StoryCluster] = []
    for c in clusters:
        multi_source = c.source_count >= MIN_SOURCES
        primary = any(
            i.credibility >= PRIMARY_SOURCE_MIN_CREDIBILITY for i in c.items
        ) and c.source_count >= 1

        if multi_source or primary:
            verified.append(c)

    rejected = len(clusters) - len(verified)
    print(
        f"  [verify] {len(verified)} verified "
        f"(>= {MIN_SOURCES} sources or a primary outlet), {rejected} rejected"
    )
    return verified
