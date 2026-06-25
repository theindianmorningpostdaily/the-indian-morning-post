"""Small shared helpers."""
from __future__ import annotations
import hashlib
import re
import unicodedata
from datetime import datetime, timezone

_STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "at", "by",
    "with", "as", "is", "are", "was", "were", "be", "been", "from", "that",
    "this", "it", "its", "after", "over", "amid", "says", "say", "new",
}


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def strip_html(text: str) -> str:
    """Best-effort HTML -> plain text without pulling a parser per call."""
    from bs4 import BeautifulSoup
    if not text:
        return ""
    return BeautifulSoup(text, "html.parser").get_text(" ", strip=True)


def normalize_title(title: str) -> str:
    """Lowercase, strip accents/punctuation, drop stopwords — used to build a
    fingerprint so near-identical headlines collapse together."""
    title = unicodedata.normalize("NFKD", title or "")
    title = title.encode("ascii", "ignore").decode("ascii").lower()
    words = re.findall(r"[a-z0-9]+", title)
    keep = [w for w in words if w not in _STOPWORDS and len(w) > 2]
    return " ".join(sorted(keep))


def fingerprint(title: str) -> str:
    return hashlib.sha1(normalize_title(title).encode("utf-8")).hexdigest()[:16]


def estimate_read_minutes(body: str) -> int:
    words = len(re.findall(r"\w+", body or ""))
    return max(1, round(words / 220))
