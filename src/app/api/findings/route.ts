import { NextResponse } from "next/server";
import { requireBoardMutation, requireBoardRead } from "@/lib/board-guard";
import { listFindings, updateThreadTexts } from "@/lib/db";
import type { FindingStatus, ThreadTweet } from "@/lib/types";

function sanitizeThread(thread: ThreadTweet[]): ThreadTweet[] | null {
  if (!Array.isArray(thread) || thread.length > 8) return null;
  return thread.map((t) => ({
    text: String(t.text || "").slice(0, 280),
    altText: t.altText ? String(t.altText).slice(0, 400) : undefined,
    mediaUrls: Array.isArray(t.mediaUrls)
      ? t.mediaUrls
          .filter((u) => typeof u === "string" && /^https:\/\//i.test(u))
          .slice(0, 4)
      : undefined,
  }));
}

export async function GET(request: Request) {
  const denied = await requireBoardRead();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as FindingStatus | null;
  const findings = listFindings(status || undefined);
  return NextResponse.json({ findings });
}

export async function PATCH(request: Request) {
  const denied = await requireBoardMutation(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    thread?: ThreadTweet[];
  } | null;
  if (!body?.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "id and thread required" }, { status: 400 });
  }
  const thread = sanitizeThread(body.thread || []);
  if (!thread) {
    return NextResponse.json({ error: "Invalid thread" }, { status: 400 });
  }
  const finding = updateThreadTexts(body.id.slice(0, 80), thread);
  if (!finding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ finding });
}
