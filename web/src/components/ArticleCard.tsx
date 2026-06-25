import Link from "next/link";
import type { ArticleCard as TArticleCard } from "@/lib/types";
import { categoryName, formatDate } from "@/lib/format";

type Props = {
  article: TArticleCard;
  size?: "sm" | "md" | "lg";
};

export default function ArticleCard({ article, size = "md" }: Props) {
  const href = `/article/${article.slug}/`;
  const img = article.image_url ?? "";

  if (size === "lg") {
    return (
      <article className="group">
        <Link href={href}>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
            {img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt={article.headline}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
        </Link>
        <div className="mt-3">
          <CategoryTag slug={article.category} />
          <Link href={href}>
            <h2 className="mt-2 font-serif text-2xl font-bold leading-snug group-hover:text-accent sm:text-3xl">
              {article.headline}
            </h2>
          </Link>
          {article.subtitle && (
            <p className="clamp-2 mt-2 text-neutral-600 dark:text-neutral-400">
              {article.subtitle}
            </p>
          )}
          <Meta article={article} />
        </div>
      </article>
    );
  }

  if (size === "sm") {
    return (
      <article className="group flex gap-3 border-b border-neutral-100 py-3 dark:border-neutral-800">
        <div className="flex-1">
          <CategoryTag slug={article.category} />
          <Link href={href}>
            <h3 className="clamp-3 mt-1 font-serif text-base font-semibold leading-snug group-hover:text-accent">
              {article.headline}
            </h3>
          </Link>
        </div>
        {img && (
          <Link href={href} className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={article.headline}
              loading="lazy"
              className="h-16 w-24 rounded object-cover"
            />
          </Link>
        )}
      </article>
    );
  }

  // md (default)
  return (
    <article className="group">
      <Link href={href}>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-neutral-200 dark:bg-neutral-800">
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={article.headline}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>
      </Link>
      <div className="mt-2">
        <CategoryTag slug={article.category} />
        <Link href={href}>
          <h3 className="clamp-3 mt-1 font-serif text-lg font-bold leading-snug group-hover:text-accent">
            {article.headline}
          </h3>
        </Link>
        {article.summary && (
          <p className="clamp-2 mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {article.summary}
          </p>
        )}
        <Meta article={article} />
      </div>
    </article>
  );
}

function CategoryTag({ slug }: { slug: string }) {
  return (
    <Link
      href={`/category/${slug}/`}
      className="text-xs font-bold uppercase tracking-wide text-accent dark:text-accent-dark"
    >
      {categoryName(slug)}
    </Link>
  );
}

function Meta({ article }: { article: TArticleCard }) {
  return (
    <p className="mt-2 text-xs text-neutral-400">
      {formatDate(article.published_at)} · {article.read_minutes} min read
    </p>
  );
}
