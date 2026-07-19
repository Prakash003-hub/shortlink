import axios from "axios";

// During `npm run dev`, Vite proxies /api -> http://localhost:4000 (see vite.config.js).
// This client is only ever used by the Admin screen, which is local-only.
const api = axios.create({
  baseURL: "/api",
});

export default api;
