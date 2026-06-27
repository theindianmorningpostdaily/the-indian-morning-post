import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/supabase";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${SITE_NAME}.`,
  alternates: { canonical: `${SITE_URL}/terms/` },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl py-8">
      <h1 className="font-serif text-3xl font-black sm:text-4xl">Terms of Service</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: June 2026</p>

      <div className="prose-article mt-6">
        <p>
          By accessing and using {SITE_NAME} (the &quot;Site&quot;), you agree to
          these Terms of Service. If you do not agree, please do not use the Site.
        </p>

        <h2>Use of the Site</h2>
        <p>
          You may read and share our content for personal, non-commercial use.
          You agree not to misuse the Site, attempt to disrupt its operation, or
          use automated tools to scrape content at scale without permission.
        </p>

        <h2>Content &amp; Accuracy</h2>
        <p>
          We strive to publish accurate, fact-based news synthesized from
          reputable sources. However, news develops quickly and information may
          change. Content is provided &quot;as is&quot; for general information
          and does not constitute professional advice. See our{" "}
          <a href="/disclaimer/">Disclaimer</a> for details.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          Original articles and the overall presentation of the Site are the
          property of {SITE_NAME}. You may quote brief excerpts with attribution
          and a link, but may not republish full articles without permission.
        </p>

        <h2>External Links</h2>
        <p>
          The Site may contain links to third-party websites. We are not
          responsible for the content, policies, or practices of those sites.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, {SITE_NAME} shall not be liable
          for any damages arising from your use of, or reliance on, the Site or
          its content.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these Terms from time to time. Continued use of the Site
          after changes constitutes acceptance of the updated Terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these Terms? Reach us via our{" "}
          <a href="/contact/">Contact</a> page.
        </p>
      </div>
    </article>
  );
}
