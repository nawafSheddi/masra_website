import { inView } from "motion";
import videoManifest from "../../generated/video-manifest.json";
import { strings, type VideoId } from "../../config/strings";
import type { MotionContext } from "../motion/motion-context";

/**
 * Stop-motion loop builder.
 *
 * Emits <video muted loop playsinline preload="none" poster> with AV1/WebM
 * primary + H.264/MP4 fallback sources and explicit dimensions (CLS 0).
 * Playback is viewport-driven: a loop plays only while near the viewport,
 * and a global cap keeps at most MAX_ACTIVE videos decoding at once (the
 * cheapest way to guarantee the page never juggles a dozen decoders).
 *
 * Reduced motion: returns the poster as a plain <picture> — no video
 * element, no fetch, no motion.
 */

const MAX_ACTIVE = 2;
/** Currently-playing loops, oldest first. */
const active: HTMLVideoElement[] = [];

function play(video: HTMLVideoElement): void {
  if (!active.includes(video)) {
    // Cap enforcement: pause the oldest player to make room.
    while (active.length >= MAX_ACTIVE) pause(active[0]);
    active.push(video);
  }
  void video.play().catch(() => {
    /* autoplay rejection (e.g. data-saver) — poster remains, no harm */
  });
}

function pause(video: HTMLVideoElement): void {
  video.pause();
  const i = active.indexOf(video);
  if (i !== -1) active.splice(i, 1);
}

interface LoopEntry {
  sources: { src: string; type: string }[];
  poster: { avif: string; webp: string };
  width: number;
  height: number;
  aspect: number;
  duration: number;
}

/** Poster-only fallback (reduced motion / no-video contexts). */
function buildPoster(entry: LoopEntry, id: VideoId, className: string): HTMLElement {
  const picture = document.createElement("picture");
  picture.className = `pic loop ${className}`.trim();
  const avif = document.createElement("source");
  avif.type = "image/avif";
  avif.srcset = entry.poster.avif;
  const img = document.createElement("img");
  img.src = entry.poster.webp;
  img.alt = strings.videoAlt[id];
  img.width = entry.width;
  img.height = entry.height;
  img.loading = "lazy";
  img.decoding = "async";
  picture.append(avif, img);
  return picture;
}

export function buildLoop(ctx: MotionContext, id: VideoId, className = ""): HTMLElement {
  const entry = (videoManifest.loops as Record<string, LoopEntry>)[id];

  if (ctx.reducedMotion) return buildPoster(entry, id, className);

  const video = document.createElement("video");
  video.className = `loop ${className}`.trim();
  video.muted = true; // property AND attribute — some engines check only one
  video.setAttribute("muted", "");
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.preload = "none"; // no bytes until the chapter approaches
  video.poster = entry.poster.webp;
  video.width = entry.width;
  video.height = entry.height;
  video.setAttribute("aria-label", strings.videoAlt[id]);
  for (const s of entry.sources) {
    const source = document.createElement("source");
    source.src = s.src;
    source.type = s.type;
    video.appendChild(source);
  }

  // Play while near the viewport, fully release the decoder when far away.
  inView(
    video,
    () => {
      play(video);
      return () => pause(video);
    },
    { margin: "25% 0px 25% 0px" }
  );

  return video;
}
