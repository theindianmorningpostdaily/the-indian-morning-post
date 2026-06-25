"""Lightweight dataclasses passed between pipeline stages."""
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class RawItem:
    """A single story as pulled from one RSS feed."""
    source_name: str
    source_url: str
    url: str
    title: str
    summary: str
    content: str
    credibility: int
    category_hint: str
    published_at: datetime | None
    fingerprint: str = ""
    cluster_key: str = ""


@dataclass
class StoryCluster:
    """A group of RawItems that report the SAME underlying event, across
    multiple outlets. Verification == enough distinct trusted sources here."""
    key: str
    items: list[RawItem] = field(default_factory=list)

    @property
    def distinct_sources(self) -> set[str]:
        return {i.source_name for i in self.items}

    @property
    def source_count(self) -> int:
        return len(self.distinct_sources)

    @property
    def avg_credibility(self) -> float:
        if not self.items:
            return 0.0
        # average over distinct sources, not over items
        best_per_source: dict[str, int] = {}
        for i in self.items:
            best_per_source[i.source_name] = max(
                best_per_source.get(i.source_name, 0), i.credibility
            )
        return round(sum(best_per_source.values()) / len(best_per_source), 2)

    @property
    def lead(self) -> RawItem:
        """Most credible, most detailed item — the basis for the article."""
        return max(self.items, key=lambda i: (i.credibility, len(i.content or "")))


@dataclass
class Article:
    """The generated, ready-to-publish article."""
    slug: str
    headline: str
    subtitle: str
    summary: str
    body: str
    category: str
    seo_title: str
    meta_description: str
    keywords: list[str]
    image_url: str
    image_prompt: str
    credibility_score: float
    source_count: int
    read_minutes: int
    cluster_key: str
    is_breaking: bool = False
    author: str = "The Indian Morning Post Editorial Desk"
