"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");

  async function submit(e) {
    e.preventDefault();
    if (!email.trim() || state === "busy") return;
    setState("busy");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <p className="waitlist-done">You&apos;re on the list — we&apos;ll email you at launch. ✓</p>;
  }

  return (
    <form className="waitlist-form" onSubmit={submit}>
      <input
        className="checker-input"
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email for early access"
      />
      <button className="checker-btn" type="submit" disabled={state === "busy"}>
        {state === "busy" ? "Saving…" : "Get early access"}
      </button>
      {state === "error" && <span className="checker-error" style={{ width: "100%" }}>Could not save — try again.</span>}
    </form>
  );
}
