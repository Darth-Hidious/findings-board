import { NextResponse } from "next/server";
import { isBoardAuthenticated } from "@/lib/auth";
import { ingestFromGitHub } from "@/lib/github";

export async function POST(request: Request) {
  if (!(await isBoardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    username?: string;
  };
  const result = await ingestFromGitHub(body.username);
  return NextResponse.json(result);
}
