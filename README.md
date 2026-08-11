# FCOR Editor (Vercel front-end)

Front-end for reviewing FCOR content posts: fill in `[placeholders]`, edit the
text, then **Publish**. Publishing is handled by the VPS API (the front only
edits and calls it).

## How it fits together

```
Telegram bot  →  sends a preview + button linking to:
                 https://<this-vercel-app>/edit/<token>
                        │
                        ▼
   This Next.js app (browser)  →  /api/post/<token>   (its own routes, https)
                                  /api/publish/<token>
                        │  (server-side proxy)
                        ▼
   VPS backend (editor_server.py, http:9101) → publishes to Telegram / VK / VC
```

The browser only ever calls this app's own `/api/*` routes over **https**. Those
routes run on the Vercel server and proxy to the VPS backend over http — so
there is **no mixed-content problem** and the VPS needs no domain/SSL.

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import it in Vercel (framework auto-detected: **Next.js**).
3. Add an environment variable (Settings → Environment Variables):
   - `API_ORIGIN` = the VPS backend base, e.g. `http://178.88.115.213:9101`
     (server-side only — **no** `NEXT_PUBLIC_` prefix; may stay http).
4. Deploy. The editor lives at `https://<app>.vercel.app/edit/<token>`.

## Local dev

```bash
npm install
cp .env.example .env.local   # set API_ORIGIN
npm run dev                  # http://localhost:3000
```

Open `http://localhost:3000/edit/<token>` with a real pending token.

## Notes

- Tokens are unguessable (`secrets.token_urlsafe`); a link only works while the
  post is pending. After publishing, `/edit/<token>` shows “already published”.
- The backend URL (`API_ORIGIN`) never reaches the browser — it lives only in
  the Vercel server runtime.
