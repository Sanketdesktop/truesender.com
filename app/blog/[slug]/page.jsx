import { notFound } from "next/navigation";
import { POSTS, getPost } from "../../../lib/posts";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — InboxGuard`,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}

export default function BlogPost({ params }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "InboxGuard" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="shell nav">
        <a className="wordmark" href="/">inbox<em>guard</em></a>
        <nav className="nav-links" aria-label="Sections">
          <a href="/blog">All articles</a>
          <a className="nav-cta" href="/login">Dashboard</a>
        </nav>
      </header>
      <main className="shell article-wrap">
        <article>
          <p className="kicker">{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          <h1 className="article-title">{post.title}</h1>
          <div className="article-body" dangerouslySetInnerHTML={{ __html: post.body }} />
        </article>
        <aside className="article-cta">
          <h3>Check your domain now</h3>
          <p>Free DMARC, SPF and DKIM check with plain-English fixes — no signup needed.</p>
          <a className="checker-btn monitor-link" href="/#checker" style={{ marginTop: "0.75rem" }}>Run the free check</a>
        </aside>
      </main>
      <footer className="shell footer">
        <span>© {new Date().getFullYear()} InboxGuard</span>
        <a href="/blog" style={{ color: "inherit" }}>More articles →</a>
      </footer>
    </>
  );
}
