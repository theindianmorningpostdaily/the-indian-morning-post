-- ============================================================================
-- The Indian Morning Post — Database Schema (Supabase / PostgreSQL)
-- Run this in the Supabase SQL Editor once during setup.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- categories: fixed taxonomy (kept as a table so the frontend can list them)
-- ----------------------------------------------------------------------------
create table if not exists categories (
  slug        text primary key,
  name        text not null,
  description text,
  sort_order  int  not null default 0
);

insert into categories (slug, name, description, sort_order) values
  ('world',       'World',       'Global affairs and international news',      1),
  ('politics',    'Politics',    'Governments, elections, and diplomacy',      2),
  ('business',    'Business',    'Markets, economy, trade, and finance',       3),
  ('technology',  'Technology',  'Innovation, AI, and the digital world',      4),
  ('science',     'Science',     'Research, space, and discovery',             5),
  ('health',      'Health',      'Public health, medicine, and wellbeing',     6),
  ('environment', 'Environment', 'Climate, energy, and the natural world',     7)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- raw_items: every item pulled from RSS. Acts as the dedupe + verification
-- ledger so the same story is never collected or published twice.
-- ----------------------------------------------------------------------------
create table if not exists raw_items (
  id            uuid primary key default gen_random_uuid(),
  source_name   text not null,
  source_url    text,
  url           text unique not null,
  title         text not null,
  summary       text,
  content       text,
  fingerprint   text not null,            -- normalized hash for dedupe
  cluster_key   text,                     -- assigned when grouped with siblings
  published_at  timestamptz,
  collected_at  timestamptz not null default now()
);

create index if not exists raw_items_fingerprint_idx on raw_items (fingerprint);
create index if not exists raw_items_cluster_idx      on raw_items (cluster_key);
create index if not exists raw_items_collected_idx    on raw_items (collected_at desc);

-- ----------------------------------------------------------------------------
-- articles: the published, AI-generated journalism.
-- ----------------------------------------------------------------------------
create table if not exists articles (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  headline          text not null,
  subtitle          text,
  summary           text,
  body              text not null,                 -- markdown
  category          text not null references categories(slug),
  seo_title         text,
  meta_description  text,
  keywords          text[] default '{}',
  image_url         text,
  image_prompt      text,
  author            text not null default 'The Indian Morning Post Editorial Desk',
  status            text not null default 'published',  -- draft | published
  is_breaking       boolean not null default false,
  credibility_score numeric(4,2) default 0,         -- 0..10
  source_count      int default 0,
  read_minutes      int default 3,
  cluster_key       text,                           -- ties back to raw_items
  published_at      timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create index if not exists articles_published_idx on articles (published_at desc);
create index if not exists articles_category_idx   on articles (category, published_at desc);
create index if not exists articles_status_idx     on articles (status);
create index if not exists articles_breaking_idx   on articles (is_breaking) where is_breaking;
create index if not exists articles_cluster_idx    on articles (cluster_key);

-- Full-text search index over headline + summary + body
alter table articles
  add column if not exists search_tsv tsvector
  generated always as (
    to_tsvector('english',
      coalesce(headline,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(body,''))
  ) stored;
create index if not exists articles_search_idx on articles using gin (search_tsv);

-- ----------------------------------------------------------------------------
-- article_sources: internal source attribution (compliance). Never shown
-- verbatim to readers — proves a story was verified across trusted outlets.
-- ----------------------------------------------------------------------------
create table if not exists article_sources (
  id           uuid primary key default gen_random_uuid(),
  article_id   uuid not null references articles(id) on delete cascade,
  source_name  text not null,
  source_url   text,
  source_title text,
  credibility  int default 0,                 -- 0..10 source-trust score
  fetched_at   timestamptz not null default now()
);

create index if not exists article_sources_article_idx on article_sources (article_id);

-- ============================================================================
-- Row Level Security
-- Public (anon) readers may only read PUBLISHED articles and the taxonomy.
-- The pipeline writes with the service_role key, which bypasses RLS.
-- ============================================================================
alter table articles        enable row level security;
alter table article_sources enable row level security;
alter table categories      enable row level security;
alter table raw_items       enable row level security;

drop policy if exists "public reads published articles" on articles;
create policy "public reads published articles"
  on articles for select
  using (status = 'published');

drop policy if exists "public reads categories" on categories;
create policy "public reads categories"
  on categories for select
  using (true);

-- article_sources and raw_items are internal: no anon policy => no anon access.
-- (service_role bypasses RLS, so the pipeline can still read/write them.)

-- ----------------------------------------------------------------------------
-- Helper view: latest published articles with a couple of derived fields.
-- ----------------------------------------------------------------------------
create or replace view published_articles as
  select id, slug, headline, subtitle, summary, category, image_url, author,
         is_breaking, read_minutes, keywords, seo_title, meta_description,
         published_at
  from articles
  where status = 'published'
  order by published_at desc;
