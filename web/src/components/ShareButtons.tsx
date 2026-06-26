"use client";
import { useState } from "react";

type Props = { url: string; title: string };

export default function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const links = {
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    telegram: `https://t.me/share/url?url=${u}&text=${t}`,
  };

  async function nativeOrCopy() {
    // Use the device's native share sheet when available (great on mobile).
    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      try {
        await (navigator as Navigator).share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  const btn =
    "inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-neutral-500">Share:</span>

      <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on WhatsApp">
        <span className="text-green-600">●</span> WhatsApp
      </a>
      <a href={links.x} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on X">
        𝕏
      </a>
      <a href={links.facebook} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on Facebook">
        <span className="text-blue-600">f</span> Facebook
      </a>
      <a href={links.telegram} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on Telegram">
        <span className="text-sky-500">✈</span> Telegram
      </a>
      <button onClick={nativeOrCopy} className={btn} aria-label="Copy link or share">
        {copied ? "✓ Copied" : "🔗 Copy link"}
      </button>
    </div>
  );
}
