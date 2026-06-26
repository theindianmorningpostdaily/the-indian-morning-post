import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/supabase";

export const dynamic = "force-static";

const CONTACT_EMAIL = "theindianmorningpostdaily@gmail.com";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with the ${SITE_NAME} editorial team.`,
  alternates: { canonical: `${SITE_URL}/contact/` },
};

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-3xl py-8">
      <h1 className="font-serif text-3xl font-black sm:text-4xl">Contact Us</h1>

      <div className="prose-article mt-6">
        <p>
          We&apos;d love to hear from you. Whether it&apos;s feedback, a
          correction, a story tip, or a partnership enquiry, please reach out
          using the email below and we&apos;ll get back to you.
        </p>

        <div className="my-6 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
          <p className="m-0 text-sm uppercase tracking-wide text-neutral-500">
            Email
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-lg font-semibold text-accent dark:text-accent-dark"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <h2>What to contact us about</h2>
        <ul>
          <li><strong>Corrections:</strong> Spotted an error? Let us know and we&apos;ll review it promptly.</li>
          <li><strong>Feedback &amp; suggestions:</strong> Tell us how we can improve.</li>
          <li><strong>Story tips:</strong> Share news you think we should cover.</li>
          <li><strong>Advertising &amp; partnerships:</strong> Interested in working with us? Get in touch.</li>
        </ul>

        <p className="text-sm text-neutral-500">
          We aim to respond to all genuine enquiries as soon as possible.
        </p>
      </div>
    </article>
  );
}
