// @ts-check
import { defineConfig } from "astro/config";

/**
 * Astro config for the MASRA site — a fully static build (no server, no
 * adapter). `astro build` writes plain HTML + assets to dist/, which
 * Cloudflare (Pages or Workers static assets) serves as-is.
 *
 * site: the public address. Used for absolute share-card (Open Graph)
 * URLs and canonical links. Change it here if the domain changes.
 *
 * build.format "file": every page is written as one file
 * (`/work/peti` → `dist/work/peti.html`). Cloudflare serves that at
 * `/work/peti` with no trailing-slash redirect. ("directory" format would
 * emit work/peti/index.html, and Cloudflare would 308-redirect every
 * client URL to `/work/peti/` — the same family of bug as v3's `.html`
 * redirect, see changelogs/2026-11-20-client-feedback-v3.md.)
 */
export default defineConfig({
  site: "https://masra.sa",
  output: "static",
  trailingSlash: "never",
  build: {
    format: "file",
    // Stylesheets stay external (cacheable, immutable under /_astro/*).
    inlineStylesheets: "never",
  },
  // The dev server runs on the same port as the old Vite setup, so
  // .claude/launch.json and docs keep working.
  server: { port: 5173 },
  devToolbar: { enabled: false },
});
