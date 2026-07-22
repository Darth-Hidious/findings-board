import { NextResponse } from "next/server";
import {
  checkBoardPassword,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";
import {
  assertProductionSecrets,
  checkLoginRateLimit,
  clearLoginFailures,
  clientIp,
  isAllowedOrigin,
  recordLoginFailure,
  requireJsonContentType,
} from "@/lib/security";

export async function POST(request: Request) {
  const configError = assertProductionSecrets();
  if (configError) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }

  if (!requireJsonContentType(request)) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 415 },
    );
  }

  const ip = clientIp(request);
  const limit = checkLoginRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec || 900) },
      },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    password?: string;
  };
  const password = typeof body.password === "string" ? body.password : "";

  // Constant-ish delay floor to slow brute force a bit
  const started = Date.now();
  const ok = checkBoardPassword(password);
  const elapsed = Date.now() - started;
  if (elapsed < 200) {
    await new Promise((r) => setTimeout(r, 200 - elapsed));
  }

  if (!ok) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  clearLoginFailures(ip);
  const token = createSessionToken();
  const response = NextResponse.json({ ok: true });
  const cookie = sessionCookieOptions(token);
  response.cookies.set(cookie.name, cookie.value, cookie);
  return response;
}
