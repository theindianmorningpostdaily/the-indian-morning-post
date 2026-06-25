# The Indian Morning Post

> **Trusted Global News, Every Morning** — a fully automated, AI-powered world-news
> platform that runs on free tiers and open-source tools, targeting **₹0/month**.

Every morning the system collects world news from trusted RSS sources, removes
duplicates, **verifies each story across 2+ reputable outlets**, writes an
**original** journalism-style article with Gemini, generates a featured image,
and publishes the top 4–5 stories — with **no manual intervention**.

---

## Architecture (zero-budget serverless)

```
┌────────────────────────────────────────────────────────────────┐
│  GitHub Actions  (cron: 04:00 IST daily + optional 2-hourly)    │
│                                                                  │
│  pipeline/main.py                                                │
│    1. collect   →  pull last 24h from trusted RSS feeds          │
│    2. dedupe    →  fuzzy-cluster items about the same event      │
│    3. verify    →  keep stories with ≥2 trusted sources          │
│    4. rank      →  score by global/political/economic/etc.       │
│    5. generate  →  Gemini writes ORIGINAL article + SEO meta     │
│    6. image     →  Pollinations.ai featured image (free, no key) │
│    7. publish   →  write to Supabase + store source references   │
│    8. rebuild   →  ping Cloudflare Pages deploy hook             │
└───────────────────────────┬────────────────────────────────────┘
                            │  (service_role key, server-side)
                            ▼
                  ┌────────────────────┐
                  │  Supabase Postgres │  articles, article_sources,
                  │  (free tier)       │  raw_items, categories  + RLS
                  └─────────┬──────────┘
                            │  (anon key, RLS = published only)
                            ▼
              ┌──────────────────────────────┐
              │  Next.js (static export)     │  homepage, article,
              │  on Cloudflare Pages (free)  │  category, search, SEO
              └──────────────────────────────┘
```

**Why this is ₹0/month**

| Concern        | Free tool used                         |
| -------------- | -------------------------------------- |
| News sources   | Public RSS feeds (Reuters, BBC, AP, Al Jazeera, DW, UN, WHO, NASA…) |
| Automation     | GitHub Actions (cron)                  |
| AI writing     | Google Gemini free tier                |
| Images         | Pollinations.ai (no key, no signup)    |
| Database + API | Supabase free tier (Postgres + REST)   |
| Hosting        | Cloudflare Pages (static, global CDN)  |

No VPS, no Redis bill, no paid news API, no paid automation platform.

---

## Repository layout

```
the-indian-post/
├── db/
│   └── schema.sql               # run once in Supabase SQL editor
├── pipeline/                    # Python automation (runs in GitHub Actions)
│   ├── main.py                  # orchestrator
│   ├── config.py                # env-driven configuration
│   ├── sources.py               # trusted RSS feed list + credibility scores
│   ├── requirements.txt
│   └── src/
│       ├── collect.py           # 1. RSS collection
│       ├── dedupe.py            # 2. fuzzy clustering / de-duplication
│       ├── verify.py            # 3. multi-source verification
│       ├── rank.py              # 4. importance ranking
│       ├── generate.py          # 5. Gemini article generation
│       ├── images.py            # 5b. Pollinations featured image
│       ├── publish.py           # 6. write to Supabase
│       ├── db.py                # Supabase REST helpers
│       ├── models.py            # dataclasses
│       └── utils.py             # fingerprints, html-strip, etc.
├── web/                         # Next.js frontend (static export)
│   └── src/
│       ├── app/                 # routes: /, /article/[slug], /category/[c], /search, sitemap, robots
│       ├── components/          # Header, Footer, BreakingTicker, ArticleCard, ThemeToggle
│       └── lib/                 # supabase client, queries, types, formatting
├── .github/workflows/
│   ├── publish-daily.yml        # 04:00 IST daily edition
│   └── breaking-news.yml        # optional 2-hourly breaking check
├── DEPLOY.md                    # step-by-step setup (free tiers)
└── README.md
```

---

## Quick start

See **[DEPLOY.md](DEPLOY.md)** for the full free-tier setup. In short:

1. Create a Supabase project → run `db/schema.sql`.
2. Get a free Gemini API key.
3. Push this repo to GitHub → add secrets → workflows run on schedule.
4. Deploy `web/` to Cloudflare Pages → add the deploy hook as a secret.

### Run the pipeline locally

```bash
cd pipeline
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # fill in your keys
DRY_RUN=true python main.py # generate without writing to the DB
```

### Run the frontend locally

```bash
cd web
npm install
cp .env.example .env.local  # add NEXT_PUBLIC_SUPABASE_URL + ANON_KEY
npm run dev                 # http://localhost:3000
```

---

## Compliance & editorial integrity

- **No plagiarism.** Source text is never republished. Gemini is instructed to
  write original prose from extracted facts only, and to decline when sourcing
  is too thin (`publishable: false`).
- **Verification.** A story is published only if corroborated by ≥2 trusted
  outlets (or a single primary source such as WHO/Reuters at top credibility).
- **Attribution.** Every article stores its source references internally in
  `article_sources` (not shown verbatim to readers) for accountability.
- **Fact-based only.** Rumors and social-media-only items are never ingested —
  the feed list contains wire services, public broadcasters, and official bodies.

---

## Tuning

All behaviour is environment-driven (`pipeline/config.py`):

| Variable        | Default | Meaning                                  |
| --------------- | ------- | ---------------------------------------- |
| `MAX_ARTICLES`  | `5`     | stories published per daily run          |
| `MIN_SOURCES`   | `2`     | trusted sources required to verify       |
| `LOOKBACK_HOURS`| `24`    | how far back news is considered          |
| `DRY_RUN`       | `false` | generate without writing to the database |

Add or remove feeds in `pipeline/sources.py`. Change categories in both
`db/schema.sql` and `web/src/lib/types.ts`.
