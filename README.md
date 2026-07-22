# Findings Board

Somber personal site + private X posting desk. Built for Vercel.

## What it is

- **`/`** — Plain academic portfolio from your CV (no city/phone on the page).
- **`/board`** — Password desk: ingest GitHub (public + private with token) →
  draft dry threads → approve & post.
- **`/cv.pdf`** — CV download.

## Host on Vercel

See [HOSTING.md](HOSTING.md). Short version: push to `Darth-Hidious` → import in
Vercel → set env vars (especially `GITHUB_TOKEN` for private repos) → attach
your existing domain.

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Board password: `BOARD_PASSWORD` (default `change-me`).

## Security

See [SECURITY.md](SECURITY.md). Board password lives in Vercel env — do not paste
it into chat. Private repos never appear on the public homepage.

| Key | Purpose |
|-----|---------|
| `GITHUB_USERNAME` | `Darth-Hidious` |
| `GITHUB_TOKEN` | Include **private** repos in ingest |
| `X_HANDLE` | `siddharthayko` |
| `BOARD_PASSWORD` / `SESSION_SECRET` | Board auth |
| `XAI_API_KEY` | Grok drafts |
| `X_API_*` | Live X posting (else dry-run) |

## Scripts

`npm run dev` · `npm run build` · `npm run start` · `npm run lint`
