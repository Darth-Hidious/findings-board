"use client";

import { useMemo, useState, useTransition } from "react";
import type { Finding, ThreadTweet, VoiceMode } from "@/lib/types";

const VOICES: { id: VoiceMode; label: string }[] = [
  { id: "dry", label: "Dry" },
  { id: "dry_bones", label: "Dry + Bones" },
  { id: "bones_forward", label: "Bones-forward" },
];

export function BoardDesk({ initialFindings }: { initialFindings: Finding[] }) {
  const [findings, setFindings] = useState(initialFindings);
  const [selectedId, setSelectedId] = useState(initialFindings[0]?.id || "");
  const [voice, setVoice] = useState<VoiceMode>("dry_bones");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const selected = useMemo(
    () => findings.find((f) => f.id === selectedId) || findings[0] || null,
    [findings, selectedId],
  );

  const thread = selected?.threadJson || [];

  function replaceFinding(next: Finding) {
    setFindings((prev) => {
      const rest = prev.filter((f) => f.id !== next.id);
      return [next, ...rest].sort((a, b) =>
        a.updatedAt < b.updatedAt ? 1 : -1,
      );
    });
    setSelectedId(next.id);
  }

  function updateTweet(index: number, text: string) {
    if (!selected) return;
    const nextThread = thread.map((t, i) =>
      i === index ? { ...t, text } : t,
    );
    replaceFinding({ ...selected, threadJson: nextThread });
  }

  function commitTweet(index: number, text: string) {
    if (!selected) return;
    const nextThread = thread.map((t, i) =>
      i === index ? { ...t, text } : t,
    );
    replaceFinding({ ...selected, threadJson: nextThread });
    void saveThread(nextThread);
  }

  function addTweet() {
    if (!selected) return;
    const nextThread = [...thread, { text: "" }];
    replaceFinding({ ...selected, threadJson: nextThread });
  }

  function removeTweet(index: number) {
    if (!selected) return;
    const nextThread = thread.filter((_, i) => i !== index);
    replaceFinding({ ...selected, threadJson: nextThread });
  }

  async function saveThread(nextThread: ThreadTweet[]) {
    if (!selected) return;
    const res = await fetch("/api/findings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, thread: nextThread }),
    });
    const data = await res.json();
    if (data.finding) replaceFinding(data.finding);
  }

  async function ingest() {
    setMessage("Ingesting GitHub…");
    startTransition(async () => {
      const res = await fetch("/api/ingest", { method: "POST" });
      const data = await res.json();
      const listRes = await fetch("/api/findings");
      const listData = await listRes.json();
      if (listData.findings) {
        setFindings(listData.findings);
        if (!selectedId && listData.findings[0]) {
          setSelectedId(listData.findings[0].id);
        }
      }
      setMessage(
        data.warning
          ? data.warning
          : `Scanned ${data.scanned} repos · upserted ${data.upserted}`,
      );
    });
  }

  async function draft() {
    if (!selected) return;
    setMessage("Drafting thread…");
    startTransition(async () => {
      await saveThread(thread);
      const res = await fetch(`/api/findings/${selected.id}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice }),
      });
      const data = await res.json();
      if (data.finding) replaceFinding(data.finding);
      setMessage(
        data.usedFallback
          ? "Drafted with local fallback (no XAI_API_KEY or Grok error)."
          : `Drafted with ${data.model || "Grok"}.`,
      );
    });
  }

  async function approve() {
    if (!selected) return;
    setMessage("Approving & posting…");
    startTransition(async () => {
      const res = await fetch(`/api/findings/${selected.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread }),
      });
      const data = await res.json();
      if (data.finding) replaceFinding(data.finding);
      setMessage(data.post?.message || "Posted.");
    });
  }

  async function skip() {
    if (!selected) return;
    startTransition(async () => {
      const res = await fetch(`/api/findings/${selected.id}/skip`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.finding) replaceFinding(data.finding);
      setMessage("Skipped.");
    });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/board/login";
  }

  const inbox = findings.filter((f) =>
    ["new", "drafted", "approved"].includes(f.status),
  );
  const history = findings.filter((f) =>
    ["posted", "skipped"].includes(f.status),
  );

  return (
    <div className="mx-auto grid min-h-[100svh] w-full max-w-7xl gap-8 px-4 py-8 md:grid-cols-[280px_1fr] md:px-8">
      <aside className="space-y-6">
        <div>
          <p className="mono text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Desk
          </p>
          <h1 className="display mt-2 text-3xl">Findings board</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost" onClick={ingest} disabled={pending}>
            Ingest GitHub
          </button>
          <button className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>

        <section>
          <h2 className="mono mb-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Inbox
          </h2>
          <ul className="space-y-2">
            {inbox.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(f.id);
                    setVoice(f.voice);
                  }}
                  className={`w-full border px-3 py-3 text-left transition ${
                    selected?.id === f.id
                      ? "border-[var(--accent)] bg-[rgba(198,245,76,0.08)]"
                      : "border-[var(--line)] hover:border-[rgba(198,245,76,0.35)]"
                  }`}
                >
                  <span className="block text-sm">{f.title}</span>
                  <span className="mono mt-1 block text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    {f.status} · {f.repoFullName || "local"}
                  </span>
                </button>
              </li>
            ))}
            {inbox.length === 0 && (
              <li className="text-sm text-[var(--muted)]">Inbox clear.</li>
            )}
          </ul>
        </section>

        <section>
          <h2 className="mono mb-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            History
          </h2>
          <ul className="space-y-2">
            {history.slice(0, 8).map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(f.id)}
                  className="w-full border border-[var(--line)] px-3 py-2 text-left text-sm text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  {f.title}
                  <span className="mono ml-2 text-[10px] uppercase">
                    {f.status}
                    {f.dryRun ? " dry" : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      <section className="min-w-0">
        {!selected ? (
          <p className="text-[var(--muted)]">No findings yet. Run ingest.</p>
        ) : (
          <div className="space-y-8">
            <header className="border-b border-[var(--line)] pb-6">
              <p className="mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                {selected.whyPicked}
              </p>
              <h2 className="display mt-2 text-4xl md:text-5xl">
                {selected.title}
              </h2>
              <p className="mt-3 max-w-2xl text-[var(--muted)]">
                {selected.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <a
                  className="underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--accent)]"
                  href={selected.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {selected.repoFullName || selected.repoUrl}
                </a>
                {selected.postedThreadUrl && (
                  <a
                    className="underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--accent)]"
                    href={selected.postedThreadUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Live thread
                  </a>
                )}
              </div>
              {selected.mediaUrls[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.mediaUrls[0]}
                  alt=""
                  className="mt-6 max-h-64 w-full object-cover opacity-90"
                />
              )}
            </header>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mono mr-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Voice
              </span>
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`btn ${voice === v.id ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setVoice(v.id)}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Thread draft
                </h3>
                <button className="btn btn-ghost" type="button" onClick={addTweet}>
                  Add tweet
                </button>
              </div>

              {thread.length === 0 ? (
                <p className="text-[var(--muted)]">
                  No draft yet. Hit regenerate.
                </p>
              ) : (
                thread.map((tweet, index) => (
                  <div
                    key={`${selected.id}-tweet-${index}`}
                    className="bubble border border-[var(--line)] bg-[rgba(18,24,33,0.7)] p-4"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">
                        {index + 1}/{thread.length}
                      </span>
                      <button
                        type="button"
                        className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] hover:text-[var(--warn)]"
                        onClick={() => removeTweet(index)}
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      className="field min-h-24"
                      value={tweet.text}
                      onChange={(e) => updateTweet(index, e.target.value)}
                      onBlur={(e) => commitTweet(index, e.target.value)}
                      maxLength={280}
                    />
                    <p className="mono mt-2 text-right text-[10px] text-[var(--muted)]">
                      {tweet.text.length}/280
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="sticky bottom-4 flex flex-wrap gap-3 border border-[var(--line)] bg-[rgba(11,15,20,0.92)] p-3 backdrop-blur">
              <button
                className="btn btn-ghost"
                onClick={draft}
                disabled={pending}
              >
                Regenerate
              </button>
              <button
                className="btn btn-primary approve-pulse"
                onClick={approve}
                disabled={pending || thread.length === 0}
              >
                Approve & post
              </button>
              <button
                className="btn btn-danger"
                onClick={skip}
                disabled={pending}
              >
                Skip
              </button>
            </div>

            {message && (
              <p className="mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                {message}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
