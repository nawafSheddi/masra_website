/**
 * media:remove — delete an imported photo that nothing uses anymore.
 *
 *   npx pnpm media:remove mamola-photo-3
 *
 * Refuses (and says where) if any content file still references the image,
 * so the site can never end up pointing at a missing photo. Removes the
 * optimized files from public/images/<client>/ and the manifest entry, and
 * records the name in src/generated/retired-images.json so it is never
 * reused.
 */
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { derivativeFiles, parseArgs } from "./lib/media-core.mjs";
import { acquireMediaLock } from "./lib/media-lock.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, "src", "generated", "image-manifest.json");
const RETIRED = join(ROOT, "src", "generated", "retired-images.json");
const CONTENT = join(ROOT, "src", "content");

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const slug = parseArgs(process.argv.slice(2))._[0];
if (!slug) fail("Pass the image name, e.g. npx pnpm media:remove mamola-photo-3");

acquireMediaLock(join(ROOT, "src", "generated", ".media.lock"));
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const entry = manifest[slug];
if (!entry) fail(`No image called "${slug}" in src/generated/image-manifest.json.`);

// Is it still used? Scan every content file and the site copy.
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) walk(p);
    else if (/\.(ya?ml|md|json)$/.test(name.name)) files.push(p);
  }
})(CONTENT);
files.push(join(ROOT, "src", "config", "strings.ts"));
const pattern = new RegExp(`(^|[^a-z0-9-])${slug}([^a-z0-9-]|$)`, "m");
const users = files.filter((f) => pattern.test(readFileSync(f, "utf8")));
if (users.length) {
  fail(`"${slug}" is still used in:\n  ${users.map((f) => f.replace(ROOT + "/", "")).join("\n  ")}\nRemove it there first.`);
}

for (const file of derivativeFiles(slug, entry)) {
  const p = join(ROOT, "public", "images", entry.shoot, file);
  if (existsSync(p)) rmSync(p);
}
delete manifest[slug];
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
// Remember the name forever so media:add never hands it out again (the
// old photo stays cached under that URL for up to a year).
const retired = existsSync(RETIRED) ? JSON.parse(readFileSync(RETIRED, "utf8")) : [];
if (!retired.includes(slug)) retired.push(slug);
writeFileSync(RETIRED, JSON.stringify(retired.sort(), null, 2) + "\n");
console.log(`✓ Removed "${slug}" (files + manifest entry).`);
