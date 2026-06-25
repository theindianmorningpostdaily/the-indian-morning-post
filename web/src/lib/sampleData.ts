import type { Article } from "./types";

// Demo content used ONLY when Supabase is not configured, so the design can be
// previewed locally before deployment. Real content comes from the pipeline.
// Images are generated on-the-fly by Pollinations.ai (free, no key).

function img(prompt: string, seed: number): string {
  const style =
    ", professional editorial news photography, photorealistic, natural lighting, 16:9, no text, no logo";
  const q = encodeURIComponent((prompt + style).slice(0, 380));
  return `https://image.pollinations.ai/prompt/${q}?width=1280&height=720&seed=${seed}&nologo=true&model=flux`;
}

function daysAgo(n: number): string {
  // Fixed reference date keeps the demo deterministic across rebuilds.
  const base = new Date("2026-06-25T04:00:00Z").getTime();
  return new Date(base - n * 3600 * 1000).toISOString();
}

const body = (intro: string) => `${intro}

The development, confirmed by multiple international news organizations, marks a significant moment with implications that are expected to unfold over the coming weeks. Officials briefed on the matter described the situation as evolving, while independent analysts urged caution in interpreting early figures.

## What we know

According to corroborated reports, the key facts have been verified across several trusted outlets. Authorities have committed to providing further updates as the situation develops, and observers will be watching closely for the next official statement.

## Why it matters

Beyond the immediate headlines, the story touches on broader questions of policy, economics, and public welfare. Experts say the longer-term consequences will depend heavily on decisions taken in the days ahead.

This report was synthesized from facts reported by several reputable international news organizations and cross-checked prior to publication.`;

