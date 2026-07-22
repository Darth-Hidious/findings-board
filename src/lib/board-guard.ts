import { NextResponse } from "next/server";
import { isBoardAuthenticated } from "@/lib/auth";
import {
  assertProductionSecrets,
  isAllowedOrigin,
  requireJsonContentType,
  safeErrorMessage,
} from "@/lib/security";

export async function requireBoardMutation(
  request: Request,
): Promise<NextResponse | null> {
  const configError = assertProductionSecrets();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

  if (!(await isBoardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    if (!requireJsonContentType(request) && request.method !== "POST") {
      // POST without body still ok for some routes; checked per-route
    }
  }

  return null;
}

export async function requireBoardRead(): Promise<NextResponse | null> {
  const configError = assertProductionSecrets();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }
  if (!(await isBoardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export { safeErrorMessage };
