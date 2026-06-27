"""Optional — send a web push notification (OneSignal) when a new article is
published, so subscribers get pulled back to the site. No-op unless
ONESIGNAL_APP_ID / ONESIGNAL_API_KEY are set."""
from __future__ import annotations

import requests

from config import ONESIGNAL_APP_ID, ONESIGNAL_API_KEY, SITE_URL, DRY_RUN
from src.models import Article

ENDPOINT = "https://onesignal.com/api/v1/notifications"


def _enabled() -> bool:
    return bool(ONESIGNAL_APP_ID and ONESIGNAL_API_KEY) and not DRY_RUN


def _auth() -> str:
    # New OneSignal keys start with "os_v2_" and use the "Key" scheme;
    # legacy REST API keys use "Basic".
    scheme = "Key" if ONESIGNAL_API_KEY.startswith("os_v2_") else "Basic"
    return f"{scheme} {ONESIGNAL_API_KEY}"


def send_push(article: Article, slug: str) -> bool:
    if not _enabled():
        return False
    payload = {
        "app_id": ONESIGNAL_APP_ID,
        "included_segments": ["Subscribed Users"],
        "headings": {"en": article.headline[:90]},
        "contents": {"en": (article.summary or article.subtitle or "")[:200]},
        "url": f"{SITE_URL}/article/{slug}/",
        "chrome_web_icon": f"{SITE_URL}/icon.png",
    }
    if article.image_url:
        payload["chrome_web_image"] = article.image_url
        payload["big_picture"] = article.image_url
    try:
        resp = requests.post(
            ENDPOINT,
            headers={"Authorization": _auth(), "Content-Type": "application/json"},
            json=payload,
            timeout=30,
        )
        if resp.status_code in (200, 201):
            print(f"  [push] sent: {article.headline[:50]}")
            return True
        print(f"  [push] failed: HTTP {resp.status_code} {resp.text[:160]}")
        return False
    except requests.RequestException as exc:
        print(f"  [push] error: {exc}")
        return False
