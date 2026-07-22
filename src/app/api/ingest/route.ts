import { NextResponse } from "next/server";
import { requireBoardMutation } from "@/lib/board-guard";
import { ingestFromGitHub } from "@/lib/github";

export async function POST(request: Request) {
  const denied = await requireBoardMutation(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as {
    username?: string;
  };
  const username =
    typeof body.username === "string" ? body.username.slice(0, 80) : undefined;

  try {
    const result = await ingestFromGitHub(username);
    // Do not echo raw GitHub API bodies or token-related details
    return NextResponse.json({
      username: result.username,
      scanned: result.scanned,
      upserted: result.upserted,
      privateIncluded: result.privateIncluded,
      warning: result.warning
        ? result.warning.replace(/gh[pousr]_[A-Za-z0-9_]+/g, "[redacted]")
        : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Ingest failed" },
      { status: 500 },
    );
  }
}
