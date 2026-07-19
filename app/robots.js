export default function robots() {
  const base = process.env.APP_URL || "https://dmarc-checkers.vercel.app";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/"] },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
