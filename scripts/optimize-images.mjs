/**
 * MASRA image pipeline.
 *
 * Reads the curated raw photographs from ./assetes (1GB originals, gitignored),
 * and emits web-optimized derivatives into ./public/images plus a manifest at
 * ./src/generated/image-manifest.json that the site consumes at build time.
 *
 * Per image we produce:
 *   - AVIF + WebP at each responsive width (no JPEG: WebP covers Safari 14+)
 *   - a 24px-wide inline blur placeholder (base64 WebP data URI)
 *   - intrinsic width/height/aspect metadata (CLS = 0: every <img> gets
 *     width/height attributes derived from the manifest)
 *
 * Usage:  npm run images          (skips outputs newer than their source)
 *         npm run images -- --force   (rebuild everything)
 */
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "assetes"); // sic — the source folder's real name
const OUT_DIR = join(ROOT, "public", "images");
const MANIFEST_PATH = join(ROOT, "src", "generated", "image-manifest.json");
const FORCE = process.argv.includes("--force");

/** Responsive width ladders by role. "feature" images (hero / full-bleed /
 *  pinned centerpiece) get an extra 2400w rung for large displays. */
const WIDTHS = { grid: [480, 960, 1600], feature: [480, 960, 1600, 2400] };

/**
 * Curation manifest: every image the site uses, its shoot, slug and role.
 * This is the ONLY place that maps raw files to site imagery — swapping a
 * photo means editing one line here and re-running the script.
 */
const CURATED = [
  // PETI — chocolate brand, deep cinematic reds (shoot folder "01")
  { src: "01/DSC00114.jpg", shoot: "peti", slug: "peti-hero", role: "feature" },
  { src: "01/DSC00076.jpg", shoot: "peti", slug: "peti-lead", role: "feature" },
  { src: "01/DSC00388.jpg", shoot: "peti", slug: "peti-grid-1", role: "grid" },
  { src: "01/DSC00104-2.jpg", shoot: "peti", slug: "peti-grid-2", role: "grid" },
  { src: "01/DSC00365.jpg", shoot: "peti", slug: "peti-grid-3", role: "grid" },
  { src: "01/DSC00387.jpg", shoot: "peti", slug: "peti-wide", role: "feature" },

  // IDMI — coffee roasters, colorful product (shoot folder "After")
  { src: "After/DSC09170.png", shoot: "idmi", slug: "idmi-strip-1", role: "grid" },
  { src: "After/DSC09217.png", shoot: "idmi", slug: "idmi-strip-2", role: "grid" },
  { src: "After/DSC09240.png", shoot: "idmi", slug: "idmi-strip-3", role: "grid" },
  { src: "After/DSC09410.png", shoot: "idmi", slug: "idmi-strip-4", role: "grid" },
  { src: "After/DSC09181.png", shoot: "idmi", slug: "idmi-strip-5", role: "grid" },

  // LEVO — baroque still-life cakes (shoot folder "After 02")
  { src: "After 02/DSC01357.jpg", shoot: "levo", slug: "levo-centerpiece", role: "feature" },
  { src: "After 02/DSC01005.jpg", shoot: "levo", slug: "levo-grid-1", role: "grid" },
  { src: "After 02/DSC01028.jpg", shoot: "levo", slug: "levo-grid-2", role: "grid" },
  { src: "After 02/DSC01101.jpg", shoot: "levo", slug: "levo-grid-3", role: "grid" },
  { src: "After 02/DSC01031.jpg", shoot: "levo", slug: "levo-accent", role: "grid" },
];

/** Encoder settings: AVIF is primary (best bytes/quality on photos),
 *  WebP is the universal fallback. */
const AVIF_OPTS = { quality: 50, effort: 4 };
const WEBP_OPTS = { quality: 74 };

/** True when the output already exists and is newer than its source. */
function isFresh(outPath, srcPath) {
  if (FORCE || !existsSync(outPath)) return false;
  return statSync(outPath).mtimeMs >= statSync(srcPath).mtimeMs;
}

