export type AppConfig = {
  siteName: string;
  siteTagline: string;
  githubUsername: string;
  xHandle: string;
  siteUrl: string;
  boardPassword: string;
  sessionSecret: string;
  githubToken: string | undefined;
  xaiApiKey: string | undefined;
  xaiModel: string;
  xApiKey: string | undefined;
  xApiSecret: string | undefined;
  xAccessToken: string | undefined;
  xAccessSecret: string | undefined;
  xBearerToken: string | undefined;
  autoPost: boolean;
};

export function getConfig(): AppConfig {
  return {
    siteName: process.env.SITE_NAME || "Siddhartha Kovid",
    siteTagline:
      process.env.SITE_TAGLINE || "Cool findings. Typed, not hyped.",
    githubUsername: process.env.GITHUB_USERNAME || "",
    xHandle: (process.env.X_HANDLE || "").replace(/^@/, ""),
    siteUrl: process.env.SITE_URL || "http://localhost:3000",
    boardPassword: process.env.BOARD_PASSWORD || "change-me",
    sessionSecret:
      process.env.SESSION_SECRET || "dev-only-session-secret-change-me",
    githubToken: process.env.GITHUB_TOKEN || undefined,
    xaiApiKey: process.env.XAI_API_KEY || undefined,
    xaiModel: process.env.XAI_MODEL || "grok-3-mini",
    xApiKey: process.env.X_API_KEY || undefined,
    xApiSecret: process.env.X_API_SECRET || undefined,
    xAccessToken: process.env.X_ACCESS_TOKEN || undefined,
    xAccessSecret: process.env.X_ACCESS_SECRET || undefined,
    xBearerToken: process.env.X_BEARER_TOKEN || undefined,
    autoPost: process.env.AUTO_POST === "true",
  };
}

export function hasXCredentials(config = getConfig()): boolean {
  return Boolean(
    config.xApiKey &&
      config.xApiSecret &&
      config.xAccessToken &&
      config.xAccessSecret,
  );
}

export function githubProfileUrl(username: string): string {
  return `https://github.com/${username}`;
}

export function xProfileUrl(handle: string): string {
  return `https://x.com/${handle}`;
}
