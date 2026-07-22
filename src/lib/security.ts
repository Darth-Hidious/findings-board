import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getConfig } from "./config";

const loginAttempts = new Map<
  string,
  { count: number; resetAt: number; lockedUntil?: number }
>();

export function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export function assertProductionSecrets(): string | null {
  const isProd =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
  if (!isProd) return null;

  const { boardPassword, sessionSecret } = getConfig();
  if (!sessionSecret || sessionSecret.length < 32) {
    return "SESSION_SECRET must be at least 32 characters in production.";
  }
  if (
    !boardPassword ||
    boardPassword.length < 16 ||
    boardPassword === "change-me" ||
    boardPassword === "dev-only-session-secret-change-me"
  ) {
    return "BOARD_PASSWORD must be a strong secret (16+ chars), not a default.";
  }
  return null;
}

export function checkLoginRateLimit(ip: string): {
  ok: boolean;
  retryAfterSec?: number;
} {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (entry?.lockedUntil && entry.lockedUntil > now) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((entry.lockedUntil - now) / 1000),
    };
  }
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 0, resetAt: now + 15 * 60 * 1000 });
  }
  return { ok: true };
}

export function recordLoginFailure(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || {
    count: 0,
    resetAt: now + 15 * 60 * 1000,
  };
  entry.count += 1;
  if (entry.count >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000;
    entry.count = 0;
  }
  loginAttempts.set(ip, entry);
}

export function clearLoginFailures(ip: string): void {
  loginAttempts.delete(ip);
}

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const { siteUrl } = getConfig();

  const allowed = new Set<string>();
  for (const raw of [
    siteUrl,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://findings-board.vercel.app",
    "https://siddharthayashkovid.com",
    "https://www.siddharthayashkovid.com",
    "https://darth-hidious.com",
    "https://www.darth-hidious.com",
  ]) {
    if (!raw) continue;
    try {
      allowed.add(new URL(raw).origin);
    } catch {
      // ignore invalid
    }
  }

  // Also allow any *.vercel.app deployment for this project name
  const check = (value: string | null): boolean => {
    if (!value) return false;
    try {
      const url = new URL(value);
      if (allowed.has(url.origin)) return true;
      if (
        url.hostname.endsWith(".vercel.app") &&
        url.hostname.includes("findings-board")
      ) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Same-origin browser navigations may omit Origin; require Referer then.
  if (origin) return check(origin);
  if (referer) return check(referer);
  // Non-browser clients (curl) without Origin/Referer: deny mutating board APIs
  return false;
}

export function requireJsonContentType(request: Request): boolean {
  const ct = request.headers.get("content-type") || "";
  return ct.includes("application/json");
}

export function safeErrorMessage(error: unknown, fallback: string): string {
  if (process.env.NODE_ENV !== "production" && error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function fingerprintSecret(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function constantTimeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32));
    return false;
  }
  return timingSafeEqual(left, right);
}
