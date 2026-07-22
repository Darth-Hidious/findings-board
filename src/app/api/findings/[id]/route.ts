import { NextResponse } from "next/server";
import { isBoardAuthenticated } from "@/lib/auth";
import { getFinding } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  if (!(await isBoardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const finding = getFinding(id);
  if (!finding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ finding });
}
