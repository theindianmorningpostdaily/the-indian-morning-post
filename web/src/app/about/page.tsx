import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/supabase";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About Us",
  description: `About ${SITE_NAME} — our mission to deliver trusted, verified world news every morning.`,
  alternates: { canonical: `${SITE_URL}/about/` },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl py-8">
      <h1 className="font-serif text-3xl font-black sm:text-4xl">About Us</h1>
      <p className="mt-2 text-lg text-accent dark:text-accent-dark">{SITE_TAGLINE}</p>

      <div className="prose-article mt-6">
        <p>
          <strong>{SITE_NAME}</strong> is an independent digital newspaper
          dedicated to bringing readers clear, accurate and trustworthy world
          news every morning. We cover the stories that shape our world —
          across world affairs, politics, business, technology, science, health
          and the environment.
        </p>

        <h2>Our Mission</h2>
        <p>
          In an age of information overload, our goal is simple: to help you
          understand what matters. We focus on the most globally significant
          developments and present them in a concise, readable and neutral way —
          so you can start your day well informed.
        </p>

        <h2>Our Editorial Values</h2>
        <ul>
          <li>
            <strong>Trusted sources.</strong> Our reporting draws on facts from
            reputable international news organizations and official bodies.
          </li>
          <li>
            <strong>Verification first.</strong> We cross-check important stories
            against multiple independent sources before publishing, and we do
            not publish rumors or unverified social-media claims.
          </li>
          <li>
            <strong>Neutral &amp; fact-based.</strong> We report the facts
            without sensationalism, in clear British/International English.
          </li>
          <li>
            <strong>Original reporting.</strong> We never copy articles. Every
            story is written in our own words.
          </li>
        </ul>

        <h2>Coverage</h2>
        <p>
          A fresh edition is published each morning, with additional updates
          through the day when major verified news breaks. Our sections span the
          full breadth of global affairs.
        </p>

        <h2>Get in Touch</h2>
        <p>
          We value our readers. For feedback, corrections, or enquiries, please
          visit our <a href="/contact/">Contact</a> page.
        </p>

        <p className="text-sm text-neutral-500">
          — The {SITE_NAME} Editorial Desk
        </p>
      </div>
    </article>
  );
}
