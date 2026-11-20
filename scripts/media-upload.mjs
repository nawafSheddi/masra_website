/**
 * media:upload — copy the site's images and video to a Cloudflare R2 bucket.
 *
 *   npx pnpm media:upload                  (bucket from R2_BUCKET in .env)
 *   npx pnpm media:upload --bucket masra-media
 *   npx pnpm media:upload --dry-run        (list what would be uploaded)
 *   npx pnpm media:upload --only images/mamola   (just one folder)
 *
 * Uploads every file under public/images and public/video to the same path
 * in the bucket (images/peti/peti-lead-960.avif → <bucket>/images/peti/…),
 * with the same cache rules as the site (public/_headers). Uses wrangler,
 * so log in once first: npx wrangler login
 *
 * Then point the site at the bucket's custom domain by setting
 * PUBLIC_MEDIA_BASE_URL at build time — full steps in
 * docs/guides/move-images-to-r2.md.
 */
import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib/media-core.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

// .env is optional (it holds R2_BUCKET; never committed).
try {
  process.loadEnvFile(join(ROOT, ".env"));
} catch {
  /* no .env — fine */
}

const args = parseArgs(process.argv.slice(2));
const bucket = typeof args.bucket === "string" ? args.bucket : process.env.R2_BUCKET;
if (!bucket) {
  console.error("\n✗ Which bucket? Pass --bucket <name> or set R2_BUCKET in .env (see .env.example).\n");
  process.exit(1);
}

const TYPES = {
  avif: "image/avif",
  webp: "image/webp",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
};
/** Same policy as public/_headers: replaced-in-place files get one day. */
function cacheControl(key) {
  return /^images\/(clients|og)\//.test(key)
    ? "public, max-age=86400"
    : "public, max-age=31536000, immutable";
}

/** All files under public/images and public/video (optionally one subfolder). */
function listFiles() {
  const roots = typeof args.only === "string" ? [args.only] : ["images", "video"];
  const out = [];
  for (const r of roots) {
    const dir = join(PUBLIC, r);
    if (!existsSync(dir)) continue;
    (function walk(d) {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (!e.name.startsWith(".")) out.push(relative(PUBLIC, p).split("\\").join("/"));
      }
    })(dir);
  }
  return out;
}

/** Upload one file with wrangler; resolves true on success. */
function put(key) {
  const ext = key.split(".").pop() ?? "";
  const cmdArgs = [
    "wrangler", "r2", "object", "put", `${bucket}/${key}`,
    "--file", join(PUBLIC, key),
    "--remote",
    "--cache-control", cacheControl(key),
    ...(TYPES[ext] ? ["--content-type", TYPES[ext]] : []),
  ];
  return new Promise((done) => {
    const child = spawn("npx", ["--no-install", ...cmdArgs], { cwd: ROOT, stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => {
      if (code !== 0) console.error(`  ✗ ${key}\n${err.trim()}`);
      done(code === 0);
    });
  });
}

const files = listFiles();
console.log(`${files.length} files → R2 bucket "${bucket}"${args["dry-run"] ? " (dry run)" : ""}`);
if (args["dry-run"]) {
  for (const f of files) console.log(`  ${f}  [${cacheControl(f)}]`);
  process.exit(0);
}

// A few uploads at a time: fast, without hammering the API.
const CONCURRENCY = 6;
let next = 0;
let ok = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < files.length) {
      const key = files[next++];
      if (await put(key)) ok++;
      if (ok % 50 === 0) console.log(`  ${ok}/${files.length}`);
    }
  })
);
console.log(`\n${ok === files.length ? "✓" : "✗"} Uploaded ${ok}/${files.length} files.`);
process.exit(ok === files.length ? 0 : 1);
