import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getArticle, getAllSlugs, getByCategory } from "@/lib/queries";
import { SITE_NAME, SITE_URL } from "@/lib/supabase";
import { categoryName, formatDateTime } from "@/lib/format";
import ArticleCard from "@/components/ArticleCard";
import ShareButtons from "@/components/ShareButtons";
import ReadingProgress from "@/components/ReadingProgress";

export const dynamic = "force-static";

// Pre-render every published article at build time (static export).
export async function generateStaticParams() {
  const rows = await getAllSlugs();
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: "Not found" };
  const url = `${SITE_URL}/article/${article.slug}/`;
  return {
    title: article.seo_title ?? article.headline,
    description: article.meta_description ?? article.summary ?? "",
    keywords: article.keywords ?? [],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.headline,
      description: article.meta_description ?? article.summary ?? "",
      url,
      images: article.image_url ? [{ url: article.image_url }] : [],
      publishedTime: article.published_at,
      authors: [article.author],
    },
    twitter: {
      card: "summary_large_image",
      title: article.headline,
      images: article.image_url ? [article.image_url] : [],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  const related = (await getByCategory(article.category, 5))
    .filter((a) => a.slug !== article.slug)
    .slice(0, 4);

  // NewsArticle schema for Google News / rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.headline,
    description: article.meta_description ?? article.summary,
    image: article.image_url ? [article.image_url] : [],
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/article/${article.slug}/`,
    },
    articleSection: categoryName(article.category),
    keywords: (article.keywords ?? []).join(", "),
  };

  // Breadcrumb schema: Home > Category > Article
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName(article.category),
        item: `${SITE_URL}/category/${article.category}/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.headline,
        item: `${SITE_URL}/article/${article.slug}/`,
      },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl py-6">
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-4 text-xs text-neutral-400">
        <Link href="/" className="hover:text-accent">Home</Link>
        {" / "}
        <Link href={`/category/${article.category}/`} className="hover:text-accent">
          {categoryName(article.category)}
        </Link>
      </nav>

      <p className="text-xs font-bold uppercase tracking-wide text-accent dark:text-accent-dark">
        {categoryName(article.category)}
        {article.is_breaking && (
          <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-white">
            Breaking
          </span>
        )}
      </p>

      <h1 className="mt-2 font-serif text-3xl font-black leading-tight sm:text-4xl">
        {article.headline}
      </h1>
      {article.subtitle && (
        <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">
          {article.subtitle}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-neutral-200 py-3 text-sm text-neutral-500 dark:border-neutral-800">
        <span className="font-medium text-ink dark:text-neutral-200">
          {article.author}
        </span>
        <span>·</span>
        <time dateTime={article.published_at}>
          {formatDateTime(article.published_at)}
        </time>
        <span>·</span>
        <span>{article.read_minutes} min read</span>
      </div>

      <div className="mt-4">
        <ShareButtons
          url={`${SITE_URL}/article/${article.slug}/`}
          title={article.headline}
        />
      </div>

      {article.image_url && (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image_url}
            alt={article.headline}
            className="w-full rounded-lg"
          />
          <figcaption className="mt-2 text-xs text-neutral-400">
            Illustrative image.
          </figcaption>
        </figure>
      )}

      <div className="prose-article">
        <ReactMarkdown>{article.body}</ReactMarkdown>
      </div>

      <div className="mt-8 border-t border-neutral-200 pt-5 dark:border-neutral-800">
        <ShareButtons
          url={`${SITE_URL}/article/${article.slug}/`}
          title={article.headline}
        />
      </div>

      {article.keywords && article.keywords.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {article.keywords.map((k) => (
            <span
              key={k}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            >
              {k}
            </span>
          ))}
        </div>
      )}

      <p className="mt-8 rounded-md bg-neutral-50 p-4 text-xs leading-5 text-neutral-500 dark:bg-neutral-900">
        Reporting by the {SITE_NAME} Editorial Desk.
      </p>

      {related.length > 0 && (
        <section className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <h2 className="mb-4 font-serif text-lg font-bold uppercase tracking-wide">
            Related in {categoryName(article.category)}
          </h2>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
