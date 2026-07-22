import type { Finding } from "@/lib/types";

export function FindingsFeed({
  findings,
  xHandle,
}: {
  findings: Finding[];
  xHandle: string;
}) {
  return (
    <section className="panel section" id="findings">
      <div className="section-head">
        <h2>Findings</h2>
        <p>
          Public notes and threads from the posting board — typed, not hyped.
        </p>
      </div>

      {findings.length === 0 ? (
        <p className="muted">
          Nothing published here yet. Drafts stay on the private board until
          approved.
        </p>
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
                {finding.dryRun ? " · dry-run" : ""}
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
                  {finding.threadJson.slice(0, 4).map((tweet, i) => (
                    <li key={`${finding.id}-${i}`}>{tweet.text}</li>
                  ))}
                </ol>
              )}
              <p className="meta">
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
