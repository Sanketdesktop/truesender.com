export const POSTS = [
  {
    slug: "why-are-my-emails-going-to-spam",
    title: "Why are my emails going to spam? The 2026 checklist",
    description:
      "The most common reason emails land in spam is missing or broken authentication — SPF, DKIM, and DMARC. Here is how to diagnose and fix it in under an hour.",
    date: "2026-07-01",
    body: `
<p><strong>Short answer:</strong> the most common reason legitimate email lands in spam is missing or broken email authentication. If your domain lacks a valid SPF record, a DKIM signature, or a DMARC policy, Gmail, Yahoo and Microsoft treat your mail as unverifiable — and since 2024 they reject or spam-folder it by policy, not by accident.</p>

<h2>Run this checklist in order</h2>

<h3>1. Check your authentication records</h3>
<p>Use a <a href="/">free DMARC/SPF/DKIM checker</a>. You need all three: an SPF record listing your sending servers, a DKIM key published in DNS, and a DMARC record tying them to your visible From: address. Missing any one of them lowers your deliverability; missing all three makes reliable inbox placement nearly impossible in 2026.</p>

<h3>2. Look for the silent SPF failure</h3>
<p>SPF allows at most <strong>10 DNS lookups</strong>. Every <code>include:</code> for a service (Google Workspace, Mailchimp, your CRM, your helpdesk) consumes lookups. Exceed 10 and SPF returns a permanent error — your record looks fine to a human but fails for every receiver. This is one of the most common invisible deliverability bugs.</p>

<h3>3. Verify DKIM is actually enabled</h3>
<p>Many businesses assume their email provider signs mail automatically. Google Workspace, for example, requires you to explicitly turn DKIM on (Admin console → Apps → Gmail → Authenticate email). Until you do, your mail goes out unsigned.</p>

<h3>4. Check your DMARC alignment</h3>
<p>Passing SPF and DKIM is not enough — DMARC requires the domain that passed to <em>match your From: address</em>. Third-party senders (newsletters, invoicing tools) often pass authentication with their own domain, which fails alignment for yours. Your DMARC aggregate reports show exactly which senders align and which do not.</p>

<h3>5. Only then look at content and list hygiene</h3>
<p>Spam-trigger words and image-heavy templates matter far less than most advice suggests. Fix authentication first; content tuning is a second-order effect.</p>

<h2>How to see what receivers actually think of your mail</h2>
<p>Add a DMARC record with a reporting address and mailbox providers will send you daily reports on every message claiming to be from your domain — what passed, what failed, and who is sending. That data, not guesswork, is how deliverability problems get solved.</p>
`,
  },
  {
    slug: "dmarc-p-none-vs-quarantine-vs-reject",
    title: "DMARC p=none vs quarantine vs reject: which policy should you use?",
    description:
      "p=none monitors, quarantine spam-folders failures, reject blocks them. Start at none, and move up only when your reports show every legitimate sender passing.",
    date: "2026-07-05",
    body: `
<p><strong>Short answer:</strong> start at <code>p=none</code>, and move to <code>p=quarantine</code> and finally <code>p=reject</code> only after your DMARC reports show all legitimate senders passing authentication. Staying at p=none forever gives you zero protection; jumping to reject too early sends your own mail to spam.</p>

<h2>What each policy does</h2>
<p><strong>p=none</strong> — monitoring only. Mail that fails authentication is delivered normally, but you receive reports about it. No protection, full visibility. The right starting point for everyone.</p>
<p><strong>p=quarantine</strong> — failing mail goes to the recipient's spam folder. Real protection with a safety net: a misconfigured legitimate sender is spam-foldered, not lost.</p>
<p><strong>p=reject</strong> — failing mail is refused at the server. Full protection: spoofed email claiming to be your domain simply bounces. This is the end goal, and where the Fortune 500 majority already sits.</p>

<h2>Why most domains are stuck at p=none</h2>
<p>Industry data consistently shows that the majority of DMARC-enabled domains never move past p=none. The reason is fear: without reading the reports, admins cannot tell whether tightening the policy will break a forgotten-but-legitimate sender, so they never tighten it. That leaves them compliant on paper and unprotected in practice — anyone can still spoof the domain and the policy does nothing.</p>

<h2>The safe upgrade path</h2>
<ol>
<li>Publish <code>p=none</code> with a <code>rua=</code> reporting address.</li>
<li>Collect at least 1–2 weeks of reports (a month if you send seasonally).</li>
<li>Identify every source in your reports. Fix any legitimate service that fails SPF/DKIM alignment.</li>
<li>Move to <code>p=quarantine; pct=25</code>, then raise pct to 100 over a couple of weeks.</li>
<li>Move to <code>p=reject</code>. Keep monitoring — new tools get added, DNS records get edited, things break silently.</li>
</ol>
<p>A monitoring dashboard automates the judgment calls in steps 2–5: it tells you when every known sender has been passing long enough that the next step is safe.</p>
`,
  },
  {
    slug: "gmail-yahoo-sender-requirements-explained",
    title: "Gmail and Yahoo sender requirements explained (and what happens if you ignore them)",
    description:
      "Since February 2024, bulk senders must have SPF, DKIM and DMARC. Enforcement has escalated to outright SMTP-level rejection. Here is exactly what is required.",
    date: "2026-07-10",
    body: `
<p><strong>Short answer:</strong> if you send email from your own domain, Gmail and Yahoo now require SPF and DKIM authentication, and — for bulk senders over roughly 5,000 messages a day — a published DMARC policy, one-click unsubscribe, and low spam-complaint rates. Enforcement started as spam-foldering in February 2024 and has escalated to rejecting non-compliant mail at the SMTP level.</p>

<h2>The requirements, concretely</h2>
<ul>
<li><strong>All senders:</strong> SPF or DKIM must pass; sending domains need valid forward and reverse DNS; spam rates must stay low.</li>
<li><strong>Bulk senders (~5,000+/day):</strong> both SPF and DKIM; a DMARC record (p=none is sufficient to comply); the From: domain must align with SPF or DKIM; one-click List-Unsubscribe; complaint rate under 0.3%.</li>
</ul>

<h2>What non-compliance looks like</h2>
<p>It rarely announces itself. Open rates drift down. Password-reset emails "never arrive." Invoices get resent three times. Then one day mail starts bouncing with SMTP errors referencing authentication. Because failures are silent at first, most businesses discover the problem months after it started costing them.</p>

<h2>Compliance is the floor, not the ceiling</h2>
<p>Note the loophole in the rules: a DMARC record at p=none satisfies the requirement while providing zero protection against spoofing. That is why over half of compliant domains remain effectively unprotected. Meeting the mandate takes an afternoon; actually protecting your domain means reading the reports and moving to an enforced policy — see our guide to <a href="/blog/dmarc-p-none-vs-quarantine-vs-reject">choosing the right DMARC policy</a>.</p>

<h2>The five-minute compliance check</h2>
<p>Run your domain through a <a href="/">free authentication checker</a>. It verifies your SPF record (including the 10-lookup limit), probes for DKIM keys, parses your DMARC policy, and gives you plain-English fixes for anything missing.</p>
`,
  },
  {
    slug: "how-to-read-dmarc-reports",
    title: "How to read DMARC reports (without losing your mind)",
    description:
      "DMARC aggregate reports arrive as gzipped XML that no human can read. Here is what is inside them, what the fields mean, and how to actually use the data.",
    date: "2026-07-15",
    body: `
<p><strong>Short answer:</strong> DMARC aggregate reports are daily XML files from mailbox providers listing every IP that sent mail claiming to be your domain, with counts and SPF/DKIM pass-fail results. The raw files are effectively unreadable by hand — the practical options are a parsing script or a monitoring service that turns them into a dashboard.</p>

<h2>What arrives in your inbox</h2>
<p>Once you publish a DMARC record with <code>rua=mailto:you@yourdomain.com</code>, providers like Google, Microsoft and Yahoo email you one report per day each — a gzip or zip attachment containing XML in the RFC 7489 format. A modest domain receives a handful daily; a busy one, dozens.</p>

<h2>The fields that matter</h2>
<ul>
<li><strong>source_ip</strong> — who sent the mail. Reverse-DNS this to identify the service (Google, SendGrid, Mailchimp… or an unknown server in a country you have never shipped to).</li>
<li><strong>count</strong> — how many messages that source sent in the period.</li>
<li><strong>policy_evaluated → spf / dkim</strong> — the aligned pass/fail verdicts that DMARC actually uses. A source failing both is either a misconfigured tool of yours or someone spoofing you.</li>
<li><strong>disposition</strong> — what the receiver did: none, quarantine, or reject.</li>
</ul>

<h2>The three questions the reports answer</h2>
<p><strong>Is my legitimate mail passing?</strong> Every service you use should show near-100% pass. Anything lower is a misconfiguration silently costing you deliverability.</p>
<p><strong>Who else is sending as my domain?</strong> Unknown IPs failing authentication are spoofing attempts. Their volume tells you how attractive a target you are.</p>
<p><strong>Am I ready to enforce?</strong> When every identified legitimate sender passes consistently, you can move your policy from p=none toward p=reject with confidence.</p>

<h2>Manual vs automated</h2>
<p>Reading a single XML file to understand the format is worthwhile. Reading them every day is not a human job: reports arrive from many providers, cover overlapping windows, and only become meaningful as trends. A monitoring tool ingests them automatically, identifies each sender, charts your pass rate, and alerts you when a new source appears — which is exactly what <a href="/">InboxGuard</a> does, free during early access.</p>
`,
  },
];

export function getPost(slug) {
  return POSTS.find((p) => p.slug === slug) || null;
}
