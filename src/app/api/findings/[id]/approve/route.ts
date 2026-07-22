import { NextResponse } from "next/server";
import { isBoardAuthenticated } from "@/lib/auth";
import { getFinding, updateFindingStatus, updateThreadTexts } from "@/lib/db";
import { postThread } from "@/lib/twitter";
import type { ThreadTweet } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  if (!(await isBoardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let finding = getFinding(id);
  if (!finding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    thread?: ThreadTweet[];
  };
  if (body.thread) {
    finding = updateThreadTexts(id, body.thread) || finding;
  }

  if (!finding.threadJson.length) {
    return NextResponse.json(
      { error: "Draft a thread before approving" },
      { status: 400 },
    );
  }

  updateFindingStatus(id, "approved");
  const posted = await postThread(finding.threadJson);
  const updated = updateFindingStatus(id, "posted", {
    postedThreadUrl: posted.threadUrl,
    dryRun: posted.dryRun,
  });

  return NextResponse.json({ finding: updated, post: posted });
}
