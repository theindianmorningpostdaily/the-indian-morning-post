"""Ping IndexNow (Bing, Yandex, Seznam, …) so freshly published articles get
indexed fast. Free, no key signup — we host a verification key file at
/<key>.txt in the site's public folder."""
from __future__ import annotations

import requests

from config import SITE_URL, DRY_RUN

# Must match the file web/public/<KEY>.txt
INDEXNOW_KEY = "7c3f9a2e5b1d8f4c6a0e2b9d7f1c4a3e"
ENDPOINT = "https://api.indexnow.org/indexnow"


def ping_indexnow(urls: list[str]) -> None:
    if DRY_RUN or not urls:
        return
    host = SITE_URL.split("//", 1)[-1].rstrip("/")
    try:
        resp = requests.post(
            ENDPOINT,
            json={
                "host": host,
                "key": INDEXNOW_KEY,
                "keyLocation": f"{SITE_URL}/{INDEXNOW_KEY}.txt",
                "urlList": urls,
            },
            timeout=20,
        )
        print(f"  [indexnow] pinged {len(urls)} url(s) -> HTTP {resp.status_code}")
    except requests.RequestException as exc:
        print(f"  [indexnow] WARN: {exc}")
