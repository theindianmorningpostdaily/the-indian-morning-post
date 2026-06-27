import { getLatest } from "@/lib/queries";
import { SITE_URL, SITE_NAME } from "@/lib/supabase";

// Google News sitemap — only articles from the last 48 hours.
export const dynamic = "force-static";

function esc(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const all = await getLatest(80);
  const recent = all.filter((a) => {
    const ageHours = (Date.now() - new Date(a.published_at).getTime()) / 3.6e6;
    return ageHours <= 48;
  });

  const urls = recent
    .map(
      (a) => `  <url>
    <loc>${SITE_URL}/article/${a.slug}/</loc>
    <news:news>
      <news:publication>
        <news:name>${esc(SITE_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(a.published_at).toISOString()}</news:publication_date>
      <news:title>${esc(a.headline)}</news:title>
    </news:news>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
