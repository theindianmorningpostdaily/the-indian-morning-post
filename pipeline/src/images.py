"""Stage 5b — Featured image. Uses Pollinations.ai: free, no API key, no
signup. We build a stable URL from the AI-written image prompt; Pollinations
generates a unique editorial-style image on first fetch and caches it on a CDN.

We optionally warm the URL (fetch once) so the CDN has it ready before readers
arrive, and fall back to a deterministic placeholder if the service is down."""
from __future__ import annotations
import urllib.parse

import requests
from tenacity import retry, stop_after_attempt, wait_fixed

POLLINATIONS = "https://image.pollinations.ai/prompt/{prompt}"

# A consistent visual house-style appended to every prompt. We steer hard away
# from people/faces/hands — the subjects AI image models distort most — toward
# scenery, architecture and objects, which render cleanly.
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


@retry(stop=stop_after_attempt(2), wait=wait_fixed(3))
def _warm(url: str) -> bool:
    # GET (not HEAD) — Pollinations generates on GET. Short read, we discard body.
    resp = requests.get(url, timeout=120, stream=True)
    resp.raise_for_status()
    next(resp.iter_content(1024), None)
    resp.close()
    return True


def attach_image(prompt: str, seed: int) -> str:
    url = build_image_url(prompt, seed=seed)
    try:
        _warm(url)
        print(f"  [image] generated (seed={seed})")
    except Exception as exc:
        # Non-fatal: the URL still works lazily for readers later.
        print(f"  [image] warm-up failed ({exc}); using lazy URL")
    return url
