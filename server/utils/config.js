// Set this to your production domain before generating static files,
// so og:image / og:url use absolute URLs (required by most link
// unfurlers on WhatsApp, Facebook, LinkedIn, Telegram, X, Discord).
export const SITE_URL = process.env.SITE_URL || "https://shortlinkjd.vercel.app";

export const DATA_DIR = "public/data";
export const LINKS_FILE = `${DATA_DIR}/links.json`;
export const UPLOADS_DIR = "public/uploads";
export const STATIC_LINKS_DIR = "public/s";
