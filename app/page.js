import Checker from "../components/Checker";
import DmarcGenerator from "../components/DmarcGenerator";
import { HeroMail, VecSpf, VecDkim, VecDmarc, FlowDiagram, DashboardPreview } from "../components/Vectors";

export default function Home() {
  return (
    <>
      <header className="shell nav">
        <a className="wordmark" href="/">inbox<em>guard</em></a>
        <nav className="nav-links" aria-label="Sections">
          <a href="#learn">Learn</a>
          <a href="#flow">How it works</a>
          <a href="#generator">Generator</a>
          <a href="/blog">Blog</a>
          <a href="#faq">FAQ</a>
          <a className="nav-cta" href="/login">Dashboard</a>
        </nav>
      </header>

      <main>
        <section className="shell hero">
          <div>
            <h1>
              Is your email actually <span className="accent">reaching inboxes?</span>
            </h1>
            <p className="hero-sub">
              Gmail and Yahoo now reject unauthenticated mail. Check your domain in
              ten seconds — get plain-English fixes, not jargon.
            </p>
            <Checker />
          </div>
          <aside className="hero-visual">
            <HeroMail />
            <div className="hero-stat">
              <strong>63%</strong>
              <span>of domains with DMARC have zero real protection</span>
            </div>
          </aside>
        </section>

        <section className="shell section" id="flow">
          <p className="kicker">The journey of one email</p>
          <h2>Every message you send gets interrogated</h2>
          <p className="section-lede">
            Receivers run three checks before deciding: inbox or spam. Fail them and
            your invoices, resets and newsletters quietly disappear.
          </p>
          <div className="flow-wrap">
            <FlowDiagram />
          </div>
        </section>

        <section className="shell section" id="learn">
          <p className="kicker">The three records</p>
          <h2>What the checks actually are</h2>

          <div className="record-feature">
            <div className="record-feature-art"><VecSpf /></div>
            <div>
              <span className="tag">The guest list</span>
              <h3>SPF</h3>
              <p>
                A DNS record naming the servers allowed to send as your domain.
                Anyone not on the list looks suspicious. Watch the catch: more than
                10 DNS lookups and SPF silently fails.
              </p>
            </div>
          </div>

          <div className="record-feature flip">
            <div className="record-feature-art"><VecDkim /></div>
            <div>
              <span className="tag">The signature</span>
              <h3>DKIM</h3>
              <p>
                A cryptographic seal on every message you send. Receivers verify it
                against a public key in your DNS — proof the mail is really yours
                and untouched in transit.
              </p>
            </div>
          </div>

          <div className="record-feature">
            <div className="record-feature-art"><VecDmarc /></div>
            <div>
              <span className="tag">The policy</span>
              <h3>DMARC</h3>
              <p>
                The enforcer. It requires SPF or DKIM to match your visible From:
                address, tells receivers what to do with failures, and mails you
                daily reports on everyone sending as your domain.
              </p>
            </div>
          </div>
        </section>

        <section className="stat-band">
          <div className="shell stat-band-inner">
            <div className="stat">
              <strong>Feb 2024</strong>
              <span>Google &amp; Yahoo made authentication mandatory for bulk senders</span>
            </div>
            <div className="stat">
              <strong>SMTP-level</strong>
              <span>Gmail now rejects non-compliant mail outright, not just spam-folders it</span>
            </div>
            <div className="stat">
              <strong>PCI DSS v4</strong>
              <span>DMARC is required for any business handling card payments</span>
            </div>
          </div>
        </section>

        <section className="shell section" id="generator">
          <p className="kicker">Free tool</p>
          <h2>Generate your starter DMARC record</h2>
          <p className="section-lede">
            No DMARC yet? Build a safe monitoring record below, then paste it into
            your DNS as a TXT record. Delivery is unaffected — you just start
            getting visibility.
          </p>
          <DmarcGenerator />
        </section>

        <section className="shell section" id="monitor">
          <div className="monitor-split">
            <div>
              <p className="kicker">The monitoring product — live now</p>
              <h2>A check tells you about today. Monitoring tells you when it breaks.</h2>
              <p className="section-lede">
                DMARC reports arrive daily as unreadable XML. InboxGuard turns them
                into a live dashboard: every sender identified, spoofing attempts
                flagged, alerts the moment your pass rate drops — and a guided path
                from p=none to full protection.
              </p>
              <a className="checker-btn monitor-link" href="/login">Start free monitoring</a>
              <p className="setup-note" style={{marginTop:"0.75rem"}}>Free during early access · full dashboard · no card required</p>
            </div>
            <div className="monitor-art">
              <DashboardPreview />
            </div>
          </div>
        </section>

        <section className="shell section" id="faq">
          <p className="kicker">Common questions</p>
          <h2>Frequently asked</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>Why are my emails going to spam?</h3>
              <p>
                Missing or broken authentication is the most common cause — and the
                easiest to fix. An over-limit SPF record, a missing DKIM key, or no
                DMARC record all make Gmail and Yahoo treat your mail with
                suspicion. The check above shows exactly where you stand.
              </p>
            </div>
            <div className="faq-item">
              <h3>What does p=none mean in my DMARC record?</h3>
              <p>
                Monitor only: failing mail is still delivered while you collect
                reports. The right starting point — but staying there forever means
                no protection. The goal is p=quarantine, then p=reject, once
                reports show your legitimate senders passing.
              </p>
            </div>
            <div className="faq-item">
              <h3>Do I need this if I only send a few emails a day?</h3>
              <p>
                Yes. The strict rules target bulk senders, but unauthenticated mail
                from any domain is increasingly spam-foldered — and any domain
                without an enforced policy can be spoofed. Setup takes minutes and
                costs nothing.
              </p>
            </div>
            <div className="faq-item">
              <h3>Is my data stored when I run a check?</h3>
              <p>
                No. The checker performs live DNS lookups against public records
                and returns the result to your browser. Nothing is saved.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="shell footer">
        <span>© {new Date().getFullYear()} InboxGuard</span>
        <span>Built for anyone who has ever asked &quot;why did that email bounce?&quot;</span>
      </footer>
    </>
  );
}
