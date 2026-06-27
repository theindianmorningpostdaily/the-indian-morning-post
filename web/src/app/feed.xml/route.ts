import { getLatest } from "@/lib/queries";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/supabase";

export const dynamic = "force-static";

function esc(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const items = await getLatest(30);
  const body = items
    .map(
      (a) => `    <item>
      <title>${esc(a.headline)}</title>
      <link>${SITE_URL}/article/${a.slug}/</link>
      <guid isPermaLink="true">${SITE_URL}/article/${a.slug}/</guid>
      <category>${esc(a.category)}</category>
      <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>
      <description>${esc(a.summary ?? a.subtitle ?? "")}</description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${esc(SITE_TAGLINE)}</description>
    <language>en</language>
${body}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
