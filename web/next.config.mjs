/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export -> deploys to Cloudflare Pages for free, served from CDN.
  // The daily pipeline triggers a rebuild via a deploy hook after publishing.
  output: "export",
  images: {
    // Pollinations + Supabase images are external; static export can't optimize.
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
