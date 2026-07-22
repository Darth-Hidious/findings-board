import { NextResponse } from "next/server";
import { isBoardAuthenticated } from "@/lib/auth";
import { getFinding, updateFindingStatus } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  if (!(await isBoardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!getFinding(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const finding = updateFindingStatus(id, "skipped");
  return NextResponse.json({ finding });
}
