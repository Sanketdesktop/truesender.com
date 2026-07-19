import { redirect, notFound } from "next/navigation";
import { currentUser } from "../../../lib/auth";
import { query } from "../../../lib/db";
import { runFullCheck } from "../../../lib/dns-checks";

export const dynamic = "force-dynamic";

function PassRateChart({ days }) {
  if (!days.length) return null;
  const W = 640, H = 140, pad = 8;
  const xs = (i) => pad + (i * (W - 2 * pad)) / Math.max(days.length - 1, 1);
  const ys = (rate) => H - pad - rate * (H - 2 * pad);
  const points = days.map((d, i) => `${xs(i)},${ys(d.rate)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Daily authentication pass rate">
      <polyline points={`${points} ${xs(days.length - 1)},${H - pad} ${xs(0)},${H - pad}`} fill="var(--pine-wash)" opacity="0.5" stroke="none" />
      <polyline points={points} fill="none" stroke="var(--pine-bright)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {days.map((d, i) => (
        <circle key={i} cx={xs(i)} cy={ys(d.rate)} r="3" fill="var(--pine-bright)" />
      ))}
    </svg>
  );
}

function WizardCard({ readiness, domain, ingestToken, reportHost }) {
  const { policy, allKnownPassing, daysOfData, totalMsgs } = readiness;
  let title, body, record;

  if (!policy || policy === "none") {
    if (daysOfData < 7 || !allKnownPassing) {
      title = "Stay at p=none for now";
      body = daysOfData < 7
        ? `You have ${daysOfData} day${daysOfData === 1 ? "" : "s"} of report data. Collect at least 7 days before tightening the policy, so every legitimate sender has appeared in reports.`
        : "Some of your identified senders are still failing authentication. Fix those first — tightening the policy now would send their mail to spam.";
    } else {
      title = "Ready to move to p=quarantine";
      body = `All identified senders are passing across ${totalMsgs.toLocaleString()} messages. Update your DMARC record to start quarantining spoofed mail:`;
      record = `v=DMARC1; p=quarantine; pct=25; rua=mailto:${ingestToken}@${reportHost}`;
    }
  } else if (policy === "quarantine") {
    if (allKnownPassing) {
      title = "Ready for full protection: p=reject";
      body = "Quarantine is running clean. The final step rejects spoofed mail outright:";
      record = `v=DMARC1; p=reject; rua=mailto:${ingestToken}@${reportHost}`;
    } else {
      title = "Hold at p=quarantine";
      body = "A sender is failing under quarantine. Investigate the failing source below before moving to p=reject.";
    }
  } else {
    title = "Fully protected — p=reject";
    body = "Spoofed mail claiming to be your domain is being rejected. We'll alert you if anything changes.";
  }

  return (
    <div className="wizard-card">
      <p className="kicker">Enforcement wizard</p>
      <h3>{title}</h3>
      <p>{body}</p>
      {record && <code className="setup-record">{record}</code>}
    </div>
  );
}

export default async function DomainDashboard({ params }) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const domRes = await query(
    "SELECT id, domain, ingest_token FROM domains WHERE id = $1 AND user_id = $2",
    [params.id, user.id]
  );
  if (!domRes.rows.length) notFound();
  const dom = domRes.rows[0];
  const reportHost = process.env.REPORT_DOMAIN || "reports.example.com";

  const [daily, sources, threats, health] = await Promise.all([
    query(
      `SELECT date_trunc('day', date_begin) AS day,
        SUM(msg_count) FILTER (WHERE eval_spf = 'pass' OR eval_dkim = 'pass')::float AS pass,
        SUM(msg_count)::float AS total
       FROM report_records WHERE domain_id = $1 AND date_begin > now() - interval '30 days'
       GROUP BY 1 ORDER BY 1`,
      [dom.id]
    ),
    query(
      `SELECT source_name,
        count(DISTINCT source_ip)::int AS ips,
        SUM(msg_count)::int AS msgs,
        ROUND(100.0 * SUM(msg_count) FILTER (WHERE eval_spf = 'pass' OR eval_dkim = 'pass') / NULLIF(SUM(msg_count),0))::int AS pass_pct
       FROM report_records WHERE domain_id = $1
       GROUP BY source_name ORDER BY msgs DESC LIMIT 20`,
      [dom.id]
    ),
    query(
      `SELECT source_ip, source_name, SUM(msg_count)::int AS msgs, max(date_begin) AS last_seen
       FROM report_records
       WHERE domain_id = $1 AND eval_spf != 'pass' AND eval_dkim != 'pass'
       GROUP BY source_ip, source_name ORDER BY msgs DESC LIMIT 10`,
      [dom.id]
    ),
    runFullCheck(dom.domain).catch(() => null),
  ]);

  const days = daily.rows.map((r) => ({
    day: r.day,
    rate: r.total > 0 ? r.pass / r.total : 0,
  }));

  const totalMsgs = sources.rows.reduce((a, s) => a + s.msgs, 0);
  const overallPass = totalMsgs
    ? Math.round(sources.rows.reduce((a, s) => a + (s.pass_pct || 0) * s.msgs, 0) / totalMsgs)
    : null;

  const knownSources = sources.rows.filter((s) => s.source_name && s.source_name !== "Unknown sender");
  const readiness = {
    policy: health?.dmarc?.policy || null,
    allKnownPassing: knownSources.length > 0 && knownSources.every((s) => (s.pass_pct || 0) >= 98),
    daysOfData: days.length,
    totalMsgs,
  };

  return (
    <main className="app-shell">
      <header className="app-nav">
        <a className="wordmark" href="/">inbox<em>guard</em></a>
        <a className="copy-btn" href="/dashboard">← All domains</a>
      </header>

      <div className="app-body">
        <div className="domain-head">
          <h1 className="app-title">{dom.domain}</h1>
          {health?.dmarc?.policy && (
            <span className={`policy-pill policy-${health.dmarc.policy}`}>p={health.dmarc.policy}</span>
          )}
          {overallPass !== null && (
            <span className="app-user">{overallPass}% pass · {totalMsgs.toLocaleString()} messages analyzed</span>
          )}
        </div>

        {days.length === 0 ? (
          <div className="setup-box" style={{ marginTop: "1.5rem" }}>
            <p className="setup-title">No reports yet. Add this TXT record at <code>_dmarc.{dom.domain}</code>:</p>
            <code className="setup-record">v=DMARC1; p=none; rua=mailto:{dom.ingest_token}@{reportHost}</code>
            <p className="setup-note">Mailbox providers send reports once a day — expect the first within 24–48 hours of adding the record.</p>
          </div>
        ) : (
          <>
            <section className="panel">
              <h2 className="panel-title">Pass rate — last 30 days</h2>
              <PassRateChart days={days} />
            </section>

            <WizardCard readiness={readiness} domain={dom.domain} ingestToken={dom.ingest_token} reportHost={reportHost} />

            <section className="panel">
              <h2 className="panel-title">Who is sending as {dom.domain}</h2>
              <table className="src-table">
                <thead>
                  <tr><th>Sender</th><th>IPs</th><th>Messages</th><th>Pass rate</th></tr>
                </thead>
                <tbody>
                  {sources.rows.map((s, i) => (
                    <tr key={i}>
                      <td>{s.source_name || "Unknown sender"}</td>
                      <td>{s.ips}</td>
                      <td>{s.msgs.toLocaleString()}</td>
                      <td className={s.pass_pct >= 98 ? "status-pass" : s.pass_pct >= 60 ? "status-warn" : "status-fail"}>
                        {s.pass_pct ?? 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {threats.rows.length > 0 && (
              <section className="panel panel-threat">
                <h2 className="panel-title">Failing sources — possible spoofing or misconfiguration</h2>
                <table className="src-table">
                  <thead>
                    <tr><th>IP</th><th>Identified as</th><th>Messages</th><th>Last seen</th></tr>
                  </thead>
                  <tbody>
                    {threats.rows.map((t, i) => (
                      <tr key={i}>
                        <td><code>{t.source_ip}</code></td>
                        <td>{t.source_name || "Unknown"}</td>
                        <td>{t.msgs.toLocaleString()}</td>
                        <td>{new Date(t.last_seen).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="setup-note">
                  Failing mail from a service you recognize means misconfiguration — check its SPF/DKIM setup.
                  Failing mail from unknown IPs is likely spoofing; a stricter DMARC policy will stop it.
                </p>
              </section>
            )}

            {health && (
              <section className="panel">
                <h2 className="panel-title">Live DNS health</h2>
                <p className="app-user">
                  SPF: <b className={`status-${health.spf.status}`}>{health.spf.status}</b>
                  {" · "}DKIM: <b className={`status-${health.dkim.status}`}>{health.dkim.status}</b>
                  {" · "}DMARC: <b className={`status-${health.dmarc.status}`}>{health.dmarc.status}</b>
                  {" · "}Score: <b>{health.score}/100 ({health.grade})</b>
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
