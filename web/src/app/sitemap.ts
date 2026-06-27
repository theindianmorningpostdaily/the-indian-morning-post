import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/queries";
import { CATEGORIES } from "@/lib/types";
import { SITE_URL } from "@/lib/supabase";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs();

  const articles: MetadataRoute.Sitemap = slugs.map((s) => ({
    url: `${SITE_URL}/article/${s.slug}/`,
    lastModified: s.published_at,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const categories: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}/`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/about/`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/contact/`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy/`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms/`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/disclaimer/`, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    ...categories,
    ...pages,
    ...articles,
  ];
}
