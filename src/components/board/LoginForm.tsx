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
    });
    setLoading(false);
    if (!res.ok) {
      setError("Wrong password.");
      return;
    }
    router.replace("/board");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-5">
      <div>
        <label className="mono mb-2 block text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Board password
        </label>
        <input
          className="field"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
      </div>
      {error && <p className="text-sm text-[var(--warn)]">{error}</p>}
      <div className="flex gap-3">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Opening…" : "Enter board"}
        </button>
        <Link className="btn btn-ghost" href="/">
          Back
        </Link>
      </div>
    </form>
  );
}
