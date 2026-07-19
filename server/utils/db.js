import fs from "fs";
import path from "path";
import { LINKS_FILE, DATA_DIR } from "./config.js";

const ROOT = process.cwd();
const linksPath = path.join(ROOT, LINKS_FILE);

function ensureFile() {
  const dataDir = path.join(ROOT, DATA_DIR);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(linksPath)) fs.writeFileSync(linksPath, "[]\n");
}

export function readLinks() {
  ensureFile();
  const raw = fs.readFileSync(linksPath, "utf-8");
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

export function writeLinks(links) {
  ensureFile();
  fs.writeFileSync(linksPath, JSON.stringify(links, null, 2) + "\n");
}
