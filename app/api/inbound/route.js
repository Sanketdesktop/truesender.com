import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { decodeAttachment, parseAggregateReport, classifySourceIp } from "../../../lib/dmarc-parser";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Postmark inbound webhook. Configure the webhook URL as:
//   https://yourapp.com/api/inbound?secret=INBOUND_SECRET
export async function POST(request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!process.env.INBOUND_SECRET || secret !== process.env.INBOUND_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  // Recipient like a1b2c3d4e5f6a7b8@reports.yourapp.com -> ingest token is the local part
  const to = (payload.ToFull && payload.ToFull[0] && payload.ToFull[0].Email) || payload.To || "";
  const token = String(to).split("@")[0].toLowerCase().trim();
  if (!token) return NextResponse.json({ ok: true, skipped: "no recipient" });

  const domainRow = await query("SELECT id, domain FROM domains WHERE ingest_token = $1", [token]);
  if (!domainRow.rows.length) {
    return NextResponse.json({ ok: true, skipped: "unknown ingest token" });
  }
  const domainId = domainRow.rows[0].id;

  const attachments = payload.Attachments || [];
  let stored = 0;

  for (const att of attachments) {
    try {
      const xml = decodeAttachment(att.Content, att.Name || "");
      if (!xml) continue;
      const report = parseAggregateReport(xml);

      const inserted = await query(
        `INSERT INTO reports (domain_id, org_name, report_id, date_begin, date_end, policy_published)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (domain_id, org_name, report_id) DO NOTHING
         RETURNING id`,
        [domainId, report.org_name, report.report_id, report.date_begin, report.date_end, JSON.stringify(report.policy_published)]
      );
      if (!inserted.rows.length) continue; // duplicate report

      const reportPk = inserted.rows[0].id;
      const classifications = new Map();

      for (const rec of report.records) {
        if (!classifications.has(rec.source_ip)) {
          classifications.set(rec.source_ip, await classifySourceIp(rec.source_ip));
        }
        const cls = classifications.get(rec.source_ip);
        await query(
          `INSERT INTO report_records
           (report_pk, domain_id, source_ip, source_name, msg_count, disposition, eval_spf, eval_dkim, header_from, date_begin)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [reportPk, domainId, rec.source_ip, cls.name, rec.msg_count, rec.disposition, rec.eval_spf, rec.eval_dkim, rec.header_from, report.date_begin]
        );
      }
      stored += 1;
    } catch (err) {
      console.error("inbound parse error:", err.message);
    }
  }

  return NextResponse.json({ ok: true, stored });
}
