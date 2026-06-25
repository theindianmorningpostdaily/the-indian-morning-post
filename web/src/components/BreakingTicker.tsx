import Link from "next/link";
import type { ArticleCard } from "@/lib/types";

export default function BreakingTicker({ items }: { items: ArticleCard[] }) {
  if (!items.length) return null;
  // Duplicate the list so the marquee loops seamlessly.
  const loop = [...items, ...items];

  return (
    <div className="flex items-center gap-3 overflow-hidden border-y border-neutral-200 bg-ink py-2 text-sm text-white dark:border-neutral-800">
      <span className="ml-4 shrink-0 rounded bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
        Breaking
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-ticker flex w-max gap-10 whitespace-nowrap">
          {loop.map((a, i) => (
            <Link
              key={`${a.id}-${i}`}
              href={`/article/${a.slug}/`}
              className="hover:text-accent-dark"
            >
              {a.headline}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
