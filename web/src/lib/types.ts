export type Category = {
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
};

export type Article = {
  id: string;
  slug: string;
  headline: string;
  subtitle: string | null;
  summary: string | null;
  body: string;
  category: string;
  seo_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  image_url: string | null;
  author: string;
  is_breaking: boolean;
  read_minutes: number;
  source_count?: number;
  credibility_score?: number;
  published_at: string;
};

// Lighter shape for list/card views (no body).
export type ArticleCard = Omit<Article, "body" | "seo_title" | "meta_description">;

export const CATEGORIES: Category[] = [
  { slug: "india", name: "India", description: "India news & current affairs", sort_order: 0 },
  { slug: "world", name: "World", description: "Global affairs", sort_order: 1 },
  { slug: "politics", name: "Politics", description: "Governments & diplomacy", sort_order: 2 },
  { slug: "business", name: "Business", description: "Markets & economy", sort_order: 3 },
  { slug: "technology", name: "Technology", description: "Innovation & AI", sort_order: 4 },
  { slug: "science", name: "Science", description: "Research & discovery", sort_order: 5 },
  { slug: "health", name: "Health", description: "Medicine & wellbeing", sort_order: 6 },
  { slug: "environment", name: "Environment", description: "Climate & nature", sort_order: 7 },
];
