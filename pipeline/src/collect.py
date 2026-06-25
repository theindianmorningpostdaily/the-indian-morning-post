"""Stage 1 — Collect. Pull the last LOOKBACK_HOURS of items from every
trusted RSS feed and normalize them into RawItems."""
from __future__ import annotations
import time
from datetime import timedelta

import feedparser
from dateutil import parser as dateparser

from config import LOOKBACK_HOURS
from sources import FEEDS, Feed
from src.models import RawItem
from src.utils import strip_html, fingerprint, now_utc


def _parse_date(entry) -> "datetime | None":
    for key in ("published", "updated", "created"):
        val = entry.get(key)
        if val:
            try:
                dt = dateparser.parse(val)
                if dt and dt.tzinfo is None:
                    from datetime import timezone
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt
            except (ValueError, TypeError, OverflowError):
                continue
    return None


def _collect_feed(feed: Feed, cutoff) -> list[RawItem]:
    items: list[RawItem] = []
    parsed = feedparser.parse(feed.url)
    for entry in parsed.entries:
        url = (entry.get("link") or "").strip()
        title = strip_html(entry.get("title", "")).strip()
        if not url or not title:
            continue

        published = _parse_date(entry)
        if published and published < cutoff:
            continue  # too old

        summary = strip_html(entry.get("summary", "") or entry.get("description", ""))
        content = summary
        if entry.get("content"):
            content = strip_html(entry["content"][0].get("value", "")) or summary

        items.append(RawItem(
            source_name=feed.name,
            source_url=feed.url,
            url=url,
            title=title,
            summary=summary[:1000],
            content=content[:6000],
            credibility=feed.credibility,
            category_hint=feed.category,
            published_at=published,
            fingerprint=fingerprint(title),
        ))
    return items


def collect_all() -> list[RawItem]:
    cutoff = now_utc() - timedelta(hours=LOOKBACK_HOURS)
    all_items: list[RawItem] = []
    for feed in FEEDS:
        try:
            got = _collect_feed(feed, cutoff)
            print(f"  [collect] {feed.name:24s} -> {len(got):3d} items")
            all_items.extend(got)
        except Exception as exc:  # one bad feed must not sink the run
            print(f"  [collect] {feed.name:24s} -> FAILED ({exc})")
        time.sleep(0.4)  # be polite to free endpoints
    print(f"  [collect] total raw items: {len(all_items)}")
    return all_items
