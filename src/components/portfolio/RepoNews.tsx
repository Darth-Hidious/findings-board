import type { ProjectNote } from "@/lib/notes";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function RepoNews({ notes }: { notes: ProjectNote[] }) {
  if (notes.length === 0) return null;

  return (
    <section className="panel section" id="notes">
      <div className="section-head">
        <h2>Project notes</h2>
        <p>
          Hand-written writeups for the main public repos — figures, claims, and
          how to read each tree without drowning in README tables.
        </p>
      </div>

      <ul className="news-list">
        {notes.map((note) => (
          <li key={note.slug} className="news-item">
            {note.imageUrl && (
              <a href={`/notes/${note.slug}`} className="news-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={note.imageUrl} alt="" />
              </a>
            )}
            <div className="news-body">
              <p className="meta">
                {formatDate(note.pushedAt)}
                {note.language ? ` · ${note.language}` : ""}
                {note.stars > 0 ? ` · ★ ${note.stars}` : ""}
              </p>
              <h3>
                <a href={`/notes/${note.slug}`}>{note.title}</a>
              </h3>
              <p className="muted">{note.excerpt}</p>
              <p className="meta">
                <a href={`/notes/${note.slug}`}>Read note</a>
                {" · "}
                <a href={note.url} target="_blank" rel="noreferrer">
                  {note.fullName}
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
