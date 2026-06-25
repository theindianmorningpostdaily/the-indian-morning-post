import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// When Supabase isn't configured (e.g. local preview before setup), the app
// falls back to bundled sample articles so you can see the design immediately.
export const isConfigured = Boolean(url && anon);

if (!isConfigured) {
  console.warn(
    "[supabase] URL / ANON_KEY not set — running in DEMO MODE with sample data."
  );
}

// Anon client. RLS restricts it to published articles + categories only.
// In demo mode we still construct a client with harmless placeholders so the
// build doesn't throw — it's never actually queried (see queries.ts DEMO path).
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anon || "placeholder-anon-key",
  { auth: { persistSession: false } }
);

// Override via NEXT_PUBLIC_SITE_URL if you later add a custom domain.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://the-indian-morning-post.theindianmorningpostdaily.workers.dev";

export const SITE_NAME = "The Indian Morning Post";
export const SITE_TAGLINE = "Trusted Global News, Every Morning";
