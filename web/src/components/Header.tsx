import Link from "next/link";
import { CATEGORIES } from "@/lib/types";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/supabase";
import ThemeToggle from "./ThemeToggle";

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      {/* Top utility bar */}
      <div className="border-b border-neutral-100 bg-neutral-50 text-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-page items-center justify-between px-4 py-1.5 text-neutral-500">
          <span>{todayLabel()}</span>
          <div className="flex items-center gap-3">
            <Link href="/search/" className="hover:text-accent">Search</Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="mx-auto max-w-page px-4 py-6 text-center">
        <Link href="/" className="inline-block">
          <h1 className="font-serif text-4xl font-black tracking-tight text-ink dark:text-white sm:text-5xl">
            {SITE_NAME}
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-accent dark:text-accent-dark">
            {SITE_TAGLINE}
          </p>
        </Link>
      </div>

      {/* Category nav */}
      <nav className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto flex max-w-page items-center justify-center gap-1 overflow-x-auto px-4 py-2 text-sm font-medium">
          <Link href="/" className="whitespace-nowrap px-3 py-1 hover:text-accent">
            Home
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}/`}
              className="whitespace-nowrap px-3 py-1 hover:text-accent"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
