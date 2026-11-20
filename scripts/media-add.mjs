/**
 * media:add — import ONE photo into the site.
 *
 *   npx pnpm media:add --client mamola --file ~/Downloads/DSC0123.jpg
 *   npx pnpm media:add --client mamola --file ./x.jpg --role feature --lead
 *
 * What it does:
 *   1. Optimizes the photo into public/images/<client>/<slug>-<width>.avif|webp
 *      (several widths, never upscaled) + a tiny blur placeholder.
 *   2. Adds it to src/generated/image-manifest.json (other entries untouched).
 *   3. With --lead: also writes the client's share card
 *      public/images/og/<client>.jpg (1200×630).
 *   4. Prints the YAML lines to paste into src/content/clients/<client>.yaml.
 *
 * Options:
 *   --client <id>     client id (= file name in src/content/clients/), required
 *   --file <path>     the original photo (JPG, PNG, TIFF or WebP), required.
 *                     iPhone HEIC photos: export as JPG first.
 *   --role <r>        "grid" (default) or "feature" (big / full-width / lead)
 *   --lead            this is the client's main photo (implies --role feature)
 *   --slug <name>     custom slug (default: <client>-photo-<next number>)
 *   --og-only         only (re)generate the share card from an existing slug:
 *                     npx pnpm media:add --client peti --og-only --slug peti-lead
 *   --crop <c>        share-card crop: centre (default), top, bottom, entropy
 *
 * The original photo is NOT copied into the repo — keep originals in Drive.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { AVIF_OPTS, ID_PATTERN, OG_SIZE, WEBP_OPTS, nextSlug, parseArgs, widthsFor } from "./lib/media-core.mjs";
import { acquireMediaLock } from "./lib/media-lock.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES = join(ROOT, "public", "images");
const MANIFEST = join(ROOT, "src", "generated", "image-manifest.json");
/** Names of removed images — never handed out again (see nextSlug). */
const RETIRED = join(ROOT, "src", "generated", "retired-images.json");

/** Print a plain-English error and stop. */
function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
const client = args.client;
if (typeof client !== "string" || !ID_PATTERN.test(client)) {
  fail('Pass the client id, e.g. --client mamola (lowercase letters, digits, dashes).');
}

// Only one media command at a time (parallel runs would collide on names).
acquireMediaLock(join(ROOT, "src", "generated", ".media.lock"));
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
const retired = existsSync(RETIRED) ? JSON.parse(readFileSync(RETIRED, "utf8")) : [];

/** Write the 1200×630 share card for a client from an image (file path or
 *  a manifest slug's largest WebP). JPEG: some link-preview crawlers still
 *  ignore AVIF/WebP. Centre crop by default (best on MASRA's centred
 *  product shots); --crop top|bottom|entropy when the subject sits off-centre. */
const CROPS = ["centre", "top", "bottom", "entropy"];
const crop = typeof args.crop === "string" ? args.crop : "centre";
if (!CROPS.includes(crop)) fail(`--crop must be one of: ${CROPS.join(", ")}`);
async function writeOgCard(input) {
  const outDir = join(IMAGES, "og");
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `${client}.jpg`);
  await sharp(input)
    .rotate()
    .resize({ ...OG_SIZE, fit: "cover", position: crop })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(out);
  return out;
}

// --- Share card only (from an image already in the site) -----------------
if (args["og-only"]) {
  const slug = args.slug;
  const entry = typeof slug === "string" ? manifest[slug] : undefined;
  if (!entry) fail('Pass an existing image with --slug, e.g. --slug peti-lead');
  const largest = entry.widths[entry.widths.length - 1];
  const out = await writeOgCard(join(IMAGES, entry.shoot, `${slug}-${largest}.webp`));
  console.log(`✓ Share card written: ${out.replace(ROOT + "/", "")}`);
  process.exit(0);
}

// --- Import a new photo ------------------------------------------------------
if (typeof args.file !== "string") fail("Pass the photo with --file <path>.");
const src = resolve(args.file.replace(/^~(?=\/)/, process.env.HOME ?? "~"));
if (!existsSync(src)) fail(`Photo not found: ${src}`);

const role = args.lead ? "feature" : (args.role ?? "grid");
if (role !== "grid" && role !== "feature") fail('--role must be "grid" or "feature".');

const slug = typeof args.slug === "string" ? args.slug : nextSlug(client, [...Object.keys(manifest), ...retired]);
if (!ID_PATTERN.test(slug)) fail(`Slug "${slug}" must be lowercase letters, digits and dashes.`);
if (manifest[slug] || retired.includes(slug)) {
  fail(
    `An image called "${slug}" exists or existed before. Image names are never reused (browsers ` +
      `cache them forever). Leave out --slug to get a new name automatically.`
  );
}

// .rotate() bakes the camera's EXIF orientation into the pixels, so the
// reported width/height always match what the browser shows.
const base = sharp(src).rotate();
let width, height;
try {
  ({ width, height } = await base.metadata());
} catch {
  fail(
    "Couldn't read that file as a photo. Use JPG, PNG, TIFF or WebP " +
      "(iPhone HEIC: open it and export as JPG first)."
  );
}
if (!width || !height) fail("Couldn't read that file as an image.");
// metadata() reports pre-rotation size; swap for portrait EXIF orientations.
const meta = await sharp(src).metadata();
const swap = (meta.orientation ?? 1) >= 5;
const w = swap ? height : width;
const h = swap ? width : height;

const outDir = join(IMAGES, client);
mkdirSync(outDir, { recursive: true });
const widths = widthsFor(role, w);
for (const width of widths) {
  await base.clone().resize({ width }).avif(AVIF_OPTS).toFile(join(outDir, `${slug}-${width}.avif`));
  await base.clone().resize({ width }).webp(WEBP_OPTS).toFile(join(outDir, `${slug}-${width}.webp`));
}

// Tiny blur placeholder: 24px WebP, inlined as a data URI.
const blur = await base.clone().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();

manifest[slug] = {
  shoot: client,
  role,
  width: w,
  height: h,
  aspect: Number((w / h).toFixed(4)),
  widths,
  blurDataURI: `data:image/webp;base64,${blur.toString("base64")}`,
};
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

let og = "";
if (args.lead) og = (await writeOgCard(src)).replace(ROOT + "/", "");

console.log(`
✓ Imported "${slug}" (${w}×${h}) → public/images/${client}/ (${widths.length} sizes × AVIF + WebP)
${og ? `✓ Share card → ${og}\n` : ""}
Next: reference it in src/content/clients/${client}.yaml, e.g.
${
  args.lead
    ? `
lead:
  image: ${slug}
  alt: "<describe what the photo shows>"`
    : `
frames:
  - image: ${slug}
    alt: "<describe what the photo shows>"`
}

Then run: npx pnpm check
`);
