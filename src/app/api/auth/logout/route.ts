import { NextResponse } from "next/server";
import { clearSessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const cookie = clearSessionCookieOptions();
  response.cookies.set(cookie.name, cookie.value, cookie);
  return response;
}
