// Simulates a Postmark inbound webhook delivering a DMARC aggregate report.
// Usage: node scripts/send-sample-report.mjs <ingest_token> [base_url] [days_ago] [report_id]
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const [token, base = "http://localhost:3000", daysAgo = "0", reportId = String(Date.now())] = process.argv.slice(2);
if (!token) { console.error("usage: node scripts/send-sample-report.mjs <ingest_token> [base_url] [days_ago] [report_id]"); process.exit(1); }

const end = Math.floor(Date.now() / 1000) - parseInt(daysAgo, 10) * 86400;
const begin = end - 86400;
let xml = readFileSync(new URL("../fixtures/sample-google-report.xml", import.meta.url), "utf8")
  .replaceAll("__DOMAIN__", "testcorp.example")
  .replaceAll("__BEGIN__", String(begin))
  .replaceAll("__END__", String(end))
  .replace("17548439218466232987", reportId);

const payload = {
  From: "noreply-dmarc-support@google.com",
  ToFull: [{ Email: `${token}@reports.example.com` }],
  Subject: "Report domain: testcorp.example",
  Attachments: [{
    Name: "google.com!testcorp.example.xml.gz",
    Content: gzipSync(Buffer.from(xml)).toString("base64"),
    ContentType: "application/gzip",
  }],
};

const secret = process.env.INBOUND_SECRET || "test-inbound-secret";
const res = await fetch(`${base}/api/inbound?secret=${secret}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
console.log(res.status, await res.text());
