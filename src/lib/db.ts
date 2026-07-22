import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  Finding,
  FindingRow,
  FindingStatus,
  ThreadTweet,
  VoiceMode,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "findings.db");

let dbInstance: Database.Database | null = null;

function getDb(): Database.Database {
  if (dbInstance) return dbInstance;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  dbInstance = new Database(DB_PATH);
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS findings (
      id TEXT PRIMARY KEY,
      source_key TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      repo_full_name TEXT NOT NULL DEFAULT '',
      repo_url TEXT NOT NULL DEFAULT '',
      readme_excerpt TEXT NOT NULL DEFAULT '',
      media_urls TEXT NOT NULL DEFAULT '[]',
      why_picked TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      voice TEXT NOT NULL DEFAULT 'dry_bones',
      thread_json TEXT NOT NULL DEFAULT '[]',
      posted_thread_url TEXT,
      dry_run INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
    CREATE INDEX IF NOT EXISTS idx_findings_updated ON findings(updated_at DESC);
  `);
  seedDemoIfEmpty(dbInstance);
  return dbInstance;
}

function nowIso(): string {
  return new Date().toISOString();
}

function rowToFinding(row: FindingRow): Finding {
  return {
    id: row.id,
    sourceKey: row.source_key,
    title: row.title,
    summary: row.summary,
    repoFullName: row.repo_full_name,
    repoUrl: row.repo_url,
    readmeExcerpt: row.readme_excerpt,
    mediaUrls: JSON.parse(row.media_urls || "[]") as string[],
    whyPicked: row.why_picked,
    status: row.status,
    voice: row.voice,
    threadJson: JSON.parse(row.thread_json || "[]") as ThreadTweet[],
    postedThreadUrl: row.posted_thread_url,
    dryRun: Boolean(row.dry_run),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function seedDemoIfEmpty(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) as c FROM findings").get() as {
    c: number;
  };
  if (count.c > 0) return;

  const ts = nowIso();
  const demoThread: ThreadTweet[] = [
    {
      text: "Built a tiny ingest that turns GitHub media into thread drafts. No launch. Just the pipeline.",
    },
    {
      text: "It pulls README scraps + demo clips, then waits for a human to approve. Autoflow with a brake pedal.",
    },
    {
      text: "The jokes are supposed to have a second floor. If you only notice the first one, you're reading too fast.",
    },
    {
      text: "Repo coming once the board stops lying about dry-run. /board",
    },
  ];

  db.prepare(
    `INSERT INTO findings (
      id, source_key, title, summary, repo_full_name, repo_url, readme_excerpt,
      media_urls, why_picked, status, voice, thread_json, posted_thread_url,
      dry_run, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    randomUUID(),
    "demo:findings-board",
    "Findings Board bootstrap",
    "Local demo finding so the board works before GitHub keys are wired.",
    "local/findings-board",
    "https://github.com",
    "Portfolio + private posting desk. Draft dry threads with bones. Approve to post.",
    JSON.stringify([]),
    "Seeded so you can see the desk before ingest runs.",
    "drafted",
    "dry_bones",
    JSON.stringify(demoThread),
    null,
    0,
    ts,
    ts,
  );
}

export type UpsertFindingInput = {
  sourceKey: string;
  title: string;
  summary: string;
  repoFullName: string;
  repoUrl: string;
  readmeExcerpt: string;
  mediaUrls: string[];
  whyPicked: string;
};

export function upsertFinding(input: UpsertFindingInput): Finding {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM findings WHERE source_key = ?")
    .get(input.sourceKey) as FindingRow | undefined;

  const ts = nowIso();
  if (existing) {
    db.prepare(
      `UPDATE findings SET
        title = ?, summary = ?, repo_full_name = ?, repo_url = ?,
        readme_excerpt = ?, media_urls = ?, why_picked = ?, updated_at = ?
      WHERE source_key = ?`,
    ).run(
      input.title,
      input.summary,
      input.repoFullName,
      input.repoUrl,
      input.readmeExcerpt,
      JSON.stringify(input.mediaUrls),
      input.whyPicked,
      ts,
      input.sourceKey,
    );
    return getFindingBySourceKey(input.sourceKey)!;
  }

  const id = randomUUID();
  db.prepare(
    `INSERT INTO findings (
      id, source_key, title, summary, repo_full_name, repo_url, readme_excerpt,
      media_urls, why_picked, status, voice, thread_json, posted_thread_url,
      dry_run, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'dry_bones', '[]', NULL, 0, ?, ?)`,
  ).run(
    id,
    input.sourceKey,
    input.title,
    input.summary,
    input.repoFullName,
    input.repoUrl,
    input.readmeExcerpt,
    JSON.stringify(input.mediaUrls),
    input.whyPicked,
    ts,
    ts,
  );
  return getFinding(id)!;
}

export function listFindings(status?: FindingStatus): Finding[] {
  const db = getDb();
  const rows = status
    ? (db
        .prepare(
          "SELECT * FROM findings WHERE status = ? ORDER BY updated_at DESC",
        )
        .all(status) as FindingRow[])
    : (db
        .prepare("SELECT * FROM findings ORDER BY updated_at DESC")
        .all() as FindingRow[]);
  return rows.map(rowToFinding);
}

export function listPublicFindings(): Finding[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM findings
       WHERE status IN ('posted', 'approved', 'drafted')
       ORDER BY updated_at DESC
       LIMIT 24`,
    )
    .all() as FindingRow[];
  return rows.map(rowToFinding);
}

export function getFinding(id: string): Finding | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM findings WHERE id = ?").get(id) as
    | FindingRow
    | undefined;
  return row ? rowToFinding(row) : null;
}

export function getFindingBySourceKey(sourceKey: string): Finding | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM findings WHERE source_key = ?")
    .get(sourceKey) as FindingRow | undefined;
  return row ? rowToFinding(row) : null;
}

export function updateFindingThread(
  id: string,
  thread: ThreadTweet[],
  voice: VoiceMode,
  status: FindingStatus = "drafted",
): Finding | null {
  const db = getDb();
  db.prepare(
    `UPDATE findings SET thread_json = ?, voice = ?, status = ?, updated_at = ? WHERE id = ?`,
  ).run(JSON.stringify(thread), voice, status, nowIso(), id);
  return getFinding(id);
}

export function updateFindingStatus(
  id: string,
  status: FindingStatus,
  extras?: { postedThreadUrl?: string | null; dryRun?: boolean },
): Finding | null {
  const db = getDb();
  const current = getFinding(id);
  if (!current) return null;
  db.prepare(
    `UPDATE findings SET
      status = ?,
      posted_thread_url = COALESCE(?, posted_thread_url),
      dry_run = COALESCE(?, dry_run),
      updated_at = ?
    WHERE id = ?`,
  ).run(
    status,
    extras?.postedThreadUrl ?? null,
    extras?.dryRun === undefined ? null : extras.dryRun ? 1 : 0,
    nowIso(),
    id,
  );
  return getFinding(id);
}

export function updateThreadTexts(
  id: string,
  thread: ThreadTweet[],
): Finding | null {
  const db = getDb();
  db.prepare(
    `UPDATE findings SET thread_json = ?, updated_at = ? WHERE id = ?`,
  ).run(JSON.stringify(thread), nowIso(), id);
  return getFinding(id);
}
