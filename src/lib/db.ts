import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  Finding,
  FindingStatus,
  ThreadTweet,
  VoiceMode,
} from "./types";

export type UpsertFindingInput = {
  sourceKey: string;
  title: string;
  summary: string;
  repoFullName: string;
  repoUrl: string;
  readmeExcerpt: string;
  mediaUrls: string[];
  whyPicked: string;
  isPrivate?: boolean;
  language?: string | null;
};

type StoreFile = {
  findings: Finding[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function storePath(): string {
  if (process.env.VERCEL) {
    return path.join("/tmp", "findings-board.json");
  }
  return path.join(process.cwd(), "data", "findings.json");
}

function emptyStore(): StoreFile {
  return { findings: [] };
}

function readStore(): StoreFile {
  const file = storePath();
  try {
    if (!fs.existsSync(file)) {
      const empty = emptyStore();
      writeStore(empty);
      return empty;
    }
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    if (!Array.isArray(parsed.findings)) return emptyStore();
    const before = parsed.findings.length;
    const cleaned = parsed.findings
      .filter((f) => !String(f.sourceKey || "").startsWith("demo:"))
      .map((f) => ({
        ...f,
        isPrivate: Boolean(f.isPrivate),
        language: f.language ?? null,
        mediaUrls: Array.isArray(f.mediaUrls) ? f.mediaUrls : [],
        threadJson: Array.isArray(f.threadJson) ? f.threadJson : [],
      }));
    const next = { findings: cleaned };
    if (cleaned.length !== before) writeStore(next);
    return next;
  } catch {
    return emptyStore();
  }
}

function writeStore(store: StoreFile) {
  const file = storePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(store, null, 2));
}

function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1,
  );
}

export function upsertFinding(input: UpsertFindingInput): Finding {
  const store = readStore();
  const existing = store.findings.find((f) => f.sourceKey === input.sourceKey);
  const ts = nowIso();
  if (existing) {
    existing.title = input.title;
    existing.summary = input.summary;
    existing.repoFullName = input.repoFullName;
    existing.repoUrl = input.repoUrl;
    existing.readmeExcerpt = input.readmeExcerpt;
    existing.mediaUrls = input.mediaUrls;
    existing.whyPicked = input.whyPicked;
    existing.isPrivate = Boolean(input.isPrivate);
    existing.language = input.language ?? existing.language ?? null;
    existing.updatedAt = ts;
    writeStore(store);
    return existing;
  }

  const created: Finding = {
    id: randomUUID(),
    sourceKey: input.sourceKey,
    title: input.title,
    summary: input.summary,
    repoFullName: input.repoFullName,
    repoUrl: input.repoUrl,
    readmeExcerpt: input.readmeExcerpt,
    mediaUrls: input.mediaUrls,
    whyPicked: input.whyPicked,
    status: "new",
    voice: "dry_bones",
    threadJson: [],
    postedThreadUrl: null,
    dryRun: false,
    isPrivate: Boolean(input.isPrivate),
    language: input.language ?? null,
    createdAt: ts,
    updatedAt: ts,
  };
  store.findings.push(created);
  writeStore(store);
  return created;
}

export function listFindings(status?: FindingStatus): Finding[] {
  const store = readStore();
  const all = sortFindings(store.findings);
  return status ? all.filter((f) => f.status === status) : all;
}

export function listPublicFindings(): Finding[] {
  return sortFindings(
    readStore().findings.filter(
      (f) =>
        !f.isPrivate &&
        !String(f.sourceKey || "").startsWith("demo:") &&
        f.status === "posted" &&
        !f.dryRun,
    ),
  ).slice(0, 24);
}

export function getFinding(id: string): Finding | null {
  return readStore().findings.find((f) => f.id === id) || null;
}

export function getFindingBySourceKey(sourceKey: string): Finding | null {
  return readStore().findings.find((f) => f.sourceKey === sourceKey) || null;
}

export function updateFindingThread(
  id: string,
  thread: ThreadTweet[],
  voice: VoiceMode,
  status: FindingStatus = "drafted",
): Finding | null {
  const store = readStore();
  const finding = store.findings.find((f) => f.id === id);
  if (!finding) return null;
  finding.threadJson = thread;
  finding.voice = voice;
  finding.status = status;
  finding.updatedAt = nowIso();
  writeStore(store);
  return finding;
}

export function updateFindingStatus(
  id: string,
  status: FindingStatus,
  extras?: { postedThreadUrl?: string | null; dryRun?: boolean },
): Finding | null {
  const store = readStore();
  const finding = store.findings.find((f) => f.id === id);
  if (!finding) return null;
  finding.status = status;
  if (extras?.postedThreadUrl !== undefined) {
    finding.postedThreadUrl = extras.postedThreadUrl;
  }
  if (extras?.dryRun !== undefined) {
    finding.dryRun = extras.dryRun;
  }
  finding.updatedAt = nowIso();
  writeStore(store);
  return finding;
}

export function updateThreadTexts(
  id: string,
  thread: ThreadTweet[],
): Finding | null {
  const store = readStore();
  const finding = store.findings.find((f) => f.id === id);
  if (!finding) return null;
  finding.threadJson = thread;
  finding.updatedAt = nowIso();
  writeStore(store);
  return finding;
}
