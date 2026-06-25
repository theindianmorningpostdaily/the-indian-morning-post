import Link from "next/link";
import { getLatest, getBreaking } from "@/lib/queries";
import { CATEGORIES, type ArticleCard as TCard } from "@/lib/types";
import ArticleCard from "@/components/ArticleCard";
import BreakingTicker from "@/components/BreakingTicker";

// Static export: built once per pipeline rebuild.
export const dynamic = "force-static";

export default async function HomePage() {
  const [latest, breaking] = await Promise.all([getLatest(40), getBreaking(8)]);

  if (!latest.length) {
    return (
      <div className="py-24 text-center text-neutral-500">
        <h2 className="font-serif text-2xl">No stories published yet.</h2>
        <p className="mt-2 text-sm">
          The newsroom publishes every morning at 04:00. Check back soon.
        </p>
      </div>
    );
  }

  const [lead, ...rest] = latest;
  const secondary = rest.slice(0, 4);
  const grid = rest.slice(4, 13);
  const tickerItems = breaking.length ? breaking : latest.slice(0, 6);

  // Group remaining by category for the section blocks.
  const byCategory: Record<string, TCard[]> = {};
  for (const a of latest) {
    (byCategory[a.category] ??= []).push(a);
  }

  return (
    <div>
      <BreakingTicker items={tickerItems} />

      {/* Hero */}
      <section className="grid gap-8 py-8 lg:grid-cols-[1.6fr_1fr]">
        <ArticleCard article={lead} size="lg" />
        <div className="flex flex-col">
          <h2 className="mb-2 border-b-2 border-accent pb-1 font-serif text-sm font-bold uppercase tracking-wide">
            Top Stories
          </h2>
          {secondary.map((a) => (
            <ArticleCard key={a.id} article={a} size="sm" />
          ))}
        </div>
      </section>

      {/* Featured grid */}
      {grid.length > 0 && (
        <section className="border-t border-neutral-200 py-8 dark:border-neutral-800">
          <h2 className="mb-4 font-serif text-lg font-bold uppercase tracking-wide">
            Latest
          </h2>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {grid.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* Category sections */}
      {CATEGORIES.map((cat) => {
        const items = (byCategory[cat.slug] ?? []).slice(0, 4);
        if (items.length === 0) return null;
        return (
          <section
            key={cat.slug}
            className="border-t border-neutral-200 py-8 dark:border-neutral-800"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold uppercase tracking-wide">
                {cat.name}
              </h2>
              <Link
                href={`/category/${cat.slug}/`}
                className="text-sm text-accent hover:underline dark:text-accent-dark"
              >
                More →
              </Link>
            </div>
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
