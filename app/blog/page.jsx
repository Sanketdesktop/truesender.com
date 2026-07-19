import { POSTS } from "../../lib/posts";

export const metadata = {
  title: "Email deliverability blog — InboxGuard",
  description: "Plain-English guides to DMARC, SPF, DKIM, and getting your email into inboxes.",
};

export default function BlogIndex() {
  return (
    <>
      <header className="shell nav">
        <a className="wordmark" href="/">inbox<em>guard</em></a>
        <nav className="nav-links" aria-label="Sections">
          <a href="/#checker">Checker</a>
          <a href="/#generator">Generator</a>
          <a className="nav-cta" href="/login">Dashboard</a>
        </nav>
      </header>
      <main className="shell section">
        <p className="kicker">The blog</p>
        <h2>Email deliverability, in plain English</h2>
        <div className="blog-list">
          {POSTS.map((p) => (
            <a className="blog-card" href={`/blog/${p.slug}`} key={p.slug}>
              <span className="blog-date">{new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </a>
          ))}
        </div>
      </main>
      <footer className="shell footer">
        <span>© {new Date().getFullYear()} InboxGuard</span>
        <a href="/" style={{ color: "inherit" }}>Free DMARC checker →</a>
      </footer>
    </>
  );
}
