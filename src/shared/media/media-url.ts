/**
 * mediaUrl — the R2 switch, in its own tiny module so browser code can use
 * it without pulling the whole image manifest into the bundle.
 *
 * ┌─────────────────────────── R2 SWITCH ───────────────────────────┐
 * │ Images and video are served from this repo's public/ folder by   │
 * │ default. To serve them from a Cloudflare R2 bucket instead, set   │
 * │   PUBLIC_MEDIA_BASE_URL=https://media.masra.sa                    │
 * │ at build time (Cloudflare build settings → environment variable) │
 * │ after uploading with `npx pnpm media:upload`. Leave it unset to   │
 * │ serve from the site itself. See docs/guides/move-images-to-r2.md. │
 * └──────────────────────────────────────────────────────────────────┘
 */

/** Media origin without a trailing slash ("" = this site). */
const BASE = (import.meta.env.PUBLIC_MEDIA_BASE_URL ?? "").replace(/\/+$/, "");

/** URL for anything under public/images or public/video, e.g.
 *  mediaUrl("/images/og.jpg"). Paths outside those two folders (fonts,
 *  favicon) always stay on the site origin. */
export function mediaUrl(path: string): string {
  if (!BASE || !/^\/(images|video)\//.test(path)) return path;
  return BASE + path;
}
