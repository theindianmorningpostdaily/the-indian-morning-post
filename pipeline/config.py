"""Central configuration. Reads from environment (.env locally, secrets in CI)."""
from __future__ import annotations
import os
from dotenv import load_dotenv

load_dotenv()


def _bool(name: str, default: bool) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


# --- Supabase ---
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# --- Gemini ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# --- Pexels (real stock photos; optional — falls back to AI images if unset) ---
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "")

# --- Site URL (for building article links in social posts) ---
SITE_URL = os.getenv(
    "SITE_URL",
    "https://the-indian-morning-post.theindianmorningpostdaily.workers.dev",
).rstrip("/")

# --- Instagram auto-post (optional; needs IG Business account + FB app token) ---
IG_USER_ID = os.getenv("IG_USER_ID", "")           # Instagram Business account ID
IG_ACCESS_TOKEN = os.getenv("IG_ACCESS_TOKEN", "")  # long-lived page access token

# --- Web push via OneSignal (optional) ---
ONESIGNAL_APP_ID = os.getenv("ONESIGNAL_APP_ID", "")
ONESIGNAL_API_KEY = os.getenv("ONESIGNAL_API_KEY", "")
PUSH_PER_RUN = _int("PUSH_PER_RUN", 2)   # max push notifications per pipeline run

# --- Pipeline behaviour ---
MAX_ARTICLES = _int("MAX_ARTICLES", 5)
MIN_SOURCES = _int("MIN_SOURCES", 2)
LOOKBACK_HOURS = _int("LOOKBACK_HOURS", 24)
DRY_RUN = _bool("DRY_RUN", False)

CF_PAGES_DEPLOY_HOOK = os.getenv("CF_PAGES_DEPLOY_HOOK", "")

# Valid categories (must match db/schema.sql)
CATEGORIES = [
    "india", "world", "politics", "business",
    "technology", "science", "health", "environment",
]


def assert_ready() -> None:
    """Fail fast with a clear message if required secrets are missing."""
    missing = [
        n for n, v in {
            "SUPABASE_URL": SUPABASE_URL,
            "SUPABASE_SERVICE_ROLE_KEY": SUPABASE_SERVICE_ROLE_KEY,
            "GEMINI_API_KEY": GEMINI_API_KEY,
        }.items() if not v
    ]
    if missing and not DRY_RUN:
        raise SystemExit(
            "Missing required environment variables: " + ", ".join(missing)
        )
