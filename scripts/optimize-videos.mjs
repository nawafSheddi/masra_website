/**
 * MASRA video pipeline (v2).
 *
 * Turns the raw stop-motion .m4v clips from ./assets into web deliverables:
 *
 *   1. LOOPS — short muted autoplay loops for the Shaya chapter.
 *      Each loop ships as AV1/WebM (primary, ~half the bytes) + H.264/MP4
 *      (universal fallback) + an AVIF/WebP poster of its first frame so the
 *      layout is stable before playback starts (CLS = 0).
 *
 *   2. SEQUENCE — one clip exported as a WebP frame sequence that the site
 *      scrubs on a <canvas> driven by scroll progress. Frame-stepping IS the
 *      stop-motion aesthetic, so a stepped scrub looks intentional — and it
 *      sidesteps <video> keyframe-seek jank entirely (Firefox needs a
 *      keyframe every ~2 frames for smooth video scrubbing; -g 1 encodes
 *      balloon file sizes).
 *
 * Everything lands in public/video/shaya (loops) and
 * public/images/shaya/seq (sequence frames), plus a manifest at
 * src/generated/video-manifest.json the site consumes at build time.
 *
 * Usage:  npm run videos          (skips outputs newer than their source)
 *         npm run videos -- --force   (rebuild everything)
 *
 * Requires ffmpeg + ffprobe on PATH. All child processes use argument
 * arrays (execFileSync), so the source paths containing spaces and "&"
 * ("Photos& Stop Motion- Edit 1") need no shell quoting.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "assets");
const VIDEO_OUT = join(ROOT, "public", "video", "shaya");
const SEQ_OUT = join(ROOT, "public", "images", "shaya", "seq");
const MANIFEST_PATH = join(ROOT, "src", "generated", "video-manifest.json");
const FORCE = process.argv.includes("--force");

/**
 * Curation manifest — the ONLY place mapping raw clips to site video.
 * Chosen from the 7 raw stop-motion clips (the other 4 are alternate edits
 * of the same scenes): the candle-pour and the loose-tea circle as ambient
 * loops, and the longest clip (lemon box + cups, 2.83s) as the scrub
 * sequence centerpiece.
 */
const LOOPS = [
  { src: "shaya/01/Stop Motion/Untitled Project-2.m4v", id: "shaya-loop-1" }, // candle + teapot pour
  { src: "shaya/01/Stop Motion/Untitled Project -3.m4v", id: "shaya-loop-2" }, // loose-tea circle
];
const SEQUENCE = {
  src: "shaya/01/Stop Motion/Untitled Project -4.m4v", // lemon tea box, top-down
  id: "shaya",
  fps: 24,     // 60fps source → 24fps keeps the stop-motion cadence, 60% fewer frames
  width: 880,  // canvas display width budget; height follows aspect
};

/** Loops downscale to 720w — plenty for in-layout accents, tiny files. */
const LOOP_WIDTH = 720;
const LOOP_FPS = 30;

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
}

function ffprobe(srcPath) {
  const out = execFileSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height,duration",
    "-of", "csv=p=0", srcPath,
  ]).toString().trim();
  const [width, height, duration] = out.split(",").map(Number);
  return { width, height, duration };
}

/** True when the output already exists and is newer than its source. */
function isFresh(outPath, srcPath) {
  if (FORCE || !existsSync(outPath)) return false;
  return statSync(outPath).mtimeMs >= statSync(srcPath).mtimeMs;
}

/** Even-dimension scale filter: H.264 yuv420p requires even width/height. */
const scaleFilter = (w, fps) => `scale=${w}:-2:flags=lanczos,fps=${fps}`;

