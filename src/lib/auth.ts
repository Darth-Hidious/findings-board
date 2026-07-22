import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getConfig } from "./config";

const COOKIE_NAME = "findings_board_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionToken(): string {
  const { sessionSecret } = getConfig();
  const payload = `board:${Date.now()}`;
  return `${payload}.${sign(payload, sessionSecret)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const { sessionSecret } = getConfig();
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!payload || !signature) return false;
  const expected = sign(payload, sessionSecret);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isBoardAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE_NAME)?.value);
}

export function sessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export function checkBoardPassword(password: string): boolean {
  const { boardPassword } = getConfig();
  const a = Buffer.from(password);
  const b = Buffer.from(boardPassword);
  if (a.length !== b.length) {
    // still do a compare-shaped op to avoid easy timing leaks on length alone
    timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32));
    return false;
  }
  return timingSafeEqual(a, b);
}
