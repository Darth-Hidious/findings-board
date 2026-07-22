# Security

## Threat model (personal board)

- Public site is read-only portfolio content.
- `/board` and `/api/*` board mutations are private.
- Private GitHub repos must never appear on the public homepage.
- Secrets live only in Vercel env / local `.env.local` (gitignored).

## Controls in place

1. **Strong secrets required in production** — `SESSION_SECRET` ≥ 32 chars;
   `BOARD_PASSWORD` ≥ 16 chars and not a default. Misconfig → HTTP 503.
2. **HttpOnly session cookies** — `__Host-` prefix on HTTPS, `Secure`,
   `SameSite=Strict`, 12h expiry, HMAC-signed payload with nonce + expiry.
3. **Origin checks** on login/logout and all board mutations (CSRF mitigation).
4. **Login rate limit** — 5 failures / 15 minutes per IP, then lockout.
5. **Minimum delay** on password check to slow online guessing.
6. **Security headers** — CSP, HSTS (prod), `X-Frame-Options: DENY`,
   `nosniff`, referrer policy, permissions policy.
7. **Input limits** — password length cap, thread length/count caps, HTTPS-only
   media URLs.
8. **Private findings filtered** from public feed (`isPrivate`).
9. **API errors sanitized** in production; tokens redacted from ingest warnings.
10. **No secret defaults committed** — `.env.example` uses placeholders only.

## Operator checklist

- Rotate `BOARD_PASSWORD` and `SESSION_SECRET` if they were ever pasted in chat.
- Put a fine-grained GitHub PAT in `GITHUB_TOKEN` with **Contents: Read** on
  needed repos only (not a classic `repo` god-token if you can avoid it).
- Never commit `.env.local`, `.vercel`, or `data/*.json`.
- Keep `AUTO_POST=false` until you trust drafts.
- Attach custom domain over HTTPS only (Vercel default).

## Getting the board password

Do **not** ask the agent to paste it in chat. Read it from:

Vercel → Project `findings-board` → Settings → Environment Variables →
`BOARD_PASSWORD`.
