# Deployment Guide — The Indian Morning Post (₹0/month)

This walks through standing up the entire platform on free tiers. Total cost: **₹0**.
Estimated time: ~30 minutes.

You will set up four free services:

1. **Supabase** — database + auto REST API
2. **Google AI Studio** — Gemini API key (article writing)
3. **GitHub** — repository + Actions (automation)
4. **Cloudflare Pages** — static frontend hosting

Pollinations.ai (images) needs no account.

---

## 1. Supabase (database)

1. Create a free account at <https://supabase.com> and a new project.
   Choose a region close to your readers (e.g. `Mumbai` / `Singapore`).
2. Open **SQL Editor → New query**, paste the entire contents of
   [`db/schema.sql`](db/schema.sql), and **Run**. This creates the tables,
   indexes, full-text search, and Row Level Security policies.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend, safe)
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (pipeline only — **secret!**)

> RLS ensures the anon key can read only **published** articles. The
> service_role key bypasses RLS so the pipeline can write — never expose it
> to the browser or commit it.

---

## 2. Gemini API key (article writing)

1. Visit <https://aistudio.google.com/app/apikey> and create a free API key.
2. Copy it → `GEMINI_API_KEY`.
3. The free tier of `gemini-2.0-flash` comfortably covers ~5 articles/day.
   If you hit limits, lower `MAX_ARTICLES` or switch `GEMINI_MODEL`.

---

## 3. GitHub repository + Actions (automation)

1. Create a new GitHub repository and push this project to it:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: The Indian Morning Post"
   git branch -M main
   git remote add origin https://github.com/<you>/the-indian-post.git
   git push -u origin main
   ```

2. In the repo: **Settings → Secrets and variables → Actions → New repository secret**.
   Add:

   | Secret name                  | Value                                   |
   | ---------------------------- | --------------------------------------- |
   | `SUPABASE_URL`               | your Supabase project URL               |
   | `SUPABASE_SERVICE_ROLE_KEY`  | service_role key                        |
   | `GEMINI_API_KEY`             | Gemini key                              |
   | `CF_PAGES_DEPLOY_HOOK`       | (added in step 4)                       |

   Optionally add a **variable** `GEMINI_MODEL` (e.g. `gemini-2.0-flash`).

3. The workflows are already scheduled:
   - **Publish Daily Edition** → 04:00 IST (22:30 UTC) every day.
   - **Breaking News Check** → every 2 hours (optional; disable by commenting
     out its `schedule` block).

4. Test it now: **Actions → Publish Daily Edition → Run workflow**. Watch the
   logs; within a couple of minutes you should see articles appear in your
   Supabase `articles` table.

> **Note on cron timing:** GitHub Actions cron runs in **UTC** and can be
> delayed a few minutes under load. `30 22 * * *` UTC = 04:00 IST.

---

## 4. Cloudflare Pages (frontend hosting)

1. Create a free account at <https://pages.cloudflare.com>.
2. **Create application → Pages → Connect to Git** → select your repo.
3. Build settings:
   - **Framework preset:** `Next.js (Static HTML Export)`
   - **Build command:** `npm install && npm run build`
   - **Build output directory:** `out`
   - **Root directory:** `web`
4. Add environment variables (Pages → Settings → Environment variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your `*.pages.dev` URL, or custom domain)
5. Deploy. Once live, copy your site URL.
6. **Deploy hook:** Pages → Settings → Builds & deployments → **Add deploy hook**
   (name it `pipeline-rebuild`). Copy the URL and save it as the GitHub secret
   `CF_PAGES_DEPLOY_HOOK`. Now every successful pipeline run automatically
   rebuilds the static site with the new articles.

---

## 5. Verify the end-to-end flow

1. Trigger **Publish Daily Edition** manually.
2. Confirm rows appear in Supabase `articles`.
3. Confirm Cloudflare Pages starts a new build (deploy hook fired).
4. Open your site — the new stories should be on the homepage.

---

## 6. SEO & Google News

- `sitemap.xml` and `robots.txt` are generated automatically.
- Each article emits **NewsArticle JSON-LD**, Open Graph, Twitter, canonical,
  and meta-description tags.
- Submit your site to **Google Search Console** and your sitemap
  (`https://yourdomain/sitemap.xml`).
- For Google News, apply via **Google Publisher Center** once you have a
  steady publishing history and an `About`/contact presence.

---

## Cost summary

| Service          | Tier      | Monthly cost |
| ---------------- | --------- | ------------ |
| Supabase         | Free      | ₹0           |
| Gemini API       | Free      | ₹0           |
| GitHub Actions   | Free      | ₹0           |
| Cloudflare Pages | Free      | ₹0           |
| Pollinations.ai  | Free      | ₹0           |
| **Total**        |           | **₹0**       |

### Staying inside free limits

- Supabase free DB is 500 MB — plenty for tens of thousands of text articles.
  Images are external URLs (Pollinations/Cloudflare), not stored in the DB.
- Keep `MAX_ARTICLES` at 4–5/day to stay well within Gemini's free quota.
- Cloudflare Pages free tier allows 500 builds/month — the daily edition plus
  optional 2-hourly breaking checks stay under that.

---

## Optional upgrade path (if you later move to a VPS)

The pipeline is plain Python and the data layer is isolated in `src/db.py`. To
run on a VPS with PostgreSQL + Redis + FastAPI later, you only swap `db.py` for
a direct Postgres client and add a FastAPI read API — the collect/verify/
generate/publish stages are unchanged. Until then, the serverless setup above
keeps everything at ₹0.
