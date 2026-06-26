import Link from "next/link";
import { CATEGORIES } from "@/lib/types";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/supabase";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto max-w-page px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-serif text-xl font-bold">{SITE_NAME}</h3>
            <p className="mt-2 text-sm text-neutral-500">{SITE_TAGLINE}</p>
            <p className="mt-4 text-xs leading-5 text-neutral-400">
              Independent world news — bringing you the stories that matter,
              every morning.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Sections
            </h4>
            <ul className="space-y-1 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}/`} className="hover:text-accent">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              About
            </h4>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/about/" className="hover:text-accent">About Us</Link>
              </li>
              <li>
                <Link href="/contact/" className="hover:text-accent">Contact</Link>
              </li>
              <li>
                <Link href="/privacy/" className="hover:text-accent">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-2 border-t border-neutral-200 pt-4 text-center text-xs text-neutral-400 dark:border-neutral-800 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <span className="flex gap-3">
            <Link href="/about/" className="hover:text-accent">About</Link>
            <Link href="/contact/" className="hover:text-accent">Contact</Link>
            <Link href="/privacy/" className="hover:text-accent">Privacy</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
