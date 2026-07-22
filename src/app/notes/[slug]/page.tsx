import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepoNote } from "@/lib/github-feed";
import { SiteHeader } from "@/components/portfolio/SiteHeader";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const note = await getRepoNote(slug);
  if (!note) return { title: "Note" };
  return {
    title: `${note.title} — Siddhartha Yash Kovid`,
    description: note.excerpt,
  };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const note = await getRepoNote(slug);
  if (!note) notFound();

  return (
    <>
      <SiteHeader />
      <main className="shell">
        <article className="panel note-article">
          <p className="meta">
            <Link href="/#notes">← From the repos</Link>
            {" · "}
            <a href={note.url} target="_blank" rel="noreferrer">
              {note.fullName}
            </a>
          </p>
          <h1>{note.title}</h1>
          {note.description && <p className="lede">{note.description}</p>}
          {note.imageUrl && (
            <div className="media-frame note-hero-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={note.imageUrl} alt="" />
            </div>
          )}
          <div
            className="note-content"
            dangerouslySetInnerHTML={{ __html: note.bodyHtmlSafe }}
          />
          <p className="meta" style={{ marginTop: "2rem" }}>
            Source:{" "}
            <a href={note.url} target="_blank" rel="noreferrer">
              {note.url}
            </a>
          </p>
        </article>
      </main>
    </>
  );
}
