import { POSTS } from "../lib/posts";

export default function sitemap() {
  const base = process.env.APP_URL || "https://dmarc-checkers.vercel.app";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
    ...POSTS.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.date,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
    { url: `${base}/login`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
