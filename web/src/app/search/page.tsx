"use client";
import { useState, type FormEvent } from "react";
import { searchArticles } from "@/lib/queries";
import type { ArticleCard as TCard } from "@/lib/types";
import ArticleCard from "@/components/ArticleCard";

// Static site has no server search — query Supabase directly from the browser
// (anon key, RLS-restricted to published articles).
export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<TCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    const r = await searchArticles(q);
    setResults(r);
    setLoading(false);
  }

  return (
    <div className="py-6">
      <h1 className="font-serif text-3xl font-black">Search</h1>
      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search world news…"
          className="flex-1 rounded-md border border-neutral-300 px-4 py-2 outline-none focus:border-accent dark:border-neutral-700 dark:bg-neutral-900"
          autoFocus
        />
        <button
          type="submit"
          className="rounded-md bg-accent px-5 py-2 font-medium text-white hover:bg-accent/90"
        >
          Search
        </button>
      </form>

      <div className="mt-8">
        {loading && <p className="text-neutral-500">Searching…</p>}
        {!loading && searched && results.length === 0 && (
          <p className="text-neutral-500">No results for “{q}”.</p>
        )}
        {results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-neutral-500">
              {results.length} result{results.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
