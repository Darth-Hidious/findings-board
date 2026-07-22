"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { Finding, FindingStatus, ThreadTweet, VoiceMode } from "@/lib/types";

const VOICES: { id: VoiceMode; label: string; hint: string }[] = [
  { id: "dry", label: "Dry", hint: "Facts only" },
  { id: "dry_bones", label: "Dry + Bones", hint: "Facts, then a layered joke" },
  { id: "bones_forward", label: "Bones-forward", hint: "Joke leads, still grounded" },
];

type Filter = "queue" | "ready" | "posted" | "all";

function statusLabel(status: FindingStatus): string {
  switch (status) {
    case "new":
      return "Needs draft";
    case "drafted":
      return "Ready to edit";
    case "approved":
      return "Approved";
    case "posted":
      return "Posted";
    case "skipped":
      return "Skipped";
    default:
      return status;
  }
}

function charTone(n: number): string {
  if (n > 280) return "over";
  if (n > 240) return "warn";
  return "ok";
}

export function BoardDesk({ initialFindings }: { initialFindings: Finding[] }) {
  const [findings, setFindings] = useState(initialFindings);
  const [selectedId, setSelectedId] = useState(initialFindings[0]?.id || "");
  const [voice, setVoice] = useState<VoiceMode>("dry_bones");
  const [filter, setFilter] = useState<Filter>("queue");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const selected = useMemo(
    () => findings.find((f) => f.id === selectedId) || findings[0] || null,
    [findings, selectedId],
  );

  const thread = selected?.threadJson || [];

  const counts = useMemo(() => {
    const queue = findings.filter((f) =>
      ["new", "drafted", "approved"].includes(f.status),
    ).length;
    const ready = findings.filter(
      (f) => f.status === "drafted" && f.threadJson.length > 0,
    ).length;
    const posted = findings.filter((f) => f.status === "posted").length;
    return { queue, ready, posted, all: findings.length };
  }, [findings]);

  const visible = useMemo(() => {
    if (filter === "queue") {
      return findings.filter((f) =>
        ["new", "drafted", "approved"].includes(f.status),
      );
    }
    if (filter === "ready") {
      return findings.filter(
        (f) => f.status === "drafted" && f.threadJson.length > 0,
      );
    }
    if (filter === "posted") {
      return findings.filter((f) => f.status === "posted");
    }
    return findings;
  }, [findings, filter]);

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

  function moveTweet(index: number, dir: -1 | 1) {
    if (!selected) return;
    const j = index + dir;
    if (j < 0 || j >= thread.length) return;
    const next = [...thread];
    const tmp = next[index]!;
    next[index] = next[j]!;
    next[j] = tmp;
    replaceFinding({ ...selected, threadJson: next });
    void saveThread(next);
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
    setMessage("Pulling repos from GitHub…");
    startTransition(async () => {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        credentials: "same-origin",
      });
      const data = await res.json();
      const listRes = await fetch("/api/findings", {
        credentials: "same-origin",
      });
      const listData = await listRes.json();
      if (listData.findings) {
        setFindings(listData.findings);
        const firstNew =
          listData.findings.find((f: Finding) => f.status === "new") ||
          listData.findings[0];
        if (firstNew) {
          setSelectedId(firstNew.id);
          setVoice(firstNew.voice || "dry_bones");
          setFilter("queue");
        }
      }
      setMessage(
        data.error
          ? data.error
          : data.warning
            ? data.warning
            : `Loaded ${data.upserted} items from ${data.scanned} repos${
                data.privateIncluded ? " (incl. private)" : ""
              }.`,
      );
    });
  }

  async function draft() {
    if (!selected) return;
    setMessage("Writing thread…");
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
        data.error
          ? data.error
          : data.usedFallback
            ? "Drafted offline (add XAI_API_KEY for Grok)."
            : `Draft ready (${data.model || "Grok"}).`,
      );
    });
  }

  async function approve() {
    if (!selected) return;
    setMessage("Posting thread…");
    startTransition(async () => {
      const res = await fetch(`/api/findings/${selected.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread }),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (data.finding) replaceFinding(data.finding);
      setMessage(data.post?.message || data.error || "Posted.");
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

  const noteSlug = selected?.repoFullName.split("/")[1]?.toLowerCase();

  return (
    <div className="page page-wide">
      <div className="board-shell">
        <header className="board-top">
          <div>
            <h1>Board</h1>
            <p className="meta">
              Sync repos, draft a thread, approve to post.
            </p>
          </div>
          <div className="btn-row board-top-actions">
            <Link className="btn" href="/">
              Site
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={ingest}
              disabled={pending}
            >
              Sync GitHub
            </button>
            <button type="button" className="btn" onClick={logout}>
              Log out
            </button>
          </div>
        </header>

        <div className="board-stats">
          <button
            type="button"
            className={`stat-chip ${filter === "queue" ? "active" : ""}`}
            onClick={() => setFilter("queue")}
          >
            Queue <strong>{counts.queue}</strong>
          </button>
          <button
            type="button"
            className={`stat-chip ${filter === "ready" ? "active" : ""}`}
            onClick={() => setFilter("ready")}
          >
            Ready <strong>{counts.ready}</strong>
          </button>
          <button
            type="button"
            className={`stat-chip ${filter === "posted" ? "active" : ""}`}
            onClick={() => setFilter("posted")}
          >
            Posted <strong>{counts.posted}</strong>
          </button>
          <button
            type="button"
            className={`stat-chip ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All <strong>{counts.all}</strong>
          </button>
        </div>

        <div className="board-layout">
          <aside>
            <div className="inbox">
              {visible.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`inbox-card ${selected?.id === f.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedId(f.id);
                    setVoice(f.voice || "dry_bones");
                  }}
                >
                  {f.mediaUrls[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.mediaUrls[0]} alt="" className="inbox-thumb" />
                  )}
                  <span className="inbox-card-body">
                    <span className={`status-pill status-${f.status}`}>
                      {statusLabel(f.status)}
                      {f.isPrivate ? " · private" : ""}
                    </span>
                    <span className="inbox-title">{f.title}</span>
                    <span className="meta">
                      {f.language ? `${f.language} · ` : ""}
                      {f.repoFullName || "local"}
                    </span>
                  </span>
                </button>
              ))}
              {visible.length === 0 && (
                <p className="muted">
                  Nothing here. Hit <strong>Sync GitHub</strong> to load repos.
                </p>
              )}
            </div>
          </aside>

          <section className="board-main">
            {!selected ? (
              <div className="empty-desk">
                <h2>No item selected</h2>
                <p className="muted">
                  Sync GitHub, pick a finding, draft a thread.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={ingest}
                  disabled={pending}
                >
                  Sync GitHub
                </button>
              </div>
            ) : (
              <>
                <div className="desk-hero">
                  {selected.mediaUrls[0] && (
                    <div className="media-frame desk-cover">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selected.mediaUrls[0]} alt="" />
                    </div>
                  )}
                  <div>
                    <span className={`status-pill status-${selected.status}`}>
                      {statusLabel(selected.status)}
                    </span>
                    <h2>{selected.title}</h2>
                    <p>{selected.summary}</p>
                    <p className="meta">
                      <a
                        href={selected.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {selected.repoFullName}
                      </a>
                      {noteSlug && (
                        <>
                          {" · "}
                          <Link href={`/notes/${noteSlug}`}>site note</Link>
                        </>
                      )}
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
                  </div>
                </div>

                {selected.readmeExcerpt && (
                  <details className="source-panel" open>
                    <summary>Source material</summary>
                    <p className="meta">{selected.whyPicked}</p>
                    <p className="source-excerpt">{selected.readmeExcerpt}</p>
                  </details>
                )}

                <div className="composer">
                  <div className="composer-head">
                    <h3>Thread</h3>
                    <div className="voice-row">
                      {VOICES.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          title={v.hint}
                          className={`voice-chip ${voice === v.id ? "active" : ""}`}
                          onClick={() => setVoice(v.id)}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {thread.length === 0 ? (
                    <div className="empty-draft">
                      <p className="muted">
                        No draft yet. Generate a thread from the source
                        material.
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={draft}
                        disabled={pending}
                      >
                        Draft thread
                      </button>
                    </div>
                  ) : (
                    <ol className="tweet-stack">
                      {thread.map((tweet, index) => (
                        <li key={`${selected.id}-tweet-${index}`}>
                          <div className="tweet-toolbar">
                            <span className="meta">
                              {index + 1} / {thread.length}
                            </span>
                            <div className="tweet-tools">
                              <button
                                type="button"
                                className="tool-btn"
                                onClick={() => moveTweet(index, -1)}
                                disabled={index === 0}
                              >
                                Up
                              </button>
                              <button
                                type="button"
                                className="tool-btn"
                                onClick={() => moveTweet(index, 1)}
                                disabled={index === thread.length - 1}
                              >
                                Down
                              </button>
                              <button
                                type="button"
                                className="tool-btn"
                                onClick={() => removeTweet(index)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <textarea
                            className="field"
                            rows={3}
                            value={tweet.text}
                            onChange={(e) =>
                              updateTweet(index, e.target.value)
                            }
                            onBlur={(e) => commitTweet(index, e.target.value)}
                            maxLength={280}
                            placeholder="Tweet text…"
                          />
                          <div
                            className={`char-meter ${charTone(tweet.text.length)}`}
                          >
                            <span
                              style={{
                                width: `${Math.min(100, (tweet.text.length / 280) * 100)}%`,
                              }}
                            />
                            <em>{tweet.text.length}/280</em>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}

                  <div className="composer-footer">
                    <button type="button" className="btn" onClick={addTweet}>
                      Add tweet
                    </button>
                  </div>
                </div>

                <div className="board-actions">
                  <div className="btn-row">
                    <button
                      type="button"
                      className="btn"
                      onClick={draft}
                      disabled={pending}
                    >
                      {thread.length ? "Regenerate" : "Draft thread"}
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
                  {message && <p className="meta board-msg">{message}</p>}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
