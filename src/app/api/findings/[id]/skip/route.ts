import { NextResponse } from "next/server";
import { requireBoardMutation } from "@/lib/board-guard";
import { getFinding, updateFindingStatus } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const denied = await requireBoardMutation(request);
  if (denied) return denied;

  const { id } = await params;
  if (!getFinding(id.slice(0, 80))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const finding = updateFindingStatus(id.slice(0, 80), "skipped");
  return NextResponse.json({ finding });
}
