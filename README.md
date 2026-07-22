# Findings Board

Somber personal site for an engineering student + a private X posting desk.

## What it is

- **`/`** — Plain HTML-looking portfolio: name, THM Gießen, selected repos, findings.
- **`/board`** — Password-gated desk: ingest GitHub → draft dry threads (Grok) → approve & post.

Not a startup landing page. Times New Roman, paper background, blue links.

## Hosting

**Nothing is live yet.** See [HOSTING.md](HOSTING.md).

Short version: push to GitHub → deploy on **Railway** (keeps SQLite) → set env vars → your URL is the portfolio.

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

- Portfolio: http://localhost:3000  
- Board: http://localhost:3000/board/login (`BOARD_PASSWORD`, default `change-me`)

Defaults: GitHub `Darth-Hidious`, X `@siddharthayko`.

## Env

| Key | Purpose |
|-----|---------|
| `SITE_NAME` | Portfolio heading |
| `GITHUB_USERNAME` | Ingest source |
| `X_HANDLE` | Profile / thread links |
| `BOARD_PASSWORD` | Board gate |
| `SESSION_SECRET` | Cookie signing |
| `XAI_API_KEY` | Grok drafts (optional; fallback drafts exist) |
| `X_API_*` | Live X posting (optional; dry-run without) |
| `AUTO_POST` | `true` only after you trust the voice |

## Mark a finding

Put `examples/findings.json` (or the same shape) at a repo root as `findings.json`.

## Scripts

- `npm run dev` / `npm run build` / `npm run start` / `npm run lint`
