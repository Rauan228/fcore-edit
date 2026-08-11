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
   This Next.js app  →  GET  {API}/api/post/<token>   (load post text)
                        POST {API}/publish/<token>     (publish on "Готово")
                        │
                        ▼
   VPS API (editor_server.py) → publishes to Telegram / VK / VC
```

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import it in Vercel (framework auto-detected: **Next.js**).
3. Add an environment variable:
   - `NEXT_PUBLIC_API_URL` = your VPS API base, **https** (see below).
4. Deploy. The editor lives at `https://<app>.vercel.app/edit/<token>`.

## VPS API must be HTTPS

Vercel serves over `https`. The browser blocks calls from an https page to an
`http` API (**mixed content**). So the VPS API (`editor_server.py`, port 9101)
needs to be reachable over https. Options:

- Put nginx (already on the VPS) in front with a domain + Let's Encrypt cert,
  proxying `https://api.yourdomain/…` → `127.0.0.1:9101`.
- Or any https reverse proxy / tunnel.

Until then, for local testing you can set `NEXT_PUBLIC_API_URL=http://178.88.115.213:9101`
and run the app over http locally (`npm run dev`).

## Local dev

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev                  # http://localhost:3000
```

Open `http://localhost:3000/edit/<token>` with a real pending token.

## Notes

- CORS is already enabled on the VPS API (`Access-Control-Allow-Origin: *`).
- Tokens are unguessable (`secrets.token_urlsafe`); a link only works while the
  post is pending. After publishing, `/edit/<token>` shows “already published”.
