import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SWRegister from "@/components/SWRegister";
import OneSignalInit from "@/components/OneSignalInit";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/supabase";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "The Indian Morning Post delivers trusted, verified world news every morning — original, fact-based journalism synthesized from reputable international sources.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title: SITE_NAME },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

// Avoid a flash of the wrong theme before hydration.
const themeScript = `
(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();
`;

// Sitewide Organization + WebSite schema for richer Google results.
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  slogan: SITE_TAGLINE,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
};
const siteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
      </head>
      <body>
        <Header />
        <main className="mx-auto max-w-page px-4 py-6">{children}</main>
        <Footer />
        <BackToTop />
        <SWRegister />
        <OneSignalInit />
      </body>
    </html>
  );
}
