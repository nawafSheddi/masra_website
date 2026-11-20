import manifest from "../../generated/image-manifest.json";
import { strings } from "../../config/strings";

/**
 * Responsive <picture> builder.
 *
 * Reads geometry from the generated image manifest (written by
 * scripts/optimize-images.mjs) and meaning (alt text) from strings.ts.
 * Every image gets:
 *   - AVIF source + WebP fallback with full srcset ladders
 *   - explicit width/height + aspect-ratio (CLS stays at zero)
 *   - a blur-up placeholder painted under the img; the img fades in on load
 *   - lazy loading by default; hero/LCP images opt into eager+high priority
 */

type ManifestEntry = {
  shoot: string;
  role: string;
  width: number;
  height: number;
  aspect: number;
  widths: number[];
  blurDataURI: string;
};

const entries = manifest as Record<string, ManifestEntry>;

export type ImageSlug = keyof typeof strings.imageAlt;

export interface PictureOptions {
  /** CSS `sizes` attribute — how wide this slot renders (default full bleed). */
  sizes?: string;
  /** Eager-load + fetchpriority=high — ONLY for the LCP hero image. */
  eager?: boolean;
  /** Extra class on the wrapping <picture>. */
  className?: string;
  /** alt="" — use when the image sits inside a link whose text already
   *  names it (work cards, next project), so screen readers don't read the
   *  long photo description before the link name. */
  decorative?: boolean;
}

/** Build the srcset string for one format ladder. */
function srcset(slug: string, entry: ManifestEntry, ext: "avif" | "webp"): string {
  return entry.widths
    .map((w) => `/images/${entry.shoot}/${slug}-${w}.${ext} ${w}w`)
    .join(", ");
}

/**
 * Create a <picture> element for a manifest slug.
 * Throws at dev time if the slug is missing — a typo here should fail loud.
 */
export function buildPicture(slug: ImageSlug, opts: PictureOptions = {}): HTMLPictureElement {
  const entry = entries[slug];
  if (!entry) throw new Error(`Unknown image slug: ${slug}`);

  const { sizes = "100vw", eager = false, className = "", decorative = false } = opts;

  const picture = document.createElement("picture");
  picture.className = `pic ${className}`.trim();
  // Blur-up: the tiny placeholder paints as the picture background until the
  // real image finishes decoding, then the img fades over it.
  picture.style.backgroundImage = `url("${entry.blurDataURI}")`;
  picture.style.backgroundSize = "cover";
  picture.style.backgroundPosition = "center";

  const avif = document.createElement("source");
  avif.type = "image/avif";
  avif.srcset = srcset(slug, entry, "avif");
  avif.sizes = sizes;

  const img = document.createElement("img");
  img.src = `/images/${entry.shoot}/${slug}-${entry.widths[entry.widths.length - 1]}.webp`;
  img.srcset = srcset(slug, entry, "webp");
  img.sizes = sizes;
  img.alt = decorative ? "" : strings.imageAlt[slug];
  img.width = entry.width;
  img.height = entry.height;
  img.decoding = "async";
  img.loading = eager ? "eager" : "lazy";
  if (eager) img.fetchPriority = "high";

  // Fade the real pixels in over the blur placeholder once decoded.
  img.style.opacity = "0";
  img.style.transition = "opacity 0.4s ease";
  const reveal = () => {
    img.style.opacity = "1";
  };
  if (img.complete) reveal();
  else img.addEventListener("load", reveal, { once: true });

  picture.append(avif, img);
  return picture;
}

/** Aspect ratio for a slug (width/height) — used by layouts that need to
 *  reserve space before the image mounts. */
export function imageAspect(slug: ImageSlug): number {
  return entries[slug].aspect;
}