async function processImage(entry) {
  const srcPath = join(SRC_DIR, entry.src);
  if (!existsSync(srcPath)) throw new Error(`Missing source: ${entry.src}`);

  const outDir = join(OUT_DIR, entry.shoot);
  mkdirSync(outDir, { recursive: true });

  // .rotate() with no args bakes EXIF orientation into the pixels so the
  // reported width/height always match what the browser renders.
  const base = sharp(srcPath).rotate();
  const meta = await base.metadata();
  const { width: srcW, height: srcH } = meta;

  const widths = WIDTHS[entry.role].filter((w) => w <= srcW); // never upscale
  let written = 0;

  for (const w of widths) {
    for (const [ext, opts] of [["avif", AVIF_OPTS], ["webp", WEBP_OPTS]]) {
      const outPath = join(outDir, `${entry.slug}-${w}.${ext}`);
      if (isFresh(outPath, srcPath)) continue;
      await base.clone().resize({ width: w })[ext](opts).toFile(outPath);
      written++;
    }
  }

  // Tiny blur placeholder: 24px WebP, inlined as a data URI in the manifest.
  const blurBuf = await base.clone().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  const blurDataURI = `data:image/webp;base64,${blurBuf.toString("base64")}`;

  const aspect = srcW / srcH;
  console.log(
    `  ${entry.slug.padEnd(18)} ${String(srcW).padStart(5)}×${srcH}  ` +
      `aspect ${aspect.toFixed(3)}  widths [${widths.join(", ")}]  ` +
      `${written ? `wrote ${written}` : "fresh"}`
  );

  return [entry.slug, {
    shoot: entry.shoot,
    role: entry.role,
    width: srcW,
    height: srcH,
    aspect: Number(aspect.toFixed(4)),
    widths,
    blurDataURI,
  }];
}

/**
 * Official MASRA wordmark (hand-drawn calligraphy) from the brand kit.
 * The source PNGs are 5250×5250 with huge transparent margins; we trim,
 * downscale to 1400w and emit palette PNGs (flat-color art compresses
 * beautifully). The white variant is generated from the orange one's
 * alpha channel — the brand kit ships no white logo.
 */
const LOGO_SRC = join(ROOT, "brand_assetes", "Identity", "Logo");

async function writeLogos() {
  const outDir = join(OUT_DIR, "brand");
  mkdirSync(outDir, { recursive: true });
  const orangeSrc = join(LOGO_SRC, "#-01.png");

  // Orange master: trim transparent border, resize, palette-PNG.
  const orangeOut = join(outDir, "masra-logo-orange.png");
  if (!isFresh(orangeOut, orangeSrc)) {
    await sharp(orangeSrc).trim().resize({ width: 1400 }).png({ palette: true }).toFile(orangeOut);
  }

  // White variant: solid white masked by the trimmed logo's alpha channel.
  const whiteOut = join(outDir, "masra-logo-white.png");
  if (!isFresh(whiteOut, orangeSrc)) {
    const trimmed = await sharp(orangeSrc).trim().resize({ width: 1400 }).ensureAlpha().toBuffer();
    const { info } = await sharp(trimmed).raw().toBuffer({ resolveWithObject: true });
    const alpha = await sharp(trimmed).extractChannel(3).toBuffer();
    await sharp({
      create: { width: info.width, height: info.height, channels: 3, background: "#ffffff" },
    })
      .joinChannel(alpha)
      .png({ palette: true })
      .toFile(whiteOut);
  }
  console.log("  masra-logo         orange + white wordmarks → images/brand/");
}

/** Social share image: 1200×630 center-crop JPEG of the hero photograph
 *  (JPEG because some social scrapers still ignore AVIF/WebP). */
async function writeOgImage() {
  const srcPath = join(SRC_DIR, "01/DSC00114.jpg");
  const outPath = join(OUT_DIR, "og.jpg");
  if (isFresh(outPath, srcPath)) return;
  await sharp(srcPath)
    .rotate()
    .resize({ width: 1200, height: 630, fit: "cover", position: "attention" })
    .jpeg({ quality: 80 })
    .toFile(outPath);
  console.log("  og.jpg             1200×630 social card");
}

const started = Date.now();
console.log(`Optimizing ${CURATED.length} curated images → public/images\n`);

const entries = [];
for (const entry of CURATED) entries.push(await processImage(entry));
await writeLogos();
await writeOgImage();

mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
writeFileSync(MANIFEST_PATH, JSON.stringify(Object.fromEntries(entries), null, 2));

console.log(`\nManifest → src/generated/image-manifest.json`);
console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
