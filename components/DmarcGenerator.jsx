"use client";

import { useState } from "react";

export default function DmarcGenerator() {
  const [domain, setDomain] = useState("");
  const [policy, setPolicy] = useState("none");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  const rua = email.trim() ? `; rua=mailto:${email.trim()}` : "";
  const record = `v=DMARC1; p=${policy}${rua}`;
  const host = cleanDomain ? `_dmarc.${cleanDomain}` : "_dmarc.yourdomain.com";

  async function copy() {
    try {
      await navigator.clipboard.writeText(record);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <div className="gen">
      <div className="gen-controls">
        <label className="gen-field">
          <span>Your domain</span>
          <input
            type="text"
            placeholder="yourcompany.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            spellCheck="false"
          />
        </label>
        <label className="gen-field">
          <span>Reports email</span>
          <input
            type="text"
            placeholder="dmarc@yourcompany.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            spellCheck="false"
          />
        </label>
        <div className="gen-field">
          <span>Policy</span>
          <div className="gen-seg" role="radiogroup" aria-label="DMARC policy">
            {[
              ["none", "Monitor"],
              ["quarantine", "Quarantine"],
              ["reject", "Reject"],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                role="radio"
                aria-checked={policy === val}
                className={policy === val ? "seg-on" : ""}
                onClick={() => setPolicy(val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="gen-out">
        <div className="gen-out-row">
          <span className="gen-out-label">Host</span>
          <code>{host}</code>
        </div>
        <div className="gen-out-row">
          <span className="gen-out-label">Type</span>
          <code>TXT</code>
        </div>
        <div className="gen-out-row">
          <span className="gen-out-label">Value</span>
          <code>{record}</code>
          <button type="button" className="copy-btn" onClick={copy}>
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        <p className="gen-note">
          {policy === "none" &&
            "Monitor mode: nothing about your delivery changes — you just start receiving reports. The safe starting point."}
          {policy === "quarantine" &&
            "Failing mail goes to spam folders. Use only after monitoring shows your legitimate senders passing."}
          {policy === "reject" &&
            "Failing mail is refused outright. Full protection — the end goal once everything passes cleanly."}
        </p>
      </div>
    </div>
  );
}
