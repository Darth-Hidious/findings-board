import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getProjectNote } from "@/lib/notes";
import { SiteHeader } from "@/components/portfolio/SiteHeader";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const note = await getProjectNote(slug);
  if (!note) return { title: "Note" };
  return {
    title: `${note.title} — Siddhartha Yash Kovid`,
    description: note.excerpt,
  };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const note = await getProjectNote(slug);
  if (!note) notFound();

  return (
    <>
      <SiteHeader />
      <main className="shell">
        <article className="panel note-article">
          <p className="meta">
            <Link href="/#notes">← Notes</Link>
            {" · "}
            <a href={note.url} target="_blank" rel="noreferrer">
              {note.fullName}
            </a>
          </p>
          <h1>{note.title}</h1>
          <p className="lede">{note.excerpt}</p>
          {note.imageUrl && (
            <div className="media-frame note-hero-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={note.imageUrl} alt="" />
            </div>
          )}
          <div className="note-content">
            <ReactMarkdown
              components={{
                img: ({ src, alt }) => {
                  if (!src) return null;
                  // Skip duplicate of hero image at top of body
                  if (src === note.imageUrl) return null;
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={alt || ""} />
                  );
                },
                a: ({ href, children }) => {
                  const external = href?.startsWith("http");
                  if (!href) return <span>{children}</span>;
                  if (external) {
                    return (
                      <a href={href} target="_blank" rel="noreferrer">
                        {children}
                      </a>
                    );
                  }
                  return <Link href={href}>{children}</Link>;
                },
                table: () => null,
                thead: () => null,
                tbody: () => null,
                tr: () => null,
                th: () => null,
                td: () => null,
              }}
            >
              {note.bodyMarkdown}
            </ReactMarkdown>
          </div>
          <p className="meta" style={{ marginTop: "2rem" }}>
            Repository:{" "}
            <a href={note.url} target="_blank" rel="noreferrer">
              {note.url}
            </a>
          </p>
        </article>
      </main>
    </>
  );
}
