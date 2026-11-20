/**
 * Pure rules behind the media scripts (no file system, no sharp) — tested
 * in media-core.test.mjs. The scripts in scripts/ do the I/O.
 */

/** Responsive width ladders by role. "feature" images (full-width, lead)
 *  get an extra 2400w rung for large screens. */
export const WIDTHS = { grid: [480, 960, 1600], feature: [480, 960, 1600, 2400] };

/** Encoder settings: AVIF is primary (best quality per byte on photos),
 *  WebP is the universal fallback. */
export const AVIF_OPTS = { quality: 50, effort: 4 };
export const WEBP_OPTS = { quality: 74 };

/** Share-card size (Open Graph standard). */
export const OG_SIZE = { width: 1200, height: 630 };

/** Client ids and slugs: lowercase letters, digits and dashes. */
export const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Widths to generate for a photo: the role's ladder, never wider than the
 * original (no upscaling). A photo narrower than the smallest rung still
 * gets one size — its own width.
 */
export function widthsFor(role, sourceWidth) {
  const ladder = WIDTHS[role];
  if (!ladder) throw new Error(`Unknown role "${role}" (use "grid" or "feature")`);
  const fit = ladder.filter((w) => w <= sourceWidth);
  return fit.length ? fit : [sourceWidth];
}

/**
 * The next free slug for a client's new photo: "<client>-photo-<n>", with
 * n one higher than any existing "<client>-photo-*". Slugs are never
 * reused, so a replaced photo always gets a new URL (the CDN caches image
 * URLs forever — reusing a name would show the old photo).
 */
export function nextSlug(clientId, existingSlugs) {
  const prefix = `${clientId}-photo-`;
  let max = 0;
  for (const slug of existingSlugs) {
    if (!slug.startsWith(prefix)) continue;
    const n = Number(slug.slice(prefix.length));
    if (Number.isInteger(n) && n > max) max = n;
  }
  return `${prefix}${max + 1}`;
}

/** Every file name an image entry owns under public/images/<shoot>/. */
export function derivativeFiles(slug, entry) {
  return entry.widths.flatMap((w) => [`${slug}-${w}.avif`, `${slug}-${w}.webp`]);
}

/** Parse "--key value" / "--flag" arguments into an object. */
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      out._.push(a);
      continue;
    }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}
