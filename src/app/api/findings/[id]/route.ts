import { NextResponse } from "next/server";
import { requireBoardRead } from "@/lib/board-guard";
import { getFinding } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const denied = await requireBoardRead();
  if (denied) return denied;
  const { id } = await params;
  const finding = getFinding(id.slice(0, 80));
  if (!finding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ finding });
}
