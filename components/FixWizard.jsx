"use client";

import { useState } from "react";
import { PROVIDERS, recordsForResult } from "../lib/fix-guides";

function CopyValue({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="copy-btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

export default function FixWizard({ result }) {
  const [open, setOpen] = useState(false);
  const [providerId, setProviderId] = useState("cloudflare");
  const records = recordsForResult(result);
  if (!records.length) return null;

  const provider = PROVIDERS.find((p) => p.id === providerId);

  return (
    <div className="fix-wizard">
      {!open ? (
        <button type="button" className="checker-btn" onClick={() => setOpen(true)}>
          Fix these step-by-step →
        </button>
      ) : (
        <div className="fix-panel">
          <div className="fix-head">
            <h3>Step-by-step fix guide</h3>
            <label className="fix-provider">
              Where is your DNS?
              <select value={providerId} onChange={(e) => setProviderId(e.target.value)}>
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
          </div>

          <ol className="fix-steps">
            {provider.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>

          {records.map((r, i) => (
            <div className="fix-record" key={i}>
              <p className="fix-record-label">{r.label}</p>
              {r.host && (
                <div className="fix-kv">
                  <div><span>Name / Host</span><code>{r.host}</code><CopyValue value={r.host} /></div>
                  <div><span>Type</span><code>{r.type}</code></div>
                  <div><span>Value</span><code>{r.value}</code><CopyValue value={r.value} /></div>
                </div>
              )}
              <p className="setup-note">{r.note}</p>
            </div>
          ))}

          <p className="setup-note" style={{ marginTop: "1rem" }}>
            After saving, DNS takes minutes to a few hours to update — re-run the check
            above to confirm the fix landed. Want to know if it ever breaks again?{" "}
            <a href="/login">Free monitoring watches it daily.</a>
          </p>
        </div>
      )}
    </div>
  );
}
