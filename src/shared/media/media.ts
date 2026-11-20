import manifest from "../../generated/image-manifest.json";

import { mediaUrl } from "./media-url";

export { mediaUrl };

/**
 * Media helpers (build time) — turn an image slug into URLs and geometry
 * from the optimized-image manifest. URLs go through mediaUrl (the R2
 * switch, see media-url.ts).
 */

/** One optimized image, as written by scripts/media-add.mjs. */
export interface ImageEntry {
  /** Folder under public/images/ (usually the client id). */
  shoot: string;
  /** "feature" = large/full-bleed ladder (adds 2400w); "grid" = smaller. */
  role: string;
  width: number;
  height: number;
  /** width / height. */
  aspect: number;
  /** Widths that exist on disk (never upscaled past the original). */
  widths: number[];
  /** Tiny inline WebP shown while the real image loads. */
  blurDataURI: string;
}

const entries = manifest as Record<string, ImageEntry>;

/** True when a slug exists in the image manifest (used by the content
 *  schema to give a readable error for typos / missing imports). */
export function hasImage(slug: string): boolean {
  return Object.hasOwn(entries, slug);
}

/** Manifest entry for a slug. Throws with a fix-it message if missing. */
export function getImage(slug: string): ImageEntry {
  const entry = entries[slug];
  if (!entry) {
    throw new Error(
      `Image "${slug}" is not in src/generated/image-manifest.json. ` +
        `Add it with: npx pnpm media:add --client <id> --file <photo>`
    );
  }
  return entry;
}

/** srcset string for one format ladder (avif or webp). */
export function imageSrcset(slug: string, ext: "avif" | "webp"): string {
  const entry = getImage(slug);
  return entry.widths
    .map((w) => `${mediaUrl(`/images/${entry.shoot}/${slug}-${w}.${ext}`)} ${w}w`)
    .join(", ");
}

/** Largest WebP — the plain <img src> fallback. */
export function imageFallbackSrc(slug: string): string {
  const entry = getImage(slug);
  return mediaUrl(`/images/${entry.shoot}/${slug}-${entry.widths[entry.widths.length - 1]}.webp`);
}

/** Share-card (Open Graph) JPEG for a client, written by media-add when a
 *  lead image is imported. Falls back to the site-wide card. */
export function ogImagePath(clientId?: string): string {
  return clientId ? `/images/og/${clientId}.jpg` : "/images/og.jpg";
}
