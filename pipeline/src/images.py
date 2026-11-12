"""Stage 5b — Featured image.

Primary: a REAL stock photo from Pexels (free API) — looks genuinely
photographic, no AI distortion. We search by the AI-written `image_query`.

Fallback: Pollinations.ai AI generation (free, no key) if Pexels has no key,
returns nothing, or errors — so an article always gets an image.
"""
from __future__ import annotations
import urllib.parse

import requests
from tenacity import retry, stop_after_attempt, wait_fixed

from config import PEXELS_API_KEY, POLLINATIONS_API_KEY

# ---------------------------------------------------------------------------
# Primary: Pexels real stock photos
# ---------------------------------------------------------------------------
PEXELS_SEARCH = "https://api.pexels.com/v1/search"


def _pexels_photo(query: str, seed: int) -> str | None:
    if not PEXELS_API_KEY or not query.strip():
        return None
    try:
        resp = requests.get(
            PEXELS_SEARCH,
            headers={"Authorization": PEXELS_API_KEY},
            params={
                "query": query.strip(),
                "orientation": "landscape",
                "size": "large",
                "per_page": 15,
            },
            timeout=30,
        )
        resp.raise_for_status()
        photos = resp.json().get("photos", [])
        if not photos:
            return None
        # Deterministic pick (seeded) so the same story keeps the same photo,
        # but different stories vary.
        photo = photos[seed % len(photos)]
        src = photo.get("src", {})
        return src.get("landscape") or src.get("large") or src.get("original")
    except requests.RequestException:
        return None


# ---------------------------------------------------------------------------
# Fallback: Pollinations.ai AI generation (no people, to avoid distortion)
# ---------------------------------------------------------------------------
POLLINATIONS = "https://image.pollinations.ai/prompt/{prompt}"
# Authenticated API (needs a secret sk_ key). Returns a public media URL that
# carries no key, so it is safe to store and show to readers.
POLLINATIONS_API = "https://gen.pollinations.ai/v1/images/generations"

STYLE_SUFFIX = (
    ", professional editorial news photography, photorealistic, cinematic, "
    "wide establishing shot, scenery architecture and objects, "
    "no people, no faces, no hands, no crowds, "
    "natural lighting, high detail, sharp focus, 16:9, "
    "no text, no watermark, no logo"
)


def build_image_url(prompt: str, seed: int = 0, width: int = 1280, height: int = 720) -> str:
    full = (prompt.strip() + STYLE_SUFFIX)[:400]
    encoded = urllib.parse.quote(full, safe="")
    url = POLLINATIONS.format(prompt=encoded)
    params = {
        "width": width,
        "height": height,
        "seed": seed,
        "nologo": "true",
        "model": "flux",
    }
    return url + "?" + urllib.parse.urlencode(params)


@retry(stop=stop_after_attempt(3), wait=wait_fixed(3))
def _warm(url: str) -> bool:
    resp = requests.get(url, timeout=120, stream=True)
    resp.raise_for_status()
    next(resp.iter_content(1024), None)
    resp.close()
    return True


def _generate_hosted(prompt: str, seed: int, width: int = 1280,
                     height: int = 720) -> str | None:
    """Generate through the authenticated API; return its hosted URL or None."""
    if not POLLINATIONS_API_KEY:
        return None
    try:
        resp = requests.post(
            POLLINATIONS_API,
            headers={"Authorization": f"Bearer {POLLINATIONS_API_KEY}"},
            json={
                "prompt": (prompt.strip() + STYLE_SUFFIX)[:1000],
                "model": "flux",
                "size": f"{width}x{height}",
                "seed": seed,
                "n": 1,
                "response_format": "url",
            },
            timeout=180,
        )
        if resp.status_code != 200:
            print(f"  [image] Pollinations API {resp.status_code}: {resp.text[:200]}")
            return None
        data = resp.json().get("data") or []
        url = (data[0] or {}).get("url") if data else None
        if not url or not str(url).startswith("https://"):
            print(f"  [image] Pollinations API returned no URL: {resp.text[:200]}")
            return None
        return url
    except Exception as exc:
        print(f"  [image] Pollinations API failed ({exc})")
        return None


def _ai_image(prompt: str, seed: int, label: str) -> str:
    """Clean hosted AI image when the key works, else the anonymous URL."""
    hosted = _generate_hosted(prompt, seed)
    if hosted:
        print(f"  [image] {label} (Pollinations API)")
        return hosted
    url = build_image_url(prompt, seed=seed)
    try:
        _warm(url)
        print(f"  [image] {label} (anonymous fallback, seed={seed})")
    except Exception as exc:
        # Non-fatal: the URL still renders lazily, but the first reader pays
        # the generation wait, so say so instead of failing silently.
        print(f"  [image] {label} warm-up FAILED ({exc}); "
              "first visitor will wait on generation")
    return url


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------
_INDIA_HINTS = ("india", "indian", "delhi", "mumbai", "bengaluru", "kolkata",
                "chennai", "hyderabad")
# Subjects where a generic stock search pulls FOREIGN landmarks (a "presidential
# palace" returns Kazakhstan, a "parliament" returns Budapest). For India stories
# on these subjects we use a guaranteed-Indian landmark search instead.
_GOVT_TERMS = ("parliament", "government", "president", "minister", "ministry",
               "palace", "diploma", "politic", "election", "defence", "defense",
               "honour", "honor", "summit", "official", "court", "policy")
_INDIA_LANDMARKS = [
    "India Gate New Delhi",
    "Indian national flag monument",
    "New Delhi India cityscape",
    "India Gate Delhi landmark",
]


def _india_query(image_query: str, seed: int) -> str:
    ql = image_query.lower()
    if any(h in ql for h in _INDIA_HINTS):
        return image_query
    if any(g in ql for g in _GOVT_TERMS):
        return _INDIA_LANDMARKS[seed % len(_INDIA_LANDMARKS)]
    return f"India {image_query}".strip()


def _india_ai_prompt(image_prompt: str, image_query: str) -> str:
    base = (image_prompt or image_query or "an editorial scene").strip()
    low = base.lower()
    if not any(h in low for h in _INDIA_HINTS):
        base = f"{base}, in India, Indian architecture and setting, South Asian context"
    return base


def attach_image(image_query: str, image_prompt: str, seed: int,
                 category: str = "") -> str:
    """Return a real Pexels photo URL when possible, else an AI image URL.

    India stories skip Pexels: stock libraries lack India-specific event
    photos and generic queries return foreign landmarks (a CBSE story got
    Harvard). An India-anchored, no-people AI scene is both relevant AND
    Indian, and renders cleanly without people.
    """
    if category == "india":
        return _ai_image(_india_ai_prompt(image_prompt, image_query), seed,
                         "AI India scene")

    real = _pexels_photo(image_query, seed)
    if real:
        print(f"  [image] real photo (Pexels) for '{image_query}'")
        return real

    return _ai_image(image_prompt, seed, "AI fallback")
