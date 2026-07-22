import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getConfig } from "./config";

export type ProjectNote = {
  slug: string;
  name: string;
  fullName: string;
  url: string;
  description: string;
  language: string | null;
  pushedAt: string;
  stars: number;
  title: string;
  excerpt: string;
  bodyMarkdown: string;
  imageUrl: string | null;
  topics: string[];
  curated: true;
};

type Frontmatter = {
  title: string;
  repo: string;
  slug?: string;
  excerpt: string;
  image?: string;
  date?: string;
  order?: number;
  language?: string;
};

type GhRepoMeta = {
  html_url: string;
  description: string | null;
  pushed_at: string;
  language: string | null;
  stargazers_count: number;
  topics?: string[];
  name: string;
  full_name: string;
};

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

function listNoteFiles(): string[] {
  if (!fs.existsSync(NOTES_DIR)) return [];
  return fs
    .readdirSync(NOTES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(NOTES_DIR, f));
}

function parseNoteFile(filePath: string): {
  data: Frontmatter;
  content: string;
} {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  return {
    data: parsed.data as Frontmatter,
    content: parsed.content.trim(),
  };
}

async function fetchRepoMeta(
  fullName: string,
  token?: string,
): Promise<GhRepoMeta | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "findings-board",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}`, {
      headers,
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    return (await res.json()) as GhRepoMeta;
  } catch {
    return null;
  }
}

function slugFrom(data: Frontmatter, filePath: string): string {
  if (data.slug) return data.slug.toLowerCase();
  return path.basename(filePath, ".md").toLowerCase();
}

export async function getProjectNotes(): Promise<ProjectNote[]> {
  const config = getConfig();
  const token = config.githubToken;
  const files = listNoteFiles();

  const notes = await Promise.all(
    files.map(async (filePath) => {
      const { data, content } = parseNoteFile(filePath);
      if (!data.title || !data.repo || !data.excerpt) return null;

      const slug = slugFrom(data, filePath);
      const meta = await fetchRepoMeta(data.repo, token);
      const name = meta?.name || data.repo.split("/")[1] || slug;
      const fullName = meta?.full_name || data.repo;

      const note: ProjectNote & { order: number } = {
        slug,
        name,
        fullName,
        url: meta?.html_url || `https://github.com/${data.repo}`,
        description: meta?.description || data.excerpt,
        language: data.language || meta?.language || null,
        pushedAt: data.date
          ? new Date(data.date).toISOString()
          : meta?.pushed_at || new Date().toISOString(),
        stars: meta?.stargazers_count ?? 0,
        title: data.title,
        excerpt: data.excerpt,
        bodyMarkdown: content,
        imageUrl: data.image || null,
        topics: meta?.topics || [],
        curated: true,
        order: data.order ?? 99,
      };
      return note;
    }),
  );

  return notes
    .filter((n): n is ProjectNote & { order: number } => n !== null)
    .sort((a, b) => a.order - b.order || b.pushedAt.localeCompare(a.pushedAt))
    .map(({ order: _order, ...note }) => note);
}

export async function getProjectNote(
  slug: string,
): Promise<ProjectNote | null> {
  const notes = await getProjectNotes();
  return notes.find((n) => n.slug === slug.toLowerCase()) || null;
}

/** Alias used by older imports — curated notes only. */
export async function getRepoNotes(): Promise<ProjectNote[]> {
  return getProjectNotes();
}

export async function getRepoNote(
  slug: string,
): Promise<ProjectNote | null> {
  return getProjectNote(slug);
}
