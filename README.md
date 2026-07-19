# InboxGuard — launch checklist

Everything is live-by-default: direct signup (no waitlist), full free dashboard,
blog, sitemap, llms.txt. Do this checklist in one sitting (~1 hour) and the whole
product is live. Steps are ordered so the site works after every single step.

## The one-sitting launch

1. **Deploy the code** — copy contents over your GitHub repo, commit, push. Vercel
   redeploys. (Marketing site, checker, generator, and blog are live right now.)
2. **Database** — neon.tech → new project → copy connection string.
3. **Vercel env vars** (Settings → Environment Variables), then Redeploy:
   `DATABASE_URL`, `SESSION_SECRET` (long random), `INBOUND_SECRET` (long random),
   `CRON_SECRET` (long random), `REPORT_DOMAIN` = reports.YOURDOMAIN.com,
   `APP_URL` = https://YOURDOMAIN.com
   → Signup, login, dashboard, and domain management are now live.
4. **Inbound reports** — postmarkapp.com → Inbound stream → webhook URL
   `https://YOURDOMAIN.com/api/inbound?secret=YOUR_INBOUND_SECRET` → add the MX
   record for reports.YOURDOMAIN.com that Postmark shows you.
   → Real DMARC reports now flow into dashboards.
5. **Alert emails** — Postmark Server API token → env vars
   `POSTMARK_SERVER_TOKEN` + `ALERT_FROM_EMAIL` (verified sender) → Redeploy.
6. **SEO switches (5 min, big payoff)** — Google Search Console: add your domain,
   verify, submit sitemap `https://YOURDOMAIN.com/sitemap.xml`. Do the same at
   Bing Webmaster Tools (Bing feeds ChatGPT's web search).
7. **Point your own domain's DMARC at your own product** — instant dogfooding,
   real data in your dashboard, and screenshots for social/launch posts.

## How the product works (reference)

- `POST /api/auth/signup|login|logout` — accounts (scrypt-hashed passwords, signed cookies)
- `POST /api/domains` — add a domain, generates its unique ingest token
- `POST /api/inbound?secret=…` — Postmark webhook; decompresses gzip/zip XML,
  parses RFC 7489 aggregate reports, deduplicates, classifies each sender IP by
  reverse DNS against 20+ known email services
- `GET /api/cron/alerts?secret=…` — daily: new-sender + pass-rate-drop detection
- `/dashboard` — domain list with per-domain setup instructions
- `/dashboard/[id]` — 30-day pass-rate chart, sender table with pass rates,
  failing-sources (spoofing) panel, live DNS health, and the **enforcement wizard**
  that tells the user exactly when to move p=none → quarantine → reject and
  generates the record for them
- `POST /api/waitlist` — landing-page email capture

## Testing without waiting for real reports

`node scripts/send-sample-report.mjs <ingest_token> <site_url> [days_ago]`
simulates Gmail delivering a report (needs `INBOUND_SECRET` env var set in the
terminal). Ask Claude Code to run 8 days of these against your live site and your
dashboard fills with realistic demo data — useful for screenshots too.

## Running everything locally (optional)

Requires Node.js and Postgres. Copy `.env.local` values to your own, then
`npm install && npm run dev`.
