import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getConfig } from "./config";
import { constantTimeEqualString } from "./security";

export const SESSION_COOKIE = "__Host-findings_board_session";
export const SESSION_COOKIE_DEV = "findings_board_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12h — shorter desk sessions

function cookieName(): string {
  // __Host- requires Secure + Path=/ + no Domain. Fine on Vercel HTTPS.
  // Local http://localhost cannot use __Host-.
  const secure =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
  return secure ? SESSION_COOKIE : SESSION_COOKIE_DEV;
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createSessionToken(): string {
  const { sessionSecret } = getConfig();
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const nonce = randomBytes(16).toString("base64url");
  const payload = `v1.${exp}.${nonce}`;
  return `${payload}.${sign(payload, sessionSecret)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const { sessionSecret } = getConfig();
  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return false;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (!payload || !signature) return false;

  const parts = payload.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;

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
  const name = cookieName();
  const primary = verifySessionToken(jar.get(name)?.value);
  if (primary) return true;
  // Accept legacy cookie name during transition
  if (name !== SESSION_COOKIE_DEV) {
    return verifySessionToken(jar.get(SESSION_COOKIE_DEV)?.value);
  }
  return false;
}

export function sessionCookieOptions(token: string) {
  const secure =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
  return {
    name: cookieName(),
    value: token,
    httpOnly: true,
    sameSite: "strict" as const,
    secure,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export function clearSessionCookieOptions() {
  const secure =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
  return [
    {
      name: cookieName(),
      value: "",
      httpOnly: true,
      sameSite: "strict" as const,
      secure,
      path: "/",
      maxAge: 0,
    },
    {
      name: SESSION_COOKIE_DEV,
      value: "",
      httpOnly: true,
      sameSite: "strict" as const,
      secure,
      path: "/",
      maxAge: 0,
    },
  ];
}

export function checkBoardPassword(password: string): boolean {
  const { boardPassword } = getConfig();
  if (!password || password.length > 200) return false;
  return constantTimeEqualString(password, boardPassword);
}
