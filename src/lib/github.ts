import { getConfig } from "./config";
import { upsertFinding, type UpsertFindingInput } from "./db";

type GhRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  private: boolean;
};

type GhContent = {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
  html_url: string;
};

const MEDIA_EXT = /\.(png|jpe?g|gif|webp|mp4|webm|mov)$/i;
const MEDIA_DIRS = ["media", "assets", "demos", "demo", "screenshots", "images"];

async function ghFetch(url: string, token?: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "findings-board",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { headers, next: { revalidate: 0 } });
}

async function fetchReadme(
  fullName: string,
  token?: string,
): Promise<string> {
  const res = await ghFetch(
    `https://api.github.com/repos/${fullName}/readme`,
    token,
  );
  if (!res.ok) return "";
  const data = (await res.json()) as { content?: string; encoding?: string };
  if (!data.content) return "";
  try {
    const raw = Buffer.from(data.content, "base64").toString("utf8");
    return raw.slice(0, 1800);
  } catch {
    return "";
  }
}

async function listDir(
  fullName: string,
  dirPath: string,
  token?: string,
): Promise<GhContent[]> {
  const res = await ghFetch(
    `https://api.github.com/repos/${fullName}/contents/${dirPath}`,
    token,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? (data as GhContent[]) : [];
}

async function collectMedia(
  fullName: string,
  defaultBranch: string,
  token?: string,
): Promise<string[]> {
  const urls: string[] = [];
  for (const dir of MEDIA_DIRS) {
    const entries = await listDir(fullName, dir, token);
    for (const entry of entries) {
      if (entry.type === "file" && MEDIA_EXT.test(entry.name)) {
        const raw =
          entry.download_url ||
          `https://raw.githubusercontent.com/${fullName}/${defaultBranch}/${entry.path}`;
        urls.push(raw);
      }
    }
  }

  const root = await listDir(fullName, "", token);
  for (const entry of root) {
    if (
      entry.type === "file" &&
      /^demo\./i.test(entry.name) &&
      MEDIA_EXT.test(entry.name)
    ) {
      const raw =
        entry.download_url ||
        `https://raw.githubusercontent.com/${fullName}/${defaultBranch}/${entry.path}`;
      urls.push(raw);
    }
  }

  return [...new Set(urls)].slice(0, 6);
}

async function fetchFindingsMarker(
  fullName: string,
  token?: string,
): Promise<Array<{ title?: string; summary?: string; media?: string[] }> | null> {
  const res = await ghFetch(
    `https://api.github.com/repos/${fullName}/contents/findings.json`,
    token,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { content?: string };
  if (!data.content) return null;
  try {
    const raw = Buffer.from(data.content, "base64").toString("utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed as Array<{
        title?: string;
        summary?: string;
        media?: string[];
      }>;
    }
    if (parsed && typeof parsed === "object" && "findings" in parsed) {
      const findings = (parsed as { findings: unknown }).findings;
      return Array.isArray(findings)
        ? (findings as Array<{
            title?: string;
            summary?: string;
            media?: string[];
          }>)
        : null;
    }
  } catch {
    return null;
  }
  return null;
}

function excerptFromReadme(readme: string): string {
  return readme
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/[#>*_`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);
}

export type IngestResult = {
  username: string;
  scanned: number;
  upserted: number;
  privateIncluded: boolean;
  findings: UpsertFindingInput[];
  warning?: string;
};

async function fetchRepos(
  username: string,
  token?: string,
): Promise<{ repos: GhRepo[]; warning?: string; privateIncluded: boolean }> {
  // With a token, list authenticated user's repos (includes private).
  // Without, list public repos for the username.
  if (token) {
    const res = await ghFetch(
      "https://api.github.com/user/repos?sort=pushed&per_page=30&affiliation=owner",
      token,
    );
    if (!res.ok) {
      const body = await res.text();
      return {
        repos: [],
        privateIncluded: false,
        warning: `GitHub API ${res.status}: ${body.slice(0, 200)}`,
      };
    }
    const repos = ((await res.json()) as GhRepo[]).filter((r) => !r.fork);
    return { repos, privateIncluded: repos.some((r) => r.private) };
  }

  const res = await ghFetch(
    `https://api.github.com/users/${username}/repos?sort=pushed&per_page=12&type=owner`,
  );
  if (!res.ok) {
    const body = await res.text();
    return {
      repos: [],
      privateIncluded: false,
      warning: `GitHub API ${res.status}: ${body.slice(0, 200)}`,
    };
  }
  const repos = ((await res.json()) as GhRepo[]).filter((r) => !r.fork);
  return { repos, privateIncluded: false };
}

export async function ingestFromGitHub(
  usernameOverride?: string,
): Promise<IngestResult> {
  const config = getConfig();
  const username = (usernameOverride || config.githubUsername || "").trim();
  if (!username) {
    return {
      username: "",
      scanned: 0,
      upserted: 0,
      privateIncluded: false,
      findings: [],
      warning:
        "Set GITHUB_USERNAME in .env to ingest repos. Demo finding remains available.",
    };
  }

  const token = config.githubToken;
  const { repos, warning, privateIncluded } = await fetchRepos(username, token);
  if (warning) {
    return {
      username,
      scanned: 0,
      upserted: 0,
      privateIncluded: false,
      findings: [],
      warning,
    };
  }

  const collected: UpsertFindingInput[] = [];

  for (const repo of repos.slice(0, 12)) {
    const readme = await fetchReadme(repo.full_name, token);
    const media = await collectMedia(repo.full_name, repo.default_branch, token);
    const markers = await fetchFindingsMarker(repo.full_name, token);
    const excerpt = excerptFromReadme(readme);
    const privacyNote = repo.private ? " (private)" : "";

    if (markers && markers.length > 0) {
      markers.forEach((marker, index) => {
        collected.push({
          sourceKey: `gh:${repo.full_name}:finding:${index}`,
          title: marker.title || `${repo.name} finding`,
          summary:
            marker.summary ||
            repo.description ||
            excerpt ||
            "Marked finding from findings.json",
          repoFullName: repo.full_name,
          repoUrl: repo.html_url,
          readmeExcerpt: excerpt,
          mediaUrls: marker.media?.length ? marker.media : media,
          whyPicked: `Explicitly marked in findings.json${privacyNote}`,
        });
      });
      continue;
    }

    const interesting =
      media.length > 0 ||
      Boolean(repo.description) ||
      excerpt.length > 40 ||
      repo.stargazers_count > 0 ||
      repo.private;

    if (!interesting) continue;

    collected.push({
      sourceKey: `gh:${repo.full_name}:repo`,
      title: repo.name,
      summary:
        repo.description ||
        excerpt ||
        `${repo.language || "Project"} updated ${repo.pushed_at.slice(0, 10)}`,
      repoFullName: repo.full_name,
      repoUrl: repo.html_url,
      readmeExcerpt: excerpt,
      mediaUrls: media,
      whyPicked:
        media.length > 0
          ? `Found ${media.length} media file(s)${privacyNote}`
          : `Recent repo with readable README/description${privacyNote}`,
    });
  }

  let upserted = 0;
  for (const item of collected) {
    upsertFinding(item);
    upserted += 1;
  }

  return {
    username,
    scanned: repos.length,
    upserted,
    privateIncluded,
    findings: collected,
    warning: token
      ? undefined
      : "No GITHUB_TOKEN — public repos only. Add a token to include private repos.",
  };
}
