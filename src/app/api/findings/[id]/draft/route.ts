import { NextResponse } from "next/server";
import { isBoardAuthenticated } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { getFinding, updateFindingThread, updateFindingStatus } from "@/lib/db";
import { draftThread } from "@/lib/grok";
import { postThread } from "@/lib/twitter";
import type { VoiceMode } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  if (!(await isBoardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const finding = getFinding(id);
  if (!finding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    voice?: VoiceMode;
  };
  const voice = body.voice || finding.voice || "dry_bones";
  const drafted = await draftThread(finding, voice);
  const updated = updateFindingThread(id, drafted.tweets, voice, "drafted");

  const config = getConfig();
  let autoPostResult = null;
  if (config.autoPost && updated) {
    const posted = await postThread(updated.threadJson);
    autoPostResult = posted;
    updateFindingStatus(id, "posted", {
      postedThreadUrl: posted.threadUrl,
      dryRun: posted.dryRun,
    });
  }

  return NextResponse.json({
    finding: getFinding(id),
    usedFallback: drafted.usedFallback,
    model: drafted.model,
    autoPost: autoPostResult,
  });
}
