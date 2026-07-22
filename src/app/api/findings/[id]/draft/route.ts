import { NextResponse } from "next/server";
import { requireBoardMutation } from "@/lib/board-guard";
import { getConfig } from "@/lib/config";
import { getFinding, updateFindingThread, updateFindingStatus } from "@/lib/db";
import { draftThread } from "@/lib/grok";
import { postThread } from "@/lib/twitter";
import type { VoiceMode } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

const VOICES = new Set<VoiceMode>(["dry", "dry_bones", "bones_forward"]);

export async function POST(request: Request, { params }: Params) {
  const denied = await requireBoardMutation(request);
  if (denied) return denied;

  const { id } = await params;
  const finding = getFinding(id.slice(0, 80));
  if (!finding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    voice?: VoiceMode;
  };
  const voice =
    body.voice && VOICES.has(body.voice) ? body.voice : finding.voice || "dry_bones";

  try {
    const drafted = await draftThread(finding, voice);
    updateFindingThread(finding.id, drafted.tweets, voice, "drafted");

    const config = getConfig();
    let autoPost = null;
    if (config.autoPost) {
      const posted = await postThread(drafted.tweets);
      autoPost = {
        dryRun: posted.dryRun,
        message: posted.message,
        threadUrl: posted.threadUrl,
      };
      updateFindingStatus(finding.id, "posted", {
        postedThreadUrl: posted.threadUrl,
        dryRun: posted.dryRun,
      });
    }

    return NextResponse.json({
      finding: getFinding(finding.id),
      usedFallback: drafted.usedFallback,
      model: drafted.usedFallback ? undefined : drafted.model,
      autoPost,
    });
  } catch {
    return NextResponse.json({ error: "Draft failed" }, { status: 500 });
  }
}
