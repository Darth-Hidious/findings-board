# Hosting plan

Right now this app is **not on the public internet**. It only exists in this
workspace / on your machine when you run `npm run dev`.

## What the app is

One Next.js site with two faces:

1. **Public portfolio** (`/`) — somber personal page: who you are, selected
   engineering work from GitHub, and a findings list.
2. **Private posting board** (`/board`) — password-gated desk that ingests
   GitHub, drafts X threads (Grok), and posts (or dry-runs) them.

Same database for both. No marketing chrome.

## Where to host it (recommended)

### Railway (best fit for this app)

Why: the board uses **SQLite on disk** (`data/findings.db`). Railway runs a
normal Node server (`next start`) with a persistent volume, so drafts survive
restarts. Vercel serverless does **not** keep a local SQLite file.

Steps (about 15 minutes):

1. Push this repo to GitHub under `Darth-Hidious` (new repo, e.g. `findings-board`).
2. Create a project on [railway.app](https://railway.app) → Deploy from that repo.
3. Set start command: `npm run start` (build: `npm run build`).
4. Add a **volume** mounted at `/app/data` (or set `cwd` so `./data` persists).
5. Paste env vars from `.env.example` into Railway Variables:
   - `SITE_NAME`, `GITHUB_USERNAME=Darth-Hidious`, `X_HANDLE=siddharthayko`
   - `BOARD_PASSWORD`, `SESSION_SECRET` (long random string)
   - `SITE_URL=https://your-railway-domain`
   - optional: `XAI_API_KEY`, X API keys, `GITHUB_TOKEN`
6. Generate a public domain in Railway. That URL is your portfolio.

Custom domain later: `kovid.thm…` or whatever you own → CNAME to Railway.

### Alternatives

| Host | Verdict |
|------|---------|
| **Render** | Same idea as Railway (Web Service + disk). Also fine. |
| **Vercel** | Easy for static Next pages, **bad** for SQLite board unless you rewrite storage to Turso. Skip for now. |
| **GitHub Pages** | Static HTML only. Cannot run `/board` APIs. Not enough. |

## Local preview (before hosting)

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 — portfolio.  
Open http://localhost:3000/board/login — desk (password from env).

## After it is live

1. Log into `/board`, click **Ingest GitHub**.
2. Draft / edit / **Approve & post** (dry-run until X keys exist).
3. Posted findings show on the public home page.

No separate “portfolio product” to buy. The homepage **is** the portfolio.
