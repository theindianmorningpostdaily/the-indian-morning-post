import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/supabase";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `Disclaimer for ${SITE_NAME}.`,
  alternates: { canonical: `${SITE_URL}/disclaimer/` },
};

export default function DisclaimerPage() {
  return (
    <article className="mx-auto max-w-3xl py-8">
      <h1 className="font-serif text-3xl font-black sm:text-4xl">Disclaimer</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: June 2026</p>

      <div className="prose-article mt-6">
        <p>
          The information published on {SITE_NAME} is for general informational
          purposes only. While we aim for accuracy and draw on reputable sources,
          we make no warranties about the completeness, reliability, or accuracy
          of any information on the Site.
        </p>

        <h2>No Professional Advice</h2>
        <p>
          Our content does not constitute financial, legal, medical, or other
          professional advice. Always consult a qualified professional before
          making decisions based on information you read here.
        </p>

        <h2>Developing Stories</h2>
        <p>
          News evolves. Details, figures, and facts in a story may change as
          events develop. We update coverage where possible, but cannot guarantee
          that every article reflects the very latest information at all times.
        </p>

        <h2>External Content</h2>
        <p>
          Featured images may be illustrative. Links to external sites are
          provided for convenience; we do not endorse and are not responsible for
          their content.
        </p>

        <h2>Use at Your Own Risk</h2>
        <p>
          Any reliance you place on information from this Site is strictly at your
          own risk. {SITE_NAME} will not be liable for any loss or damage arising
          from the use of this Site.
        </p>

        <h2>Contact</h2>
        <p>
          For any questions about this Disclaimer, visit our{" "}
          <a href="/contact/">Contact</a> page.
        </p>
      </div>
    </article>
  );
}
