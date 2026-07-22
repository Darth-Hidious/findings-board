import { NextResponse } from "next/server";
import { clearSessionCookieOptions } from "@/lib/auth";
import { isAllowedOrigin } from "@/lib/security";

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }
  const response = NextResponse.json({ ok: true });
  for (const cookie of clearSessionCookieOptions()) {
    response.cookies.set(cookie.name, cookie.value, cookie);
  }
  return response;
}
