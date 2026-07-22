import type { Finding } from "@/lib/types";

export function FindingsFeed({
  findings,
  xHandle,
}: {
  findings: Finding[];
  xHandle: string;
}) {
  return (
    <section id="findings">
      <h2>Findings</h2>
      <p className="muted">
        Notes and thread drafts pulled from the same store as the posting
        board. Plain records of what shipped.
      </p>

      {findings.length === 0 ? (
        <p>No findings yet. Use the board to ingest GitHub and draft threads.</p>
      ) : (
        <ul className="findings-list">
          {findings.map((finding) => (
            <li key={finding.id}>
              <h3>
                <a href={finding.repoUrl} target="_blank" rel="noreferrer">
                  {finding.title}
                </a>
              </h3>
              <p className="meta">
                {finding.status}
                {finding.dryRun ? ", dry-run" : ""}
                {finding.repoFullName ? ` · ${finding.repoFullName}` : ""}
              </p>
              <p>{finding.summary}</p>
              {finding.mediaUrls[0] && (
                <div className="media-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={finding.mediaUrls[0]} alt="" />
                </div>
              )}
              {finding.threadJson.length > 0 && (
                <ol className="thread-list">
                  {finding.threadJson.slice(0, 5).map((tweet, i) => (
                    <li key={`${finding.id}-${i}`}>{tweet.text}</li>
                  ))}
                </ol>
              )}
              <p>
                <a href={finding.repoUrl} target="_blank" rel="noreferrer">
                  repository
                </a>
                {finding.postedThreadUrl && (
                  <>
                    {" · "}
                    <a
                      href={finding.postedThreadUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      thread{xHandle ? ` (@${xHandle})` : ""}
                    </a>
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