export const SAMPLE_ARTICLES: Article[] = [
  {
    id: "s1",
    slug: "global-leaders-convene-climate-summit",
    headline: "Global Leaders Convene for Landmark Climate Summit",
    subtitle:
      "Delegates from more than 100 nations gather to negotiate new emissions targets amid record temperatures.",
    summary:
      "World leaders opened a high-stakes climate summit on Wednesday, seeking consensus on ambitious new emissions targets as scientists warn of accelerating warming.",
    body: body(
      "World leaders opened a high-stakes international climate summit this week, seeking consensus on ambitious new emissions targets as scientists warn of accelerating global warming."
    ),
    category: "environment",
    seo_title: "Global Leaders Convene for Landmark Climate Summit",
    meta_description:
      "Delegates from over 100 nations meet to negotiate new emissions targets as record temperatures intensify pressure for action.",
    keywords: ["climate summit", "emissions", "global warming", "environment policy"],
    image_url: img("world leaders at a major international climate summit, conference hall, flags", 101),
    author: "The Indian Morning Post Editorial Desk",
    is_breaking: true,
    read_minutes: 4,
    published_at: daysAgo(2),
  },
  {
    id: "s2",
    slug: "central-banks-signal-shift-interest-rates",
    headline: "Central Banks Signal a Shift in Global Interest Rate Policy",
    subtitle:
      "Markets rallied as major central banks hinted at a turning point after a prolonged tightening cycle.",
    summary:
      "Global markets climbed after several major central banks signaled a possible shift in interest rate policy, easing fears of prolonged monetary tightening.",
    body: body(
      "Global financial markets climbed sharply after several major central banks signaled a possible shift in interest rate policy, easing investor fears of a prolonged tightening cycle."
    ),
    category: "business",
    seo_title: "Central Banks Signal Shift in Interest Rate Policy",
    meta_description:
      "Global markets rally as major central banks hint at a turning point in interest rate policy after months of tightening.",
    keywords: ["interest rates", "central banks", "markets", "inflation", "economy"],
    image_url: img("modern central bank building and financial trading floor, screens with charts", 102),
    author: "The Indian Morning Post Editorial Desk",
    is_breaking: false,
    read_minutes: 3,
    published_at: daysAgo(5),
  },
  {
    id: "s3",
    slug: "breakthrough-ai-model-scientific-research",
    headline: "New AI Model Accelerates Breakthroughs in Scientific Research",
    subtitle:
      "Researchers say the system can shorten years of laboratory work into months across several fields.",
    summary:
      "A newly unveiled artificial intelligence model is helping researchers accelerate discoveries, with early results spanning medicine, materials science and climate modeling.",
    body: body(
      "A newly unveiled artificial intelligence model is helping researchers accelerate scientific discovery, with early results already spanning medicine, materials science and climate modeling."
    ),
    category: "technology",
    seo_title: "New AI Model Accelerates Scientific Breakthroughs",
    meta_description:
      "A new artificial intelligence system is helping researchers compress years of lab work into months across multiple fields.",
    keywords: ["artificial intelligence", "AI", "scientific research", "technology"],
    image_url: img("advanced AI research laboratory with scientists and holographic data", 103),
    author: "The Indian Morning Post Editorial Desk",
    is_breaking: false,
    read_minutes: 4,
    published_at: daysAgo(8),
  },
  {
    id: "s4",
    slug: "diplomatic-talks-ease-regional-tensions",
    headline: "Diplomatic Talks Ease Regional Tensions After Months of Standoff",
    subtitle:
      "Negotiators reached a preliminary understanding following weeks of shuttle diplomacy.",
    summary:
      "A round of diplomatic talks has eased regional tensions, with negotiators reaching a preliminary understanding after weeks of intensive shuttle diplomacy.",
    body: body(
      "A fresh round of diplomatic talks has eased long-running regional tensions, with negotiators reaching a preliminary understanding after weeks of intensive shuttle diplomacy."
    ),
    category: "politics",
    seo_title: "Diplomatic Talks Ease Regional Tensions",
    meta_description:
      "Negotiators reach a preliminary understanding to ease regional tensions after months of standoff and shuttle diplomacy.",
    keywords: ["diplomacy", "politics", "peace talks", "international relations"],
    image_url: img("diplomats shaking hands at a formal negotiation table, national flags", 104),
    author: "The Indian Morning Post Editorial Desk",
    is_breaking: true,
    read_minutes: 3,
    published_at: daysAgo(1),
  },
  {
    id: "s5",
    slug: "who-warns-rising-health-risks",
    headline: "Health Agency Warns of Rising Risks From Seasonal Outbreaks",
    subtitle:
      "Officials urged stronger surveillance as cases rose across several regions.",
    summary:
      "A leading global health agency has warned of rising risks from seasonal outbreaks, calling for stronger surveillance and faster data sharing between countries.",
    body: body(
      "A leading global health agency has warned of rising risks from seasonal outbreaks, calling for stronger surveillance and faster data sharing between countries."
    ),
    category: "health",
    seo_title: "Health Agency Warns of Rising Outbreak Risks",
    meta_description:
      "A global health agency urges stronger surveillance as seasonal outbreaks rise across several regions.",
    keywords: ["public health", "outbreak", "WHO", "disease surveillance"],
    image_url: img("public health laboratory scientists analyzing samples, modern medical facility", 105),
    author: "The Indian Morning Post Editorial Desk",
    is_breaking: false,
    read_minutes: 3,
    published_at: daysAgo(11),
  },
  {
    id: "s6",
    slug: "space-mission-reaches-milestone",
    headline: "International Space Mission Reaches Major Milestone",
    subtitle:
      "The spacecraft completed a critical maneuver, paving the way for the next phase of exploration.",
    summary:
      "An international space mission has reached a major milestone after completing a critical maneuver, paving the way for the next phase of deep-space exploration.",
    body: body(
      "An international space mission has reached a major milestone after successfully completing a critical orbital maneuver, paving the way for the next phase of deep-space exploration."
    ),
    category: "science",
    seo_title: "Space Mission Reaches Major Milestone",
    meta_description:
      "An international spacecraft completes a critical maneuver, advancing to the next phase of deep-space exploration.",
    keywords: ["space", "science", "exploration", "spacecraft", "NASA"],
    image_url: img("spacecraft orbiting a distant planet, stars, deep space, cinematic", 106),
    author: "The Indian Morning Post Editorial Desk",
    is_breaking: false,
    read_minutes: 4,
    published_at: daysAgo(14),
  },
  {
    id: "s7",
    slug: "global-trade-flows-rebound",
    headline: "Global Trade Flows Rebound as Supply Chains Stabilize",
    subtitle:
      "New figures point to recovering shipping volumes and easing logistics costs.",
    summary:
      "Global trade flows are rebounding as supply chains stabilize, with new figures pointing to recovering shipping volumes and easing logistics costs worldwide.",
    body: body(
      "Global trade flows are showing signs of a broad rebound as supply chains stabilize, with new figures pointing to recovering shipping volumes and easing logistics costs."
    ),
    category: "business",
    seo_title: "Global Trade Rebounds as Supply Chains Stabilize",
    meta_description:
      "New data shows recovering shipping volumes and easing logistics costs as global supply chains stabilize.",
    keywords: ["trade", "supply chain", "shipping", "global economy"],
    image_url: img("large container ship at a busy international port, cranes, logistics", 107),
    author: "The Indian Morning Post Editorial Desk",
    is_breaking: false,
    read_minutes: 3,
    published_at: daysAgo(17),
  },
  {
    id: "s8",
    slug: "renewable-energy-record-output",
    headline: "Renewable Energy Hits Record Share of Global Power Output",
    subtitle:
      "Solar and wind capacity additions outpaced fossil fuels for a second straight year.",
    summary:
      "Renewable energy has hit a record share of global power output, with solar and wind capacity additions outpacing fossil fuels for a second consecutive year.",
    body: body(
      "Renewable energy has reached a record share of global power output, with solar and wind capacity additions outpacing fossil fuels for a second consecutive year, according to new industry data."
    ),
    category: "environment",
    seo_title: "Renewables Hit Record Share of Global Power",
    meta_description:
      "Solar and wind additions outpace fossil fuels again as renewable energy reaches a record share of global power output.",
    keywords: ["renewable energy", "solar", "wind", "clean power", "environment"],
    image_url: img("vast solar farm and wind turbines at sunrise, clean energy landscape", 108),
    author: "The Indian Morning Post Editorial Desk",
    is_breaking: false,
    read_minutes: 3,
    published_at: daysAgo(20),
  },
  {
    id: "s9",
    slug: "humanitarian-aid-reaches-affected-region",
    headline: "Humanitarian Aid Reaches Region Hit by Severe Flooding",
    subtitle:
      "Relief convoys delivered supplies as agencies scaled up the emergency response.",
    summary:
      "Humanitarian aid has reached a region hit by severe flooding, with relief convoys delivering supplies as international agencies scale up their emergency response.",
    body: body(
      "Humanitarian aid has begun reaching a region devastated by severe flooding, with relief convoys delivering food, clean water and medical supplies as international agencies scale up their emergency response."
    ),
    category: "world",
    seo_title: "Aid Reaches Region Hit by Severe Flooding",
    meta_description:
      "Relief convoys deliver supplies to a flood-hit region as international agencies scale up emergency humanitarian response.",
    keywords: ["humanitarian", "flooding", "disaster relief", "aid", "world"],
    image_url: img("humanitarian aid convoy delivering supplies in a flood affected area", 109),
    author: "The Indian Morning Post Editorial Desk",
    is_breaking: false,
    read_minutes: 3,
    published_at: daysAgo(3),
  },
  {
    id: "s10",
    slug: "tech-firms-unveil-next-gen-chips",
    headline: "Tech Firms Unveil Next-Generation Chips for AI Workloads",
    subtitle:
      "The new processors promise major efficiency gains for data centers worldwide.",
    summary:
      "Leading technology firms have unveiled next-generation chips designed for AI workloads, promising major efficiency gains for data centers around the world.",
    body: body(
      "Leading technology firms have unveiled a new generation of processors designed specifically for demanding AI workloads, promising significant efficiency gains for data centers worldwide."
    ),
    category: "technology",
    seo_title: "Next-Generation AI Chips Unveiled",
    meta_description:
      "New processors built for AI workloads promise major efficiency gains for data centers as tech firms unveil next-gen chips.",
    keywords: ["semiconductors", "AI chips", "technology", "data centers"],
    image_url: img("close up of an advanced semiconductor chip on a circuit board, glowing", 110),
    author: "The Indian Morning Post Editorial Desk",
    is_breaking: false,
    read_minutes: 3,
    published_at: daysAgo(6),
  },
  {
    id: "s11",
    slug: "election-results-reshape-parliament",
    headline: "Election Results Reshape Parliament in Closely Watched Vote",
    subtitle:
      "A higher-than-expected turnout delivered a shifting balance of power.",
    summary:
      "Election results have reshaped parliament in a closely watched vote, with a higher-than-expected turnout delivering a shifting balance of power among major parties.",
    body: body(
      "Election results have reshaped the national parliament following a closely watched vote, with a higher-than-expected turnout delivering a shifting balance of power among the major parties."
    ),
    category: "politics",
    seo_title: "Election Results Reshape Parliament",
    meta_description:
      "A higher-than-expected turnout reshapes parliament in a closely watched election, shifting the balance of power.",
    keywords: ["election", "parliament", "politics", "vote", "democracy"],
    image_url: img("parliament building exterior with citizens, democracy, civic scene", 111),
    author: "The Indian Morning Post Editorial Desk",
    is_breaking: false,
    read_minutes: 3,
    published_at: daysAgo(9),
  },
  {
    id: "s12",
    slug: "researchers-map-ocean-ecosystems",
    headline: "Researchers Complete Largest-Ever Map of Ocean Ecosystems",
    subtitle:
      "The dataset offers an unprecedented view of marine biodiversity under pressure.",
    summary:
      "Researchers have completed the largest-ever map of ocean ecosystems, offering an unprecedented view of marine biodiversity that scientists say is increasingly under pressure.",
    body: body(
      "An international team of researchers has completed the largest-ever map of ocean ecosystems, offering an unprecedented view of marine biodiversity that scientists warn is increasingly under pressure."
    ),
    category: "science",
    seo_title: "Largest-Ever Map of Ocean Ecosystems Completed",
    meta_description:
      "Researchers complete the largest map of ocean ecosystems yet, revealing marine biodiversity increasingly under pressure.",
    keywords: ["ocean", "biodiversity", "science", "marine research", "climate"],
    image_url: img("vibrant underwater ocean ecosystem with coral reef and marine life", 112),
    author: "The Indian Morning Post Editorial Desk",
    is_breaking: false,
    read_minutes: 4,
    published_at: daysAgo(13),
  },
];
