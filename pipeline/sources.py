"""Trusted, free RSS feeds only. Each carries a credibility score (0-10)
used by the verification step. Add/remove feeds freely — no paid APIs.

Only reputable wire services, public broadcasters, and official bodies are
listed. We extract facts from these and write ORIGINAL articles; we never
republish their text.
"""
from __future__ import annotations
from dataclasses import dataclass


@dataclass(frozen=True)
class Feed:
    name: str          # outlet, used for attribution
    url: str           # RSS/Atom URL
    category: str      # default category hint
    credibility: int   # 0-10 trust score


FEEDS: list[Feed] = [
    # ---- Wire services ----
    Feed("Reuters",  "https://www.reutersagency.com/feed/?best-topics=top&post_type=best", "world", 10),
    Feed("Associated Press", "https://rsshub.app/apnews/topics/apf-topnews", "world", 10),

    # ---- Public broadcasters ----
    Feed("BBC News",     "https://feeds.bbci.co.uk/news/world/rss.xml",          "world", 9),
    Feed("BBC Business", "https://feeds.bbci.co.uk/news/business/rss.xml",       "business", 9),
    Feed("BBC Tech",     "https://feeds.bbci.co.uk/news/technology/rss.xml",     "technology", 9),
    Feed("BBC Science",  "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", "science", 9),
    Feed("BBC Health",   "https://feeds.bbci.co.uk/news/health/rss.xml",         "health", 9),
    Feed("Al Jazeera",   "https://www.aljazeera.com/xml/rss/all.xml",            "world", 8),
    Feed("Deutsche Welle", "https://rss.dw.com/rdf/rss-en-world",                "world", 8),
    Feed("Deutsche Welle Business", "https://rss.dw.com/rdf/rss-en-bus",         "business", 8),

    # ---- Official / institutional ----
    Feed("UN News",      "https://news.un.org/feed/subscribe/en/news/all/rss.xml", "world", 9),
    Feed("WHO News",     "https://www.who.int/feeds/entity/csr/don/en/rss.xml",  "health", 10),
    Feed("NASA",         "https://www.nasa.gov/news-release/feed/",              "science", 10),

    # ---- Reputable supplementary outlets ----
    Feed("The Guardian World", "https://www.theguardian.com/world/rss",          "world", 8),
    Feed("The Guardian Tech",  "https://www.theguardian.com/technology/rss",     "technology", 8),
    Feed("NPR World",          "https://feeds.npr.org/1004/rss.xml",             "world", 8),
    Feed("Nature News",        "https://www.nature.com/nature.rss",              "science", 9),

    # ---- India (national + business) ----
    Feed("The Hindu",          "https://www.thehindu.com/news/national/feeder/default.rss", "india", 9),
    Feed("Indian Express",     "https://indianexpress.com/section/india/feed/",  "india", 8),
    Feed("Hindustan Times",    "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml", "india", 8),
    Feed("NDTV India",         "https://feeds.feedburner.com/ndtvnews-india-news", "india", 8),
    Feed("Times of India",     "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms", "india", 7),
    Feed("India Today",        "https://www.indiatoday.in/rss/1206514",          "india", 7),
    Feed("News18 India",       "https://www.news18.com/rss/india.xml",           "india", 7),
    Feed("The Hindu Business", "https://www.thehindu.com/business/feeder/default.rss", "business", 9),
    Feed("Business Standard",  "https://www.business-standard.com/rss/india-news-216.rss", "business", 8),
    Feed("Livemint",           "https://www.livemint.com/rss/news",              "business", 8),
]


def feeds_by_credibility(min_credibility: int = 0) -> list[Feed]:
    return [f for f in FEEDS if f.credibility >= min_credibility]
