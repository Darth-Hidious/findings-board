"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "same-origin",
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(
        res.status === 429
          ? "Too many attempts. Wait a bit."
          : data.error || "Wrong password.",
      );
      return;
    }
    router.replace("/board");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <p>
        <label htmlFor="password">Board password</label>
        <br />
        <input
          id="password"
          className="field"
          type="password"
          name="password"
          autoComplete="current-password"
          inputMode="text"
          enterKeyHint="go"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
      </p>
      {error && <p style={{ color: "var(--warn)" }}>{error}</p>}
      <div className="btn-row">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Opening…" : "Enter board"}
        </button>
        <Link className="btn" href="/">
          Back
        </Link>
      </div>
    </form>
  );
}
