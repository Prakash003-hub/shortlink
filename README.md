# Beacon — Dynamic Short Link Generator with Custom OG Images

React (Vite) frontend + a **local-only** Node/Express admin API. You create links
and OG images locally; everything gets baked into static files that ship to
Vercel. No backend runs in production.

## How it fits together

```
npm run dev
   ├─ Vite dev server (React)         → http://localhost:5173
   └─ Express admin API (local only)  → http://localhost:4000
        ├─ POST /api/upload    resize+optimize image → public/uploads/*.jpg
        ├─ POST /api/links     save link → public/data/links.json
        │                      + writes public/s/<code>/index.html
        ├─ DELETE /api/links/:code
        └─ POST /api/generate  regenerate every static /s/<code> page
```

At build time (`npm run build`), Vite copies everything in `public/` — the
`data/links.json`, the `uploads/*` images, and every generated `s/<code>/index.html`
— straight into `dist/`. The deployed React app then just does:

```js
fetch("/data/links.json")
```

No API calls, ever, in production.

## 1. Install

```bash
npm install
```

## 2. Set your production domain

Open `server/utils/config.js` and set `SITE_URL` to your real domain (or set the
`SITE_URL` env var). This is used to build **absolute** `og:image` / `og:url`
URLs — required for WhatsApp, Facebook, LinkedIn, Telegram, X, and Discord
unfurlers to pick up your image.

```js
export const SITE_URL = process.env.SITE_URL || "https://subionline.in";
```

## 3. Run locally

```bash
npm run dev
```

Open `http://localhost:5173/admin`:

1. Paste the **target URL**.
2. (Optional) Set a custom short code, OG title, and description.
3. Upload an image — it's auto-resized to **1200×630** and optimized.
4. Click **Generate short link**.

This immediately writes:
- `public/data/links.json` (the link record)
- `public/uploads/<id>.jpg` (the optimized OG image)
- `public/s/<code>/index.html` (the static redirect + OG page for that one link)

Use **Regenerate static files** any time you want to rebuild every `s/<code>`
page from the current `links.json` (e.g. after manually editing the JSON, or
after changing `SITE_URL`).

The **Links** tab (`/`) shows the same read-only view the public site will use
after deployment — it's a good way to preview cards before shipping.

## 4. Build

```bash
npm run build
```

Outputs a fully static site to `dist/`, including `dist/s/<code>/index.html`
for every link, `dist/data/links.json`, and `dist/uploads/*`.

You can sanity-check the static pages without any server:

```bash
npm run preview
# then visit http://localhost:4173/s/<yourcode>
```

## 5. Deploy to Vercel

```bash
vercel deploy --prod
```

`vercel.json` is already set up so `/s/*`, `/data/*`, and `/uploads/*` are
served as real static files (not swallowed by the React SPA rewrite). Nothing
else needs to run on Vercel — the Express server and `server/` folder are dev
tooling only and are never deployed as a function.

## Regenerating without the UI

```bash
npm run generate
```

Reads `public/data/links.json` and rewrites every `public/s/<code>/index.html`.
Handy in a CI step, or after hand-editing the JSON file.

## Notes

- Short codes are 5–6 characters from an unambiguous alphabet (no `0/O`,
  `1/I/l`) and checked for collisions before saving.
- Image processing uses **Jimp**, which encodes `.jpg` (not `.webp` — Jimp's
  core build doesn't have a WebP encoder). If you need true `.webp` output,
  swap `Jimp` for `sharp` inside `server/index.js`'s `/api/upload` route —
  the rest of the pipeline doesn't need to change.
- Each generated page does an instant `<meta http-equiv="refresh">` redirect
  plus a `location.replace()` fallback, so it works even with JS disabled,
  while still exposing OG/Twitter tags to link-preview crawlers that don't
  execute the redirect.
