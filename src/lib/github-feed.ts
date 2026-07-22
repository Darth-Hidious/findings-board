import { getConfig } from "./config";

export type RepoNote = {
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
  bodyHtmlSafe: string;
  imageUrl: string | null;
  topics: string[];
};

type GhRepo = {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  pushed_at: string;
  updated_at: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  private: boolean;
  topics?: string[];
};

const SKIP = new Set([
  "findings-board",
  "rando6969",
  "hero-geometric",
  "marc27-docs",
  "bimo-tech-website",
]);

async function ghFetch(url: string, token?: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "findings-board",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, {
    headers,
    next: { revalidate: 1800 },
  });
}

function stripMd(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\(([^)]+)\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*>+\s?/gm, "")
    .replace(/[*_~|>]/g, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstImage(
  readme: string,
  fullName: string,
  branch: string,
): string | null {
  const md = readme.match(/!\[[^\]]*\]\(([^)]+)\)/);
  const html = readme.match(/<img[^>]+src=["']([^"']+)["']/i);
  const raw = md?.[1] || html?.[1];
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const cleaned = raw.replace(/^\.?\//, "");
  return `https://raw.githubusercontent.com/${fullName}/${branch}/${cleaned}`;
}

function firstHeading(readme: string, fallback: string): string {
  const h = readme.match(/^#{1,2}\s+(.+)$/m);
  if (h?.[1]) return stripMd(h[1]).slice(0, 120);
  const htmlH = readme.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (htmlH?.[1]) return stripMd(htmlH[1]).slice(0, 120);
  return fallback;
}

function excerptFrom(readme: string, description: string): string {
  const plain = stripMd(readme);
  if (plain.length > 80) return plain.slice(0, 280).replace(/\s+\S*$/, "") + "…";
  return description || plain.slice(0, 200);
}

/** Lightweight markdown → safe-ish HTML for note pages (no raw scripts). */
export function markdownToSafeHtml(
  md: string,
  fullName: string,
  branch: string,
): string {
  let text = md.slice(0, 12000);
  // images
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
    const url = /^https?:\/\//i.test(src)
      ? src
      : `https://raw.githubusercontent.com/${fullName}/${branch}/${String(src).replace(/^\.?\//, "")}`;
    if (!/^https:\/\//i.test(url)) return "";
    return `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" />`;
  });
  // links
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, label, href) => {
      const safe = String(href).startsWith("http") ? href : "#";
      return `<a href="${escapeAttr(safe)}" rel="noreferrer" target="_blank">${escapeHtml(label)}</a>`;
    },
  );
  // code fences
  text = text.replace(
    /```[\w-]*\n([\s\S]*?)```/g,
    (_m, code) => `<pre><code>${escapeHtml(code)}</code></pre>`,
  );
  // headings
  text = text.replace(/^### (.+)$/gm, (_m, t) => `<h3>${escapeHtml(stripMd(t))}</h3>`);
  text = text.replace(/^## (.+)$/gm, (_m, t) => `<h2>${escapeHtml(stripMd(t))}</h2>`);
  text = text.replace(/^# (.+)$/gm, (_m, t) => `<h1>${escapeHtml(stripMd(t))}</h1>`);
  // bold/italic
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // paragraphs
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[1-3]|pre|img|ul|ol)/i.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");
  // strip leftover tags that aren't allowlisted
  return blocks.replace(
    /<(?!\/?(?:p|br|strong|em|a|h1|h2|h3|pre|code|img)\b)[^>]+>/gi,
    "",
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

async function fetchReadmeRaw(
  fullName: string,
  token?: string,
): Promise<string> {
  const res = await ghFetch(
    `https://api.github.com/repos/${fullName}/readme`,
    token,
  );
  if (!res.ok) return "";
  const data = (await res.json()) as { content?: string };
  if (!data.content) return "";
  try {
    return Buffer.from(data.content, "base64").toString("utf8");
  } catch {
    return "";
  }
}

export async function getRepoNotes(): Promise<RepoNote[]> {
  const config = getConfig();
  const username = config.githubUsername || "Darth-Hidious";
  const token = config.githubToken;

  const res = await ghFetch(
    `https://api.github.com/users/${username}/repos?sort=pushed&per_page=20&type=owner`,
    token,
  );
  if (!res.ok) return [];

  const repos = ((await res.json()) as GhRepo[]).filter(
    (r) => !r.fork && !r.private && !SKIP.has(r.name),
  );

  const notes: RepoNote[] = [];
  for (const repo of repos.slice(0, 10)) {
    const readme = await fetchReadmeRaw(repo.full_name, token);
    if (!readme && !repo.description) continue;

    const niceTitle = firstHeading(
      readme,
      repo.name.replace(/[-_]/g, " "),
    );
    notes.push({
      slug: repo.name.toLowerCase(),
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description || "",
      language: repo.language,
      pushedAt: repo.pushed_at,
      stars: repo.stargazers_count,
      title: niceTitle,
      excerpt: excerptFrom(readme, repo.description || ""),
      bodyHtmlSafe: markdownToSafeHtml(
        readme || repo.description || "",
        repo.full_name,
        repo.default_branch,
      ),
      imageUrl: firstImage(readme, repo.full_name, repo.default_branch),
      topics: repo.topics || [],
    });
  }

  return notes;
}

export async function getRepoNote(slug: string): Promise<RepoNote | null> {
  const notes = await getRepoNotes();
  return notes.find((n) => n.slug === slug.toLowerCase()) || null;
}
