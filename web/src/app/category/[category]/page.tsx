import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getByCategory } from "@/lib/queries";
import { CATEGORIES } from "@/lib/types";
import { SITE_NAME, SITE_URL } from "@/lib/supabase";
import { categoryName } from "@/lib/format";
import ArticleCard from "@/components/ArticleCard";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const cat = CATEGORIES.find((c) => c.slug === params.category);
  if (!cat) return { title: "Not found" };
  return {
    title: `${cat.name} News`,
    description: `${cat.name} news from ${SITE_NAME} — ${cat.description ?? ""}`,
    alternates: { canonical: `${SITE_URL}/category/${cat.slug}/` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const cat = CATEGORIES.find((c) => c.slug === params.category);
  if (!cat) notFound();

  const articles = await getByCategory(cat.slug, 30);

  return (
    <div className="py-6">
      <header className="mb-6 border-b-2 border-accent pb-2">
        <h1 className="font-serif text-3xl font-black">{cat.name}</h1>
        {cat.description && (
          <p className="mt-1 text-neutral-500">{cat.description}</p>
        )}
      </header>

      {articles.length === 0 ? (
        <p className="py-16 text-center text-neutral-500">
          No {cat.name.toLowerCase()} stories yet. Check back after the next
          morning edition.
        </p>
      ) : (
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
