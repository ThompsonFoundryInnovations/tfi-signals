#!/usr/bin/env python3
"""Checks the Signals Business News data files before you publish.

Run from the repository root:  python3 tools/check-news.py

Rules checked:
  - news/news.json and news/archive.json are valid JSON with a "stories" list
  - every story has all required fields, a valid category, real YYYY-MM-DD dates
    and an http(s) source link
  - no duplicate source links inside a file, and no duplicate ids in the archive
  - news.json (featured) has at most 5 stories
  - every featured story also exists in the archive (so nothing is ever lost)
Exit code 0 means everything passed. Exit code 1 means there is something to fix.
"""
import json, re, sys, datetime, pathlib

CATS = ["Technology", "Online visibility", "Funding", "Business operations", "Regulatory"]
REQ = ["headline", "category", "published", "summary", "whyItMatters", "nextStep", "sourceUrl", "lastVerified"]
OPT = ["id", "sourceName"]
ROOT = pathlib.Path(__file__).resolve().parent.parent
errors = []

def err(msg): errors.append(msg)

def load(rel):
    p = ROOT / rel
    try:
        d = json.loads(p.read_text(encoding="utf-8"))
    except FileNotFoundError:
        err(f"{rel}: file not found"); return []
    except json.JSONDecodeError as e:
        err(f"{rel}: not valid JSON ({e})"); return []
    if not isinstance(d, dict) or not isinstance(d.get("stories"), list):
        err(f'{rel}: must be an object with a "stories" list'); return []
    return d["stories"]

def real_date(s):
    if not isinstance(s, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", s): return False
    try: datetime.date.fromisoformat(s); return True
    except ValueError: return False

def key(s): return s["sourceUrl"].rstrip("/").lower()

def check(rel, stories):
    seen, ids = set(), set()
    for i, s in enumerate(stories):
        tag = f"{rel} story {i+1}"
        if not isinstance(s, dict): err(f"{tag}: not an object"); continue
        name = s.get("headline", "")[:40] if isinstance(s.get("headline"), str) else ""
        tag += f' ("{name}")' if name else ""
        for f in REQ:
            if not isinstance(s.get(f), str) or not s[f].strip(): err(f"{tag}: missing or empty '{f}'")
        for f in s:
            if f not in REQ + OPT: err(f"{tag}: unknown field '{f}'")
        if s.get("category") not in CATS: err(f"{tag}: category must be one of {CATS}")
        for f in ("published", "lastVerified"):
            if f in s and not real_date(s[f]): err(f"{tag}: '{f}' must be a real YYYY-MM-DD date")
        u = s.get("sourceUrl")
        if isinstance(u, str) and not re.match(r"https?://", u, re.I): err(f"{tag}: sourceUrl must start with http:// or https://")
        if isinstance(u, str) and u.strip():
            k = key(s)
            if k in seen: err(f"{tag}: duplicate sourceUrl in this file")
            seen.add(k)
        if "id" in s:
            if s["id"] in ids: err(f"{tag}: duplicate id '{s['id']}'")
            ids.add(s["id"])

featured = load("news/news.json")
archive = load("news/archive.json")
check("news/news.json", featured)
check("news/archive.json", archive)
if len(featured) > 5: err(f"news/news.json: has {len(featured)} stories, the limit is 5")
arch_keys = {key(s) for s in archive if isinstance(s, dict) and isinstance(s.get("sourceUrl"), str)}
for s in featured:
    if isinstance(s, dict) and isinstance(s.get("sourceUrl"), str) and key(s) not in arch_keys:
        err(f'news/news.json: featured story "{s.get("headline","")[:50]}" is not in news/archive.json. Add it to the archive first.')

if errors:
    print("PROBLEMS FOUND:")
    for e in errors: print(" -", e)
    sys.exit(1)
print(f"OK: {len(featured)} featured, {len(archive)} in the archive.")
