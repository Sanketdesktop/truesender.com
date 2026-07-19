"use client";

import { useEffect, useRef, useState } from "react";

const STATUS_LABEL = { pass: "Passing", warn: "Needs attention", fail: "Failing" };
const EXAMPLES = ["google.com", "github.com", "stripe.com"];
const STAGES = [
  "Looking up DMARC policy…",
  "Reading SPF record…",
  "Probing 20 DKIM selectors…",
  "Scoring the results…",
];

function gradeMessage(grade) {
  switch (grade) {
    case "A": return "Excellent — your email authentication is in strong shape.";
    case "B": return "Good foundation, with a few things worth tightening up.";
    case "C": return "Partially protected — some gaps are hurting your deliverability.";
    case "D": return "At risk — receivers may be spam-foldering or rejecting your mail.";
    default: return "Unprotected — your domain is open to spoofing and delivery failures.";
  }
}

function ScoreRing({ score, grade }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const cls = grade === "A" || grade === "B" ? "ring-good" : grade === "C" || grade === "D" ? "ring-mid" : "ring-bad";
  return (
    <div className="score-ring" role="img" aria-label={`Score ${score} out of 100, grade ${grade}`}>
      <svg viewBox="0 0 100 100" width="104" height="104">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--hairline)" strokeWidth="7" />
        <circle
          cx="50" cy="50" r={r} fill="none" strokeWidth="7" strokeLinecap="round"
          className={cls}
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="score-ring-inner">
        <b>{grade}</b>
        <span>{score}/100</span>
      </div>
    </div>
  );
}

function CopyableRecord({ record }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(record);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }
  return (
    <div className="record-line">
      <span>{record}</span>
      <button type="button" className="copy-btn" onClick={copy} aria-label="Copy record">
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}

function CheckSection({ name, fullName, data, extra }) {
  return (
    <div className="check-row">
      <div>
        <div className="check-name">{name}</div>
        <small className={`check-name status-${data.status}`}>{STATUS_LABEL[data.status]}</small>
      </div>
      <div>
        {data.record && <CopyableRecord record={data.record} />}
        {extra}
        {data.issues.length === 0 ? (
          <p className="all-clear">
            <b>Looks good.</b> Your {fullName} configuration passed every check we ran.
          </p>
        ) : (
          data.issues.map((issue, i) => (
            <div className="issue" key={i}>
              <h3>
                <span className={`issue-dot dot-${issue.severity}`} aria-hidden="true" />
                {issue.title}
              </h3>
              <p>{issue.detail}</p>
              <p className="fix"><b>How to fix:</b> {issue.fix}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Skeleton({ stage }) {
  return (
    <div className="results skeleton-wrap" aria-live="polite">
      <p className="skeleton-stage">{stage}</p>
      <div className="skeleton-band">
        <div className="skeleton-circle" />
        <div style={{ flex: 1 }}>
          <div className="skeleton-bar" style={{ width: "45%" }} />
          <div className="skeleton-bar" style={{ width: "70%", marginTop: "0.6rem" }} />
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div className="skeleton-row" key={i}>
          <div className="skeleton-bar" style={{ width: 90 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-bar" style={{ width: "90%" }} />
            <div className="skeleton-bar" style={{ width: "60%", marginTop: "0.6rem" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Checker() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(STAGES[0]);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const stageTimer = useRef(null);

  async function runCheck(target) {
    const d = (target || domain).trim();
    if (!d || loading) return;
    setDomain(d);
    setLoading(true);
    setError(null);
    setResult(null);

    let i = 0;
    setStage(STAGES[0]);
    stageTimer.current = setInterval(() => {
      i = Math.min(i + 1, STAGES.length - 1);
      setStage(STAGES[i]);
    }, 1600);

    try {
      const res = await fetch(`/api/check?domain=${encodeURIComponent(d)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setResult(data);
        try {
          const url = new URL(window.location.href);
          url.searchParams.set("domain", data.domain);
          window.history.replaceState(null, "", url.toString());
        } catch {}
      }
    } catch {
      setError("Could not reach the checker. Please try again.");
    } finally {
      clearInterval(stageTimer.current);
      setLoading(false);
    }
  }

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("domain");
    if (param) runCheck(param);
    return () => clearInterval(stageTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="checker" id="checker">
      <form
        className="checker-form"
        onSubmit={(e) => { e.preventDefault(); runCheck(); }}
      >
        <input
          className="checker-input"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck="false"
          placeholder="yourcompany.com"
          aria-label="Domain to check"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button className="checker-btn" type="submit" disabled={loading}>
          {loading ? "Checking…" : "Check my domain"}
        </button>
      </form>
      <div className="checker-meta">
        <span className="checker-hint">Free · instant · nothing stored</span>
        <span className="chip-row" aria-label="Example domains">
          try:
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="chip" onClick={() => runCheck(ex)} disabled={loading}>
              {ex}
            </button>
          ))}
        </span>
      </div>

      {error && <div className="checker-error" role="alert">{error}</div>}
      {loading && <Skeleton stage={stage} />}

      {result && !loading && (
        <div className="results" aria-live="polite">
          <div className="score-band">
            <ScoreRing score={result.score} grade={result.grade} />
            <div className="score-copy">
              <h2>
                <span className="domain-name">{result.domain}</span>
              </h2>
              <p>{gradeMessage(result.grade)}</p>
              <p className="share-hint">This result has its own link — copy the URL to share it.</p>
            </div>
          </div>

          <div className="check-rows">
            <CheckSection
              name="DMARC" fullName="DMARC" data={result.dmarc}
              extra={
                result.dmarc.policy ? (
                  <p className="all-clear" style={{ marginBottom: "0.9rem" }}>
                    Current policy: <b>p={result.dmarc.policy}</b>
                    {result.dmarc.rua ? <> · reports go to <b>{result.dmarc.rua.replace(/^mailto:/, "").split(",")[0]}</b></> : null}
                  </p>
                ) : null
              }
            />
            <CheckSection
              name="SPF" fullName="SPF" data={result.spf}
              extra={
                typeof result.spf.lookups === "number" ? (
                  <p className="all-clear" style={{ marginBottom: "0.9rem" }}>
                    DNS lookups used: <b>{result.spf.lookups} of 10</b>
                  </p>
                ) : null
              }
            />
            <CheckSection
              name="DKIM" fullName="DKIM" data={result.dkim}
              extra={
                result.dkim.selectors && result.dkim.selectors.length > 0 ? (
                  <p className="all-clear" style={{ marginBottom: "0.9rem" }}>
                    Keys found on selector{result.dkim.selectors.length > 1 ? "s" : ""}:{" "}
                    <b>{result.dkim.selectors.join(", ")}</b>
                  </p>
                ) : null
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
