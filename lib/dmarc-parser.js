import { gunzipSync } from "node:zlib";
import dns from "node:dns/promises";
import { XMLParser } from "fast-xml-parser";
import AdmZip from "adm-zip";

const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true });

export function decodeAttachment(base64Content, filename = "") {
  const buf = Buffer.from(base64Content, "base64");
  if (buf[0] === 0x1f && buf[1] === 0x8b) {
    return gunzipSync(buf).toString("utf8");
  }
  if (buf[0] === 0x50 && buf[1] === 0x4b) {
    const zip = new AdmZip(buf);
    const entry = zip.getEntries().find((e) => e.entryName.endsWith(".xml")) || zip.getEntries()[0];
    return entry ? entry.getData().toString("utf8") : null;
  }
  const text = buf.toString("utf8");
  return text.includes("<feedback") || text.includes("<?xml") ? text : null;
}

const KNOWN_SENDERS = [
  ["google", "Google Workspace / Gmail"],
  ["googlemail", "Google Workspace / Gmail"],
  ["outlook", "Microsoft 365 / Outlook"],
  ["protection.office365", "Microsoft 365 / Outlook"],
  ["amazonses", "Amazon SES"],
  ["sendgrid", "SendGrid"],
  ["mcsv", "Mailchimp"],
  ["mcdlv", "Mailchimp"],
  ["rsgsv", "Mailchimp"],
  ["mailgun", "Mailgun"],
  ["postmarkapp", "Postmark"],
  ["mtasv", "Postmark"],
  ["zoho", "Zoho Mail"],
  ["yahoodns", "Yahoo"],
  ["sparkpost", "SparkPost"],
  ["mandrill", "Mandrill"],
  ["brevo", "Brevo"],
  ["sendinblue", "Brevo"],
  ["hubspot", "HubSpot"],
  ["salesforce", "Salesforce"],
  ["mimecast", "Mimecast"],
  ["pphosted", "Proofpoint"],
];

export async function classifySourceIp(ip) {
  try {
    const names = await Promise.race([
      dns.reverse(ip),
      new Promise((resolve) => setTimeout(() => resolve([]), 3000)),
    ]);
    const host = (names && names[0]) || "";
    const lower = host.toLowerCase();
    for (const [needle, label] of KNOWN_SENDERS) {
      if (lower.includes(needle)) return { name: label, host };
    }
    return { name: host || "Unknown sender", host };
  } catch {
    return { name: "Unknown sender", host: "" };
  }
}

function asArray(x) {
  return Array.isArray(x) ? x : x == null ? [] : [x];
}

export function parseAggregateReport(xmlText) {
  const doc = parser.parse(xmlText);
  const fb = doc.feedback;
  if (!fb) throw new Error("Not a DMARC aggregate report");

  const meta = fb.report_metadata || {};
  const range = meta.date_range || {};
  const policy = fb.policy_published || {};

  const records = asArray(fb.record).map((r) => {
    const row = r.row || {};
    const evaluated = row.policy_evaluated || {};
    const identifiers = r.identifiers || {};
    return {
      source_ip: String(row.source_ip || ""),
      msg_count: parseInt(row.count, 10) || 1,
      disposition: String(evaluated.disposition || "none"),
      eval_spf: String(evaluated.spf || "none"),
      eval_dkim: String(evaluated.dkim || "none"),
      header_from: String(identifiers.header_from || ""),
    };
  });

  return {
    org_name: String(meta.org_name || "unknown"),
    report_id: String(meta.report_id || ""),
    date_begin: range.begin ? new Date(parseInt(range.begin, 10) * 1000) : new Date(),
    date_end: range.end ? new Date(parseInt(range.end, 10) * 1000) : new Date(),
    policy_published: policy,
    records,
  };
}
