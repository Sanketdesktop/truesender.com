import { redirect } from "next/navigation";
import { currentUser } from "../../lib/auth";
import { query } from "../../lib/db";
import AddDomain from "../../components/AddDomain";
import LogoutButton from "../../components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const domains = await query(
    `SELECT d.id, d.domain, d.ingest_token, d.created_at,
       (SELECT count(*)::int FROM reports r WHERE r.domain_id = d.id) AS report_count,
       (SELECT max(received_at) FROM reports r WHERE r.domain_id = d.id) AS last_report
     FROM domains d WHERE d.user_id = $1 ORDER BY d.created_at`,
    [user.id]
  );

  const reportHost = process.env.REPORT_DOMAIN || "reports.example.com";

  return (
    <main className="app-shell">
      <header className="app-nav">
        <a className="wordmark" href="/">inbox<em>guard</em></a>
        <div className="app-nav-right">
          <span className="app-user">{user.email} · free early access</span>
          <LogoutButton />
        </div>
      </header>

      <div className="app-body">
        <h1 className="app-title">Your domains</h1>

        {domains.rows.length === 0 && (
          <p className="app-empty">
            Add your first domain below. You&apos;ll get a unique reporting address to
            put in your DMARC record — reports usually start arriving within 24–48
            hours.
          </p>
        )}

        <div className="domain-list">
          {domains.rows.map((d) => (
            <div className="domain-card" key={d.id}>
              <div className="domain-card-head">
                <a href={`/dashboard/${d.id}`} className="domain-card-name">{d.domain}</a>
                <span className="domain-card-meta">
                  {d.report_count > 0
                    ? `${d.report_count} report${d.report_count === 1 ? "" : "s"} · last ${new Date(d.last_report).toLocaleDateString()}`
                    : "Waiting for first report"}
                </span>
              </div>
              {d.report_count === 0 && (
                <div className="setup-box">
                  <p className="setup-title">Setup — add this TXT record at <code>_dmarc.{d.domain}</code>:</p>
                  <code className="setup-record">
                    v=DMARC1; p=none; rua=mailto:{d.ingest_token}@{reportHost}
                  </code>
                  <p className="setup-note">
                    Already have a DMARC record? Just add
                    {" "}<code>mailto:{d.ingest_token}@{reportHost}</code> to your existing rua= list (comma-separated).
                  </p>
                </div>
              )}
              <a className="domain-card-link" href={`/dashboard/${d.id}`}>Open dashboard →</a>
            </div>
          ))}
        </div>

        <AddDomain />
      </div>
    </main>
  );
}
