import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Local dev only: the built site never calls the API, it reads
// public/data/links.json directly. The proxy just makes admin
// dashboard requests work while `npm run dev` is running.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
