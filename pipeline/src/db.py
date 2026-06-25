"""Supabase access via the PostgREST REST API (no extra SDK needed). Uses the
service_role key, which bypasses RLS — keep this key server-side only."""
from __future__ import annotations

import requests

from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

_BASE = f"{SUPABASE_URL}/rest/v1"


def _headers(prefer: str | None = None) -> dict:
    h = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        h["Prefer"] = prefer
    return h


def insert(table: str, rows: list[dict]) -> list[dict]:
    resp = requests.post(
        f"{_BASE}/{table}",
        headers=_headers(prefer="return=representation"),
        json=rows,
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def upsert(table: str, rows: list[dict], on_conflict: str) -> None:
    resp = requests.post(
        f"{_BASE}/{table}",
        headers=_headers(prefer="resolution=merge-duplicates,return=minimal"),
        params={"on_conflict": on_conflict},
        json=rows,
        timeout=30,
    )
    resp.raise_for_status()


def select(table: str, params: dict) -> list[dict]:
    resp = requests.get(
        f"{_BASE}/{table}", headers=_headers(), params=params, timeout=30
    )
    resp.raise_for_status()
    return resp.json()


def existing_cluster_keys(limit: int = 2000) -> set[str]:
    """Cluster keys already turned into published articles — so we never run
    the same story twice."""
    rows = select("articles", {
        "select": "cluster_key",
        "order": "published_at.desc",
        "limit": str(limit),
    })
    return {r["cluster_key"] for r in rows if r.get("cluster_key")}


def slug_exists(slug: str) -> bool:
    rows = select("articles", {"select": "slug", "slug": f"eq.{slug}", "limit": "1"})
    return len(rows) > 0
