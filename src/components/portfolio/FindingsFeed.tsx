import type { Finding } from "@/lib/types";

export function FindingsFeed({
  findings,
  xHandle,
}: {
  findings: Finding[];
  xHandle: string;
}) {
  return (
    <section id="findings" className="mx-auto w-full max-w-6xl px-6 py-24 md:px-10">
      <div className="mb-12 max-w-2xl">
        <p className="mono mb-3 text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
          Findings
        </p>
        <h2 className="display text-4xl md:text-5xl">Typed, not hyped.</h2>
        <p className="mt-4 text-[var(--muted)]">
          Same store that feeds the posting board. When a thread ships to X, it
          lands here too.
        </p>
      </div>

      {findings.length === 0 ? (
        <p className="text-[var(--muted)]">
          No findings yet. Ingest GitHub from the board once{" "}
          <span className="mono">GITHUB_USERNAME</span> is set.
        </p>
      ) : (
        <ul className="space-y-16">
          {findings.map((finding, index) => (
            <li
              key={finding.id}
              className="rise grid gap-8 border-t border-[var(--line)] pt-10 md:grid-cols-[1.1fr_0.9fr]"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div>
                <p className="mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  {finding.status}
                  {finding.dryRun ? " · dry-run" : ""}
                </p>
                <h3 className="display mt-3 text-3xl md:text-4xl">{finding.title}</h3>
                <p className="mt-4 max-w-xl text-[var(--muted)]">{finding.summary}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    className="btn btn-ghost"
                    href={finding.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Repo
                  </a>
                  {finding.postedThreadUrl && (
                    <a
                      className="btn btn-ghost"
                      href={finding.postedThreadUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Thread{xHandle ? ` @${xHandle}` : ""}
                    </a>
                  )}
                </div>
                {finding.threadJson.length > 0 && (
                  <ol className="mt-8 space-y-3">
                    {finding.threadJson.slice(0, 4).map((tweet, i) => (
                      <li
                        key={`${finding.id}-${i}`}
                        className="bubble border-l border-[var(--accent-dim)] pl-4 text-sm text-[var(--ink)]"
                        style={{ animationDelay: `${i * 70}ms` }}
                      >
                        {tweet.text}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              <div className="relative min-h-56 overflow-hidden bg-[var(--bg-elevated)]">
                {finding.mediaUrls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={finding.mediaUrls[0]}
                    alt={finding.title}
                    className="h-full w-full object-cover opacity-90 transition duration-700 hover:scale-[1.02] hover:opacity-100"
                  />
                ) : (
                  <div className="flex h-full min-h-56 items-end p-6">
                    <p className="mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                      {finding.repoFullName || "local finding"}
                    </p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
