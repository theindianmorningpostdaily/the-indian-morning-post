import { supabase, isConfigured } from "./supabase";
import { SAMPLE_ARTICLES } from "./sampleData";
import type { Article, ArticleCard } from "./types";

const CARD_FIELDS =
  "id,slug,headline,subtitle,summary,category,image_url,author,is_breaking,read_minutes,keywords,published_at";

// In demo mode (no Supabase configured) every query is served from bundled
// sample articles so the design can be previewed before deployment.
const DEMO = !isConfigured;
const demoSorted = () =>
  [...SAMPLE_ARTICLES].sort(
    (a, b) => +new Date(b.published_at) - +new Date(a.published_at)
  );

export async function getLatest(limit = 30): Promise<ArticleCard[]> {
  if (DEMO) return demoSorted().slice(0, limit);
  const { data, error } = await supabase
    .from("articles")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[queries.getLatest]", error.message);
    return [];
  }
  return (data ?? []) as ArticleCard[];
}

export async function getByCategory(
  category: string,
  limit = 24
): Promise<ArticleCard[]> {
  if (DEMO)
    return demoSorted().filter((a) => a.category === category).slice(0, limit);
  const { data, error } = await supabase
    .from("articles")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .eq("category", category)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[queries.getByCategory]", error.message);
    return [];
  }
  return (data ?? []) as ArticleCard[];
}

export async function getBreaking(limit = 8): Promise<ArticleCard[]> {
  if (DEMO) return demoSorted().filter((a) => a.is_breaking).slice(0, limit);
  const { data, error } = await supabase
    .from("articles")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .eq("is_breaking", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as ArticleCard[];
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (DEMO) return SAMPLE_ARTICLES.find((a) => a.slug === slug) ?? null;
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .single();
  if (error) {
    console.error("[queries.getArticle]", error.message);
    return null;
  }
  return data as Article;
}

export async function getAllSlugs(): Promise<{ slug: string; category: string; published_at: string }[]> {
  if (DEMO)
    return SAMPLE_ARTICLES.map((a) => ({
      slug: a.slug,
      category: a.category,
      published_at: a.published_at,
    }));
  const { data, error } = await supabase
    .from("articles")
    .select("slug,category,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(5000);
  if (error) return [];
  return data ?? [];
}

// Client-side search (static site has no server). Queries Supabase directly.
export async function searchArticles(q: string, limit = 30): Promise<ArticleCard[]> {
  const term = q.trim();
  if (!term) return [];
  if (DEMO) {
    const t = term.toLowerCase();
    return demoSorted()
      .filter(
        (a) =>
          a.headline.toLowerCase().includes(t) ||
          (a.summary ?? "").toLowerCase().includes(t)
      )
      .slice(0, limit);
  }
  const { data, error } = await supabase
    .from("articles")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .or(`headline.ilike.%${term}%,summary.ilike.%${term}%`)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[queries.searchArticles]", error.message);
    return [];
  }
  return (data ?? []) as ArticleCard[];
}
