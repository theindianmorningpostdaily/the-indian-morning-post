import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/supabase";

export const dynamic = "force-static";

const CONTACT_EMAIL = "theindianmorningpostdaily@gmail.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${SITE_NAME}.`,
  alternates: { canonical: `${SITE_URL}/privacy/` },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl py-8">
      <h1 className="font-serif text-3xl font-black sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: June 2026</p>

      <div className="prose-article mt-6">
        <p>
          This Privacy Policy explains how {SITE_NAME} (&quot;we&quot;,
          &quot;us&quot;, &quot;our&quot;) handles information when you visit our
          website. By using this site, you agree to the practices described here.
        </p>

        <h2>Information We Collect</h2>
        <p>
          We do not require you to create an account or submit personal
          information to read our content. We may collect limited,
          non-identifying technical information automatically — such as your
          browser type, device, approximate region, and the pages you visit —
          to understand how the site is used and to improve it.
        </p>

        <h2>Cookies</h2>
        <p>
          Our site may use cookies and similar technologies to remember your
          preferences (for example, light or dark mode) and to measure traffic.
          You can disable cookies in your browser settings; some features may
          not work as intended if you do.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          We rely on reputable third-party providers to operate the site,
          including hosting and content-delivery services. These providers may
          process limited technical data on our behalf. If we display
          advertising in the future (for example, through Google AdSense),
          third-party vendors may use cookies to serve ads based on your prior
          visits to this and other websites. You can learn more and opt out via{" "}
          <a href="https://www.google.com/settings/ads" rel="nofollow noopener" target="_blank">
            Google Ads Settings
          </a>{" "}
          and{" "}
          <a href="https://www.aboutads.info" rel="nofollow noopener" target="_blank">
            aboutads.info
          </a>
          .
        </p>

        <h2>Analytics</h2>
        <p>
          We may use privacy-respecting analytics to measure aggregate traffic.
          This data is not used to personally identify you.
        </p>

        <h2>External Links</h2>
        <p>
          Our site and articles may reference or link to external websites. We
          are not responsible for the content or privacy practices of those
          sites.
        </p>

        <h2>Children&apos;s Privacy</h2>
        <p>
          Our site is intended for a general audience and is not directed at
          children under 13. We do not knowingly collect personal information
          from children.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page with an updated date.
        </p>

        <h2>Contact</h2>
        <p>
          If you have any questions about this Privacy Policy, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </div>
    </article>
  );
}
