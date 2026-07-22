import { NextResponse } from "next/server";
import { requireBoardMutation } from "@/lib/board-guard";
import { getFinding, updateFindingStatus, updateThreadTexts } from "@/lib/db";
import { postThread } from "@/lib/twitter";
import type { ThreadTweet } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

function sanitizeThread(thread: ThreadTweet[]): ThreadTweet[] | null {
  if (!Array.isArray(thread) || thread.length === 0 || thread.length > 8) {
    return null;
  }
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

export async function POST(request: Request, { params }: Params) {
  const denied = await requireBoardMutation(request);
  if (denied) return denied;

  const { id } = await params;
  let finding = getFinding(id.slice(0, 80));
  if (!finding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    thread?: ThreadTweet[];
  };
  if (body.thread) {
    const thread = sanitizeThread(body.thread);
    if (!thread) {
      return NextResponse.json({ error: "Invalid thread" }, { status: 400 });
    }
    finding = updateThreadTexts(finding.id, thread) || finding;
  }

  if (!finding.threadJson.length) {
    return NextResponse.json(
      { error: "Draft a thread before approving" },
      { status: 400 },
    );
  }

  try {
    updateFindingStatus(finding.id, "approved");
    const posted = await postThread(finding.threadJson);
    const updated = updateFindingStatus(finding.id, "posted", {
      postedThreadUrl: posted.threadUrl,
      dryRun: posted.dryRun,
    });
    return NextResponse.json({
      finding: updated,
      post: {
        dryRun: posted.dryRun,
        threadUrl: posted.threadUrl,
        message: posted.message,
      },
    });
  } catch {
    return NextResponse.json({ error: "Post failed" }, { status: 500 });
  }
}
