// Sends every visit on an old or secondary address to the same page on the
// main domain with a permanent (301) redirect, so search engines index one
// version of the site. Everything else is served from the static build.
const CANONICAL_HOST = "theindianmorningpost.online";

const REDIRECT_HOSTS = new Set([
  "www.theindianmorningpost.online",
  "the-indian-morning-post.theindianmorningpostdaily.workers.dev",
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (REDIRECT_HOSTS.has(url.hostname)) {
      url.protocol = "https:";
      url.hostname = CANONICAL_HOST;
      url.port = "";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
