import { Resolver } from "node:dns/promises";
import dns from "node:dns/promises";

const resolver = new Resolver({ timeout: 3000, tries: 2 });
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

const COMMON_DKIM_SELECTORS = [
  "google", "default", "selector1", "selector2", "k1", "k2", "k3",
  "mail", "smtp", "dkim", "s1", "s2", "mandrill", "zoho", "pm",
  "zendesk1", "zendesk2", "mxvault", "amazonses", "protonmail",
];

async function getTxtViaDoh(name) {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=TXT`,
    { headers: { accept: "application/dns-json" }, signal: AbortSignal.timeout(5000) }
  );
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.Answer) return [];
  return data.Answer
    .filter((a) => a.type === 16)
    .map((a) => a.data.replace(/^"|"$/g, "").replace(/"\s+"/g, ""));
}

async function getTxt(name) {
  return Promise.race([
    getTxtInner(name),
    new Promise((resolve) => setTimeout(() => resolve([]), 6000)),
  ]);
}

async function getTxtInner(name) {
  try {
    const records = await resolver.resolveTxt(name);
    return records.map((chunks) => chunks.join(""));
  } catch (err) {
    if (err && err.code === "ETIMEOUT") {
      try {
        const records = await dns.resolveTxt(name);
        return records.map((chunks) => chunks.join(""));
      } catch {
        try {
          return await getTxtViaDoh(name);
        } catch {
          return [];
        }
      }
    }
    return [];
  }
}

async function getMx(name) {
  try {
    return await resolver.resolveMx(name);
  } catch {
    try {
      return await dns.resolveMx(name);
    } catch {
      return [];
    }
  }
}

export function parseDmarcRecord(record) {
  const tags = {};
  for (const part of record.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k && rest.length) tags[k.trim().toLowerCase()] = rest.join("=").trim();
  }
  return tags;
}

export function countSpfLookups(record) {
  const mechanisms = record.split(/\s+/);
  let count = 0;
  for (const m of mechanisms) {
    const mech = m.replace(/^[+\-~?]/, "").toLowerCase();
    if (
      mech.startsWith("include:") ||
      mech === "a" || mech.startsWith("a:") ||
      mech === "mx" || mech.startsWith("mx:") ||
      mech.startsWith("exists:") ||
      mech.startsWith("redirect=") ||
      mech === "ptr" || mech.startsWith("ptr:")
    ) {
      count += 1;
    }
  }
  return count;
}

async function checkSpf(domain) {
  const txt = await getTxt(domain);
  const spfRecords = txt.filter((r) => r.toLowerCase().startsWith("v=spf1"));
  const issues = [];
  let status = "pass";

  if (spfRecords.length === 0) {
    return {
      status: "fail",
      record: null,
      issues: [{
        severity: "high",
        title: "No SPF record found",
        detail: `We could not find an SPF record on ${domain}. Without SPF, receivers cannot verify which servers are allowed to send email for your domain, and Gmail may reject or spam-folder your mail.`,
        fix: `Add a TXT record on ${domain}. If you use Google Workspace, the value is: v=spf1 include:_spf.google.com ~all`,
      }],
    };
  }

  if (spfRecords.length > 1) {
    status = "fail";
    issues.push({
      severity: "high",
      title: "Multiple SPF records found",
      detail: `${domain} has ${spfRecords.length} SPF records. The SPF standard requires exactly one — multiple records cause a permanent error and receivers treat SPF as failed.`,
      fix: "Merge all include: mechanisms into a single v=spf1 record and delete the extras.",
    });
  }

  const record = spfRecords[0];
  const lookups = countSpfLookups(record);
  if (lookups > 10) {
    status = "fail";
    issues.push({
      severity: "high",
      title: `SPF exceeds the 10 DNS lookup limit (${lookups} found)`,
      detail: "SPF checks are capped at 10 DNS lookups. Beyond that, receivers return a permanent error and your SPF silently fails — a very common cause of deliverability problems.",
      fix: "Remove include: entries for services you no longer use, or use SPF flattening to replace includes with IP addresses.",
    });
  } else if (lookups > 8) {
    if (status === "pass") status = "warn";
    issues.push({
      severity: "medium",
      title: `SPF is close to the 10 DNS lookup limit (${lookups} of 10)`,
      detail: "Adding one or two more email services will push you over the limit and break SPF entirely.",
      fix: "Audit your include: entries and remove any service you no longer send email through.",
    });
  }

  if (/\+all\s*$/.test(record.trim())) {
    status = "fail";
    issues.push({
      severity: "high",
      title: "SPF ends with +all",
      detail: "+all authorizes every server on the internet to send email as your domain, which defeats the purpose of SPF entirely.",
      fix: "Change +all to ~all (softfail) or -all (hardfail).",
    });
  } else if (/\?all\s*$/.test(record.trim())) {
    if (status === "pass") status = "warn";
    issues.push({
      severity: "medium",
      title: "SPF ends with ?all (neutral)",
      detail: "?all tells receivers to treat unauthorized senders neutrally, providing weak protection.",
      fix: "Change ?all to ~all once you are confident all your sending services are listed.",
    });
  }

  return { status, record, lookups, issues };
}

async function checkDkim(domain) {
  const found = [];
  const results = await Promise.all(
    COMMON_DKIM_SELECTORS.map(async (selector) => {
      const txt = await getTxt(`${selector}._domainkey.${domain}`);
      const rec = txt.find((r) => /p=[A-Za-z0-9+/=]{20,}/.test(r));
      return rec ? { selector, record: rec } : null;
    })
  );
  for (const r of results) if (r) found.push(r);

  if (found.length === 0) {
    return {
      status: "warn",
      selectors: [],
      issues: [{
        severity: "medium",
        title: "No DKIM keys found on common selectors",
        detail: `We probed ${COMMON_DKIM_SELECTORS.length} common DKIM selector names and found none on ${domain}. Your provider may use a custom selector name (which we cannot guess), or DKIM may not be set up. DKIM is required by Gmail and Yahoo for bulk senders.`,
        fix: "Check your email provider's admin console for DKIM setup. In Google Workspace: Admin console → Apps → Google Workspace → Gmail → Authenticate email.",
      }],
    };
  }

  const weak = found.filter((f) => {
    const m = f.record.match(/p=([A-Za-z0-9+/=]+)/);
    return m && m[1].length < 300;
  });

  const issues = [];
  let status = "pass";
  if (weak.length > 0) {
    status = "warn";
    issues.push({
      severity: "medium",
      title: `Weak DKIM key detected (selector: ${weak[0].selector})`,
      detail: "The key length appears to be 1024-bit or lower. Modern guidance is 2048-bit RSA keys.",
      fix: "Rotate to a 2048-bit key in your email provider's DKIM settings.",
    });
  }

  return { status, selectors: found.map((f) => f.selector), issues };
}

async function checkDmarc(domain) {
  const txt = await getTxt(`_dmarc.${domain}`);
  const dmarcRecords = txt.filter((r) => r.toLowerCase().startsWith("v=dmarc1"));

  if (dmarcRecords.length === 0) {
    return {
      status: "fail",
      record: null,
      issues: [{
        severity: "high",
        title: "No DMARC record found",
        detail: `There is no DMARC record at _dmarc.${domain}. Gmail, Yahoo and Microsoft now require DMARC for bulk senders, and without it anyone can spoof your domain with no policy applied.`,
        fix: `Add a TXT record at _dmarc.${domain} with value: v=DMARC1; p=none; rua=mailto:you@${domain} — this monitors without affecting delivery.`,
      }],
    };
  }

  if (dmarcRecords.length > 1) {
    return {
      status: "fail",
      record: dmarcRecords[0],
      issues: [{
        severity: "high",
        title: "Multiple DMARC records found",
        detail: "More than one DMARC record causes receivers to ignore DMARC entirely.",
        fix: "Delete the duplicates, keeping exactly one record.",
      }],
    };
  }

  const record = dmarcRecords[0];
  const tags = parseDmarcRecord(record);
  const issues = [];
  let status = "pass";

  const policy = (tags.p || "").toLowerCase();
  if (policy === "none") {
    status = "warn";
    issues.push({
      severity: "medium",
      title: "DMARC policy is p=none (monitoring only)",
      detail: "p=none means failing mail is still delivered normally. You are collecting data but not protected against spoofing — the position most domains get stuck in.",
      fix: "Once your reports show all legitimate senders passing, move to p=quarantine, then p=reject.",
    });
  } else if (!["quarantine", "reject"].includes(policy)) {
    status = "fail";
    issues.push({
      severity: "high",
      title: `Invalid or missing DMARC policy (p=${policy || "missing"})`,
      detail: "The p tag must be none, quarantine, or reject.",
      fix: "Set p=none to start monitoring safely.",
    });
  }

  if (!tags.rua) {
    if (status === "pass") status = "warn";
    issues.push({
      severity: "medium",
      title: "No reporting address (rua) configured",
      detail: "Without an rua tag, no one receives your DMARC aggregate reports. You have a policy but zero visibility into who is sending as your domain or whether authentication is passing.",
      fix: `Add rua=mailto:dmarc-reports@${domain} to your DMARC record, or point it at a monitoring service.`,
    });
  }

  const pct = tags.pct ? parseInt(tags.pct, 10) : 100;
  if (pct < 100 && ["quarantine", "reject"].includes(policy)) {
    if (status === "pass") status = "warn";
    issues.push({
      severity: "low",
      title: `Policy only applies to ${pct}% of mail (pct=${pct})`,
      detail: "A partial percentage leaves the remainder of spoofed mail unfiltered.",
      fix: "Raise pct gradually to 100 once you are confident in your setup.",
    });
  }

  return { status, record, policy, rua: tags.rua || null, issues };
}

export async function runFullCheck(rawDomain) {
  const domain = rawDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");

  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
    return { error: "That doesn't look like a valid domain. Try something like yourcompany.com" };
  }

  const [mx, spf, dkim, dmarc] = await Promise.all([
    getMx(domain),
    checkSpf(domain),
    checkDkim(domain),
    checkDmarc(domain),
  ]);

  const weights = { spf: 30, dkim: 25, dmarc: 45 };
  const scoreFor = (s) => (s === "pass" ? 1 : s === "warn" ? 0.55 : 0);
  const score = Math.round(
    scoreFor(spf.status) * weights.spf +
    scoreFor(dkim.status) * weights.dkim +
    scoreFor(dmarc.status) * weights.dmarc
  );

  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 55 ? "C" : score >= 35 ? "D" : "F";

  return {
    domain,
    checkedAt: new Date().toISOString(),
    hasMx: mx.length > 0,
    score,
    grade,
    spf,
    dkim,
    dmarc,
  };
}
