"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddDomain() {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    if (!domain.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Could not add domain.");
      else { setDomain(""); router.refresh(); }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="add-domain" onSubmit={submit}>
      <input
        className="checker-input"
        type="text"
        placeholder="Add a domain — yourcompany.com"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        spellCheck="false"
      />
      <button className="checker-btn" type="submit" disabled={busy}>
        {busy ? "Adding…" : "Add domain"}
      </button>
      {error && <div className="checker-error" role="alert" style={{ width: "100%" }}>{error}</div>}
    </form>
  );
}
