# Findings Board

Portfolio site + private posting desk that turns GitHub findings into dry, layered-humor X threads.

## What it does

1. **Public portfolio** (`/`) — brand-first hero and a findings feed from the same local store.
2. **Private board** (`/board`) — inbox of GitHub findings, editable thread bubbles, voice dial, approve/skip.
3. **Grok drafting** — anti-hype style bible with crude layered jokes (`dry` / `dry_bones` / `bones_forward`).
4. **X posting** — posts real threads when API keys exist; otherwise **dry-run** (logs payload, marks posted locally).

Thread shape by default: what it is → finding → optional how → bones → link.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Board login uses `BOARD_PASSWORD` (default `change-me`).

Defaults are wired for **Tim the Enchanter** — GitHub [`Darth-Hidious`](https://github.com/Darth-Hidious), X [`@siddharthayko`](https://x.com/siddharthayko).

### Required env

| Key | Purpose |
|-----|---------|
| `SITE_NAME` | Portfolio brand |
| `GITHUB_USERNAME` | Public repos to ingest |
| `BOARD_PASSWORD` | Gate for `/board` |
| `SESSION_SECRET` | Cookie signing |

### Optional env

| Key | Purpose |
|-----|---------|
| `XAI_API_KEY` | Grok drafts (fallback templates without it) |
| `XAI_MODEL` | Default `grok-3-mini` |
| `X_API_KEY` / `X_API_SECRET` / `X_ACCESS_TOKEN` / `X_ACCESS_SECRET` | Live X posting |
| `X_HANDLE` | Thread URLs + portfolio links |
| `GITHUB_TOKEN` | Higher GitHub rate limits |
| `AUTO_POST` | `true` to auto-post after draft (off by default) |

## Mark a finding intentionally

Drop `findings.json` in a repo root:

```json
{
  "findings": [
    {
      "title": "Shader ate the z-buffer",
      "summary": "Depth pass was writing color. Looked cinematic. Was wrong.",
      "media": ["https://raw.githubusercontent.com/you/repo/main/media/demo.gif"]
    }
  ]
}
```

Without that file, ingest still picks recent public repos with README text and media under `media/`, `assets/`, `demos/`, `screenshots`, `images/`, or root `demo.*`.

## Board flow

1. Log in at `/board/login`
2. **Ingest GitHub**
3. Select a finding → pick voice → **Regenerate**
4. Edit bubbles if needed → **Approve & post**
5. Posted items show on the public findings feed

## Voice notes

- Banned hype: game-changer, excited to share, thrilled, revolutionary, etc.
- Jokes should have a second floor tied to the real finding.
- Prefer threads over one stuffed tweet.

## Scripts

- `npm run dev` — local dev
- `npm run build` — production build
- `npm run start` — serve build
- `npm run lint` — eslint

SQLite lives in `data/findings.db` (gitignored). A demo finding is seeded on first boot so the desk works before credentials.
