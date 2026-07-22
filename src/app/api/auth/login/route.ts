import { NextResponse } from "next/server";
import {
  checkBoardPassword,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    password?: string;
  };
  if (!body.password || !checkBoardPassword(body.password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = createSessionToken();
  const response = NextResponse.json({ ok: true });
  const cookie = sessionCookieOptions(token);
  response.cookies.set(cookie.name, cookie.value, cookie);
  return response;
}
