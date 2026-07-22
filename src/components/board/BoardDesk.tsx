"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
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
      credentials: "same-origin",
    });
    const data = await res.json();
    if (data.finding) replaceFinding(data.finding);
  }

  async function ingest() {
    setMessage("Ingesting GitHub…");
    startTransition(async () => {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        credentials: "same-origin",
      });
      const data = await res.json();
      const listRes = await fetch("/api/findings", { credentials: "same-origin" });
      const listData = await listRes.json();
      if (listData.findings) {
        setFindings(listData.findings);
        if (!selectedId && listData.findings[0]) {
          setSelectedId(listData.findings[0].id);
        }
      }
      setMessage(
        data.warning
          ? `${data.warning}${data.privateIncluded ? " (private repos included)" : ""}`
          : `Scanned ${data.scanned} repos; upserted ${data.upserted}${
              data.privateIncluded ? "; private repos included" : ""
            }.`,
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
        credentials: "same-origin",
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
    setMessage("Approving and posting…");
    startTransition(async () => {
      const res = await fetch(`/api/findings/${selected.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread }),
        credentials: "same-origin",
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
        headers: { "Content-Type": "application/json" },
        body: "{}",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (data.finding) replaceFinding(data.finding);
      setMessage("Skipped.");
    });
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      credentials: "same-origin",
    });
    window.location.href = "/board/login";
  }

  const inbox = findings.filter((f) =>
    ["new", "drafted", "approved"].includes(f.status),
  );
  const history = findings.filter((f) =>
    ["posted", "skipped"].includes(f.status),
  );

  return (
    <div className="page page-wide">
      <div className="board-shell">
      <header className="site-header">
        <h1>Findings board</h1>
        <p className="meta">
          Private desk. Draft dry threads with jokes that have a second floor.
          Approve once to post.
        </p>
        <nav>
          <Link href="/">Home</Link>
          <button type="button" className="btn" onClick={ingest} disabled={pending}>
            Ingest GitHub
          </button>
          <button type="button" className="btn" onClick={logout}>
            Log out
          </button>
        </nav>
      </header>
      <hr />

      <div className="board-layout">
        <aside>
          <h2>Inbox</h2>
          <div className="inbox">
            {inbox.map((f) => (
              <button
                key={f.id}
                type="button"
                className={selected?.id === f.id ? "active" : ""}
                onClick={() => {
                  setSelectedId(f.id);
                  setVoice(f.voice);
                }}
              >
                {f.title}
                <br />
                <span className="meta">
                  {f.status} · {f.repoFullName || "local"}
                </span>
              </button>
            ))}
            {inbox.length === 0 && <p className="muted">Inbox clear.</p>}
          </div>

          <h2>History</h2>
          <ul className="history-list">
            {history.slice(0, 10).map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setSelectedId(f.id)}
                >
                  {f.title} ({f.status}
                  {f.dryRun ? ", dry" : ""})
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section>
          {!selected ? (
            <p className="muted">
              Inbox is empty. Ingest GitHub when you want drafts from real
              repos — nothing is faked here.
            </p>
          ) : (
            <>
              <h2>{selected.title}</h2>
              <p className="meta">{selected.whyPicked}</p>
              <p>{selected.summary}</p>
              <p>
                <a href={selected.repoUrl} target="_blank" rel="noreferrer">
                  {selected.repoFullName || selected.repoUrl}
                </a>
                {selected.postedThreadUrl && (
                  <>
                    {" · "}
                    <a
                      href={selected.postedThreadUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      live thread
                    </a>
                  </>
                )}
              </p>
              {selected.mediaUrls[0] && (
                <div className="media-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.mediaUrls[0]} alt="" />
                </div>
              )}

              <h2>Voice</h2>
              <div className="btn-row">
                {VOICES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`btn ${voice === v.id ? "btn-primary" : ""}`}
                    onClick={() => setVoice(v.id)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              <h2>Thread draft</h2>
              <p>
                <button type="button" className="btn" onClick={addTweet}>
                  Add tweet
                </button>
              </p>

              {thread.length === 0 ? (
                <p className="muted">No draft yet. Press Regenerate.</p>
              ) : (
                <ol className="thread-list">
                  {thread.map((tweet, index) => (
                    <li key={`${selected.id}-tweet-${index}`}>
                      <p className="meta">
                        {index + 1}/{thread.length}{" "}
                        <button
                          type="button"
                          className="btn"
                          onClick={() => removeTweet(index)}
                        >
                          Remove
                        </button>
                      </p>
                      <textarea
                        className="field"
                        rows={4}
                        value={tweet.text}
                        onChange={(e) => updateTweet(index, e.target.value)}
                        onBlur={(e) => commitTweet(index, e.target.value)}
                        maxLength={280}
                        enterKeyHint="done"
                      />
                      <p className="meta">{tweet.text.length}/280</p>
                    </li>
                  ))}
                </ol>
              )}

              <div className="board-actions">
                <div className="btn-row">
                  <button
                    type="button"
                    className="btn"
                    onClick={draft}
                    disabled={pending}
                  >
                    Regenerate
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={approve}
                    disabled={pending || thread.length === 0}
                  >
                    Approve &amp; post
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={skip}
                    disabled={pending}
                  >
                    Skip
                  </button>
                </div>
                {message && <p className="meta">{message}</p>}
              </div>
            </>
          )}
        </section>
      </div>
      </div>
    </div>
  );
}
