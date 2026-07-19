import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SITE_URL, STATIC_LINKS_DIR } from "./config.js";
import { readLinks } from "./db.js";

const ROOT = process.cwd();

function escapeAttr(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function absoluteUrl(pathname) {
  if (!pathname) return "";
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return `${SITE_URL.replace(/\/$/, "")}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
}

function pageHtml(link) {
  const targetUrl = escapeAttr(link.targetUrl);
  const imageUrl = escapeAttr(absoluteUrl(link.image));
  const shortUrl = escapeAttr(absoluteUrl(`/s/${link.shortCode}`));
  const title = escapeAttr(link.title || "Redirecting…");
  const description = escapeAttr(link.description || "This link will take you to your destination.");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>

<meta http-equiv="refresh" content="0;url=${targetUrl}" />
<link rel="canonical" href="${shortUrl}" />

<meta property="og:type" content="website" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${shortUrl}" />
${imageUrl ? `<meta property="og:image" content="${imageUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/jpeg" />` : ""}

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
${imageUrl ? `<meta name="twitter:image" content="${imageUrl}" />` : ""}

<style>
  html,body{height:100%;margin:0;background:#0c1015;color:#e7ecef;font-family:system-ui,-apple-system,sans-serif;}
  .wrap{height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;}
  .spinner{width:28px;height:28px;border:3px solid #232b34;border-top-color:#ffb020;border-radius:50%;animation:spin 0.8s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg)}}
  a{color:#38bdf8;}
</style>
</head>
<body>
  <div class="wrap">
    <div class="spinner"></div>
    <p>Redirecting… if nothing happens, <a href="${targetUrl}">click here</a>.</p>
  </div>
  <script>location.replace(${JSON.stringify(link.targetUrl)});</script>
</body>
</html>
`;
}

/**
 * Writes public/s/<code>/index.html for every link in the array.
 * Also removes stale folders for codes no longer present.
 */
export function generateAllStatic(links = readLinks()) {
  const linksDir = path.join(ROOT, STATIC_LINKS_DIR);
  if (!fs.existsSync(linksDir)) fs.mkdirSync(linksDir, { recursive: true });

  const validCodes = new Set(links.map((l) => l.shortCode));

  // Remove folders for deleted links
  for (const entry of fs.readdirSync(linksDir, { withFileTypes: true })) {
    if (entry.isDirectory() && !validCodes.has(entry.name)) {
      fs.rmSync(path.join(linksDir, entry.name), { recursive: true, force: true });
    }
  }

  // Write current links
  for (const link of links) {
    const dir = path.join(linksDir, link.shortCode);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), pageHtml(link));
  }

  return { count: links.length };
}

// Allow running directly: `npm run generate`
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const result = generateAllStatic();
  console.log(`Generated ${result.count} static link page(s) in ${STATIC_LINKS_DIR}/`);
}
