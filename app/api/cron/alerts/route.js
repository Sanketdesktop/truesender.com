import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function sendEmail(to, subject, textBody) {
  if (!process.env.POSTMARK_SERVER_TOKEN) {
    console.log(`[alert email skipped - no POSTMARK_SERVER_TOKEN] to=${to} subject=${subject}`);
    return false;
  }
  const res = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": process.env.POSTMARK_SERVER_TOKEN,
    },
    body: JSON.stringify({
      From: process.env.ALERT_FROM_EMAIL || "alerts@example.com",
      To: to,
      Subject: subject,
      TextBody: textBody,
      MessageStream: "outbound",
    }),
  });
  return res.ok;
}

export async function GET(request) {
  const secret = new URL(request.url).searchParams.get("secret");
  const auth = request.headers.get("authorization");
  const ok =
    (process.env.CRON_SECRET && secret === process.env.CRON_SECRET) ||
    (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`);
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const domains = await query(
    `SELECT d.id, d.domain, u.email FROM domains d JOIN users u ON u.id = d.user_id`
  );
  const results = [];

  for (const d of domains.rows) {
    // 1. New sources in the last 2 days that were never seen before
    const newSources = await query(
      `SELECT DISTINCT source_ip, source_name FROM report_records
       WHERE domain_id = $1 AND date_begin > now() - interval '2 days'
       AND source_ip NOT IN (
         SELECT DISTINCT source_ip FROM report_records
         WHERE domain_id = $1 AND date_begin <= now() - interval '2 days'
       )`,
      [d.id]
    );
    for (const s of newSources.rows) {
      const already = await query(
        `SELECT 1 FROM alerts_sent WHERE domain_id = $1 AND kind = 'new_source' AND detail = $2 AND sent_at > now() - interval '7 days'`,
        [d.id, s.source_ip]
      );
      if (already.rows.length) continue;
      await sendEmail(
        d.email,
        `New sender detected for ${d.domain}`,
        `A new source started sending email as ${d.domain}:\n\nIP: ${s.source_ip}\nIdentified as: ${s.source_name}\n\nIf you recently added an email service, this is expected. If not, someone may be spoofing your domain.\n\n— InboxGuard`
      );
      await query(`INSERT INTO alerts_sent (domain_id, kind, detail) VALUES ($1, 'new_source', $2)`, [d.id, s.source_ip]);
      results.push({ domain: d.domain, alert: "new_source", ip: s.source_ip });
    }

    // 2. Pass-rate drop: last 2 days vs prior 7 days
    const rates = await query(
      `SELECT
        COALESCE(SUM(msg_count) FILTER (WHERE date_begin > now() - interval '2 days' AND (eval_spf = 'pass' OR eval_dkim = 'pass')), 0)::float AS recent_pass,
        COALESCE(SUM(msg_count) FILTER (WHERE date_begin > now() - interval '2 days'), 0)::float AS recent_total,
        COALESCE(SUM(msg_count) FILTER (WHERE date_begin <= now() - interval '2 days' AND date_begin > now() - interval '9 days' AND (eval_spf = 'pass' OR eval_dkim = 'pass')), 0)::float AS prior_pass,
        COALESCE(SUM(msg_count) FILTER (WHERE date_begin <= now() - interval '2 days' AND date_begin > now() - interval '9 days'), 0)::float AS prior_total
       FROM report_records WHERE domain_id = $1`,
      [d.id]
    );
    const r = rates.rows[0];
    if (r.recent_total >= 10 && r.prior_total >= 10) {
      const recentRate = r.recent_pass / r.recent_total;
      const priorRate = r.prior_pass / r.prior_total;
      if (priorRate - recentRate > 0.15) {
        const already = await query(
          `SELECT 1 FROM alerts_sent WHERE domain_id = $1 AND kind = 'pass_drop' AND sent_at > now() - interval '3 days'`,
          [d.id]
        );
        if (!already.rows.length) {
          await sendEmail(
            d.email,
            `Authentication pass rate dropped for ${d.domain}`,
            `Your DMARC pass rate fell from ${Math.round(priorRate * 100)}% to ${Math.round(recentRate * 100)}%.\n\nA sending service may be misconfigured, or a DNS record may have changed. Check your dashboard for details.\n\n— InboxGuard`
          );
          await query(`INSERT INTO alerts_sent (domain_id, kind, detail) VALUES ($1, 'pass_drop', $2)`, [d.id, `${priorRate}->${recentRate}`]);
          results.push({ domain: d.domain, alert: "pass_drop" });
        }
      }
    }
  }

  return NextResponse.json({ ok: true, alerts: results });
}
