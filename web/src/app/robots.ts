import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/supabase";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/news.xml`],
    host: SITE_URL,
  };
}
