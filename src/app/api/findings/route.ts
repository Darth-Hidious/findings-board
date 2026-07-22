import { NextResponse } from "next/server";
import { isBoardAuthenticated } from "@/lib/auth";
import { listFindings, updateThreadTexts } from "@/lib/db";
import type { FindingStatus, ThreadTweet } from "@/lib/types";

export async function GET(request: Request) {
  if (!(await isBoardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as FindingStatus | null;
  const findings = listFindings(status || undefined);
  return NextResponse.json({ findings });
}

export async function PATCH(request: Request) {
  if (!(await isBoardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    id?: string;
    thread?: ThreadTweet[];
  };
  if (!body.id || !Array.isArray(body.thread)) {
    return NextResponse.json({ error: "id and thread required" }, { status: 400 });
  }
  const finding = updateThreadTexts(body.id, body.thread);
  if (!finding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ finding });
}
