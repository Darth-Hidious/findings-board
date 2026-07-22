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
    <form onSubmit={onSubmit}>
      <p>
        <label htmlFor="password">Board password</label>
        <br />
        <input
          id="password"
          className="field"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
      </p>
      {error && <p style={{ color: "var(--warn)" }}>{error}</p>}
      <p>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Opening…" : "Enter board"}
        </button>{" "}
        <Link className="btn" href="/">
          Back
        </Link>
      </p>
    </form>
  );
}
