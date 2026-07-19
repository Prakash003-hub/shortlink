import express from "express";
import cors from "cors";
import multer from "multer";
import Jimp from "jimp";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

import { UPLOADS_DIR } from "./utils/config.js";
import { readLinks, writeLinks } from "./utils/db.js";
import { generateShortCode, isValidCustomCode } from "./utils/shortcode.js";
import { generateAllStatic } from "./utils/generateStatic.js";

const ROOT = process.cwd();
const uploadsPath = path.join(ROOT, UPLOADS_DIR);
fs.mkdirSync(uploadsPath, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());
// Serve uploads/data during dev so the admin UI can preview images
// without waiting for a Vite restart.
app.use("/uploads", express.static(uploadsPath));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// ---- Upload + resize OG image (1200x630, cover crop) ----
// Note: Jimp's core build can only *encode* jpeg/png/bmp/tiff, not webp,
// so images are optimized and saved as high-quality .jpg. If you need
// real .webp output, swap Jimp for `sharp` in this one function.
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const image = await Jimp.read(req.file.buffer);
    image.cover(1200, 630).quality(85);

    const filename = `${nanoid(10)}.jpg`;
    const outPath = path.join(uploadsPath, filename);
    await image.writeAsync(outPath);

    res.json({ image: `/uploads/${filename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image processing failed" });
  }
});

// ---- List links ----
app.get("/api/links", (req, res) => {
  res.json(readLinks());
});

// ---- Create link ----
app.post("/api/links", (req, res) => {
  const { targetUrl, image, title, description, customCode } = req.body;

  if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
    return res.status(400).json({ error: "A valid targetUrl (http/https) is required" });
  }

  const links = readLinks();
  const existingCodes = new Set(links.map((l) => l.shortCode));

  let shortCode;
  if (customCode) {
    if (!isValidCustomCode(customCode)) {
      return res.status(400).json({ error: "Custom code must be 4-12 letters/numbers" });
    }
    if (existingCodes.has(customCode)) {
      return res.status(409).json({ error: "That short code is already in use" });
    }
    shortCode = customCode;
  } else {
    shortCode = generateShortCode(existingCodes);
  }

  const link = {
    shortCode,
    targetUrl,
    image: image || "",
    title: title || "",
    description: description || "",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  links.unshift(link);
  writeLinks(links);
  generateAllStatic(links);

  res.status(201).json(link);
});

// ---- Delete link ----
app.delete("/api/links/:code", (req, res) => {
  const links = readLinks();
  const next = links.filter((l) => l.shortCode !== req.params.code);

  if (next.length === links.length) {
    return res.status(404).json({ error: "Short code not found" });
  }

  writeLinks(next);
  generateAllStatic(next);
  res.json({ ok: true });
});

// ---- Manually regenerate every static page from links.json ----
app.post("/api/generate", (req, res) => {
  const links = readLinks();
  const result = generateAllStatic(links);
  res.json({ ok: true, ...result });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Beacon admin API running at http://localhost:${PORT}`);
});
