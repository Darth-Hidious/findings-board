# Hosting on Vercel

Yes — this app is set up for **Vercel**.

SQLite was removed. Findings now use a JSON store (`data/findings.json` locally,
`/tmp/findings-board.json` on Vercel). That is enough for a personal board.
Cold starts may reset `/tmp`; for durable drafts later you can wire Turso/Blob,
but the portfolio itself does not need that.

## Deploy (you already have Vercel + Darth-Hidious)

1. Create a GitHub repo under **Darth-Hidious** (e.g. `findings-board` or your
   existing portfolio repo).
2. Push this project to that repo.
3. In Vercel → **Add New Project** → import that repo (or reconnect if it is
   already linked).
4. Framework: Next.js. Build: `npm run build`. Output: default.
5. Add environment variables (Project → Settings → Environment Variables):

| Variable | Value |
|----------|--------|
| `SITE_NAME` | `Siddhartha Yash Kovid` |
| `SITE_TAGLINE` | `Cool findings. Typed, not hyped.` |
| `GITHUB_USERNAME` | `Darth-Hidious` |
| `X_HANDLE` | `siddharthayko` |
| `SITE_URL` | your Vercel / custom domain |
| `BOARD_PASSWORD` | strong password |
| `SESSION_SECRET` | long random string |
| `GITHUB_TOKEN` | PAT with `repo` scope (needed for **private** repos) |
| `XAI_API_KEY` | optional, for Grok drafts |
| `X_API_KEY` / `X_API_SECRET` / `X_ACCESS_TOKEN` / `X_ACCESS_SECRET` | optional live posting |

6. Deploy. Your existing custom domain can be attached under Domains.

## Private repos

Without `GITHUB_TOKEN`, ingest only sees **public** repos.

With a fine-grained or classic PAT (`repo` read), ingest calls `/user/repos` and
includes private owner repos. The **public homepage does not list private repo
names** unless you approve a finding that already exposes them — keep board
access locked.

## What is not published on the site

- City / street location
- Phone number
- Full mailing address

CV PDF is available at `/cv.pdf` if you want to share details selectively.

## This cloud agent cannot finish the Vercel click for you

There is no Vercel/GitHub login in this environment. After you push the repo (or
paste a deploy hook / grant access), Vercel will build it. If you create an empty
`findings-board` repo and add a deploy key or make it accessible to Cursor, we
can push from here next.
