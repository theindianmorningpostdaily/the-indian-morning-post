"""Stage 4 — Rank. Score verified clusters by global importance so we publish
only the top MAX_ARTICLES. Heuristic + keyword weighting (no paid model)."""
from __future__ import annotations

from src.models import StoryCluster

# Signal keywords grouped by the dimensions in the spec. Presence in the
# headline/summary nudges a story up the agenda.
SIGNAL_WEIGHTS: dict[str, list[str]] = {
    # global importance / politics
    "world_political": [
        "war", "ceasefire", "election", "president", "prime minister", "summit",
        "sanctions", "treaty", "coup", "parliament", "united nations", "nato",
        "diplomatic", "border", "conflict", "peace deal", "referendum",
    ],
    # economic impact
    "economic": [
        "inflation", "recession", "interest rate", "central bank", "gdp",
        "market", "stocks", "oil price", "trade", "tariff", "unemployment",
        "currency", "debt", "ipo", "merger",
    ],
    # technology impact
    "technology": [
        "artificial intelligence", "ai", "chip", "semiconductor", "cyber",
        "data breach", "launch", "satellite", "quantum", "robot", "startup",
    ],
    # humanitarian relevance
    "humanitarian": [
        "earthquake", "flood", "famine", "refugee", "outbreak", "pandemic",
        "humanitarian", "death toll", "disaster", "aid", "evacuat", "wildfire",
        "drought", "hurricane", "cyclone",
    ],
}


# We're "The Indian Morning Post" — give India stories a leg up so the home
# page always carries strong national coverage alongside world news.
INDIA_TERMS = [
    "india", "indian", "new delhi", "delhi", "mumbai", "bengaluru", "kolkata",
    "chennai", "hyderabad", "modi", "rupee", "lok sabha", "rajya sabha",
    "bjp", "rbi", "isro", "supreme court of india",
]
# Enough to keep India prominent, not so much that world news is crowded out.
INDIA_BOOST = 3

# A story only earns the BREAKING badge if it is genuinely urgent — otherwise
# the badge appears on everything and stops meaning anything.
URGENT_TERMS = [
    "killed", "dead", "death toll", "casualt", "injured", "attack", "blast",
    "explosion", "bomb", "terror", "shooting", "hijack", "hostage",
    "earthquake", "quake", "tsunami", "cyclone", "hurricane", "flood",
    "landslide", "wildfire", "crash", "collapse", "evacuat", "emergency",
    "airstrike", "invasion", "coup", "assassinat", "outbreak", "epidemic",
    "rescue", "disaster", "state of emergency", "declares war",
]


def _keyword_score(text: str) -> int:
    text = text.lower()
    score = 0
    for words in SIGNAL_WEIGHTS.values():
        for w in words:
            if w in text:
                score += 1
    return score


def is_india_cluster(c: StoryCluster) -> bool:
    if getattr(c.lead, "category_hint", "") == "india":
        return True
    blob = f"{c.lead.title} {c.lead.summary}".lower()
    return any(t in blob for t in INDIA_TERMS)


# Backwards-compatible alias
_is_india = is_india_cluster


def is_urgent_cluster(c: StoryCluster) -> bool:
    """True only for genuinely urgent events (disaster, violence, emergency)."""
    blob = f"{c.lead.title} {c.lead.summary}".lower()
    return any(t in blob for t in URGENT_TERMS)


def score_cluster(c: StoryCluster) -> float:
    lead = c.lead
    blob = f"{lead.title} {lead.summary}"
    keyword = _keyword_score(blob)

    # More distinct corroborating sources => more important / more certain.
    corroboration = c.source_count * 2
    credibility = c.avg_credibility

    # Recency: items with a timestamp beat undated ones slightly.
    recency = 1 if lead.published_at else 0

    india = INDIA_BOOST if _is_india(c) else 0

    return round(keyword * 3 + corroboration + credibility + recency + india, 2)


def rank_clusters(clusters: list[StoryCluster], top_n: int) -> list[StoryCluster]:
    scored = sorted(clusters, key=score_cluster, reverse=True)
    top = scored[:top_n]
    print(f"  [rank] selected top {len(top)} of {len(clusters)} verified stories")
    for c in top:
        print(f"         {score_cluster(c):6.1f}  [{c.source_count} src]  {c.lead.title[:70]}")
    return top