async function processLoop({ src, id }) {
  const srcPath = join(SRC_DIR, src);
  if (!existsSync(srcPath)) throw new Error(`Missing source: ${src}`);
  mkdirSync(VIDEO_OUT, { recursive: true });

  const webmOut = join(VIDEO_OUT, `${id}.webm`);
  const mp4Out = join(VIDEO_OUT, `${id}.mp4`);
  const vf = scaleFilter(LOOP_WIDTH, LOOP_FPS);

  // AV1 primary: -an strips audio (loops are always muted).
  if (!isFresh(webmOut, srcPath)) {
    ffmpeg(["-i", srcPath, "-an", "-vf", vf, "-c:v", "libsvtav1", "-crf", "44", "-preset", "6", webmOut]);
  }
  // H.264 fallback: +faststart moves the moov atom up for instant playback.
  if (!isFresh(mp4Out, srcPath)) {
    ffmpeg(["-i", srcPath, "-an", "-vf", vf, "-c:v", "libx264", "-crf", "26", "-preset", "slow",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4Out]);
  }

  // Poster: first frame → AVIF + WebP via sharp (same formats as photos).
  const posterPng = join(tmpdir(), `${id}-poster.png`);
  const posterAvif = join(VIDEO_OUT, `${id}-poster.avif`);
  const posterWebp = join(VIDEO_OUT, `${id}-poster.webp`);
  if (!isFresh(posterWebp, srcPath)) {
    ffmpeg(["-i", srcPath, "-frames:v", "1", "-vf", scaleFilter(960, LOOP_FPS), posterPng]);
    await sharp(posterPng).avif({ quality: 50 }).toFile(posterAvif);
    await sharp(posterPng).webp({ quality: 74 }).toFile(posterWebp);
    rmSync(posterPng, { force: true });
  }

  const { width, height, duration } = ffprobe(srcPath);
  // Output dims after the scale filter (height rounded down to even).
  const outW = LOOP_WIDTH;
  const outH = 2 * Math.floor((height * (LOOP_WIDTH / width)) / 2);
  const kb = (p) => Math.round(statSync(p).size / 1024);
  console.log(`  ${id}  ${outW}×${outH}  ${duration.toFixed(2)}s  webm ${kb(webmOut)}KB  mp4 ${kb(mp4Out)}KB`);

  return [id, {
    sources: [
      { src: `/video/shaya/${id}.webm`, type: "video/webm" },
      { src: `/video/shaya/${id}.mp4`, type: "video/mp4" },
    ],
    poster: { avif: `/video/shaya/${id}-poster.avif`, webp: `/video/shaya/${id}-poster.webp` },
    width: outW,
    height: outH,
    aspect: Number((outW / outH).toFixed(4)),
    duration: Number(duration.toFixed(2)),
  }];
}

async function processSequence({ src, id, fps, width }) {
  const srcPath = join(SRC_DIR, src);
  if (!existsSync(srcPath)) throw new Error(`Missing source: ${src}`);
  mkdirSync(SEQ_OUT, { recursive: true });

  const probe = ffprobe(srcPath);
  const outW = width;
  const outH = 2 * Math.floor((probe.height * (width / probe.width)) / 2);

  // Skip when frames exist and are newer than the source (frame 1 as proxy).
  const firstFrame = join(SEQ_OUT, "f-001.webp");
  let frameCount;
  if (isFresh(firstFrame, srcPath)) {
    frameCount = readdirSync(SEQ_OUT).filter((f) => /^f-\d{3}\.webp$/.test(f)).length;
    console.log(`  ${id}-seq  fresh (${frameCount} frames)`);
  } else {
    // Extract PNG frames to a temp dir, then WebP-encode via sharp.
    // WebP over AVIF here on purpose: the scrub decodes dozens of frames
    // per scroll and WebP decode is meaningfully faster.
    const tmp = mkdtempSync(join(tmpdir(), "masra-seq-"));
    ffmpeg(["-i", srcPath, "-vf", scaleFilter(width, fps), join(tmp, "f-%03d.png")]);
    const frames = readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
    for (const f of frames) {
      await sharp(join(tmp, f)).webp({ quality: 55 }).toFile(join(SEQ_OUT, f.replace(".png", ".webp")));
    }
    rmSync(tmp, { recursive: true, force: true });
    frameCount = frames.length;
    const totalKb = Math.round(
      readdirSync(SEQ_OUT).reduce((s, f) => s + statSync(join(SEQ_OUT, f)).size, 0) / 1024
    );
    console.log(`  ${id}-seq  ${outW}×${outH}  ${frameCount} frames @ ${fps}fps  total ${totalKb}KB`);
  }

  return [id, {
    dir: "/images/shaya/seq",
    pattern: "f-%03d.webp", // 1-based, zero-padded to 3 digits
    frameCount,
    width: outW,
    height: outH,
    aspect: Number((outW / outH).toFixed(4)),
  }];
}

const started = Date.now();
console.log(`Optimizing ${LOOPS.length} loops + 1 sequence → public/video, public/images/shaya/seq\n`);

const loops = [];
for (const loop of LOOPS) loops.push(await processLoop(loop));
const sequences = [await processSequence(SEQUENCE)];

mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
writeFileSync(MANIFEST_PATH, JSON.stringify({
  loops: Object.fromEntries(loops),
  sequences: Object.fromEntries(sequences),
}, null, 2));

console.log(`\nManifest → src/generated/video-manifest.json`);
console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
