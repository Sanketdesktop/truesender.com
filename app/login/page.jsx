"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong.");
      else router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-wrap">
      <a className="wordmark" href="/">inbox<em>guard</em></a>
      <form className="auth-card" onSubmit={submit}>
        <h1>{mode === "signup" ? "Start monitoring your domain" : "Welcome back"}</h1>
        <p className="auth-sub">
          {mode === "signup"
            ? "Free during early access — full dashboard, alerts, and up to 3 domains."
            : "Log in to your monitoring dashboard."}
        </p>
        <label className="gen-field">
          <span>Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </label>
        <label className="gen-field">
          <span>Password</span>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </label>
        {error && <div className="checker-error" role="alert">{error}</div>}
        <button className="checker-btn auth-btn" disabled={busy} type="submit">
          {busy ? "One moment…" : mode === "signup" ? "Create free account" : "Log in"}
        </button>
        <button
          type="button"
          className="auth-switch"
          onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(null); }}
        >
          {mode === "signup" ? "Already have an account? Log in" : "New here? Create a free account"}
        </button>
      </form>
    </main>
  );
}
