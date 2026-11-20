import { inView } from "motion";
import type { MotionContext } from "../motion/motion-context";

/**
 * Loop playback for server-rendered <video data-loop> (shared/ui/Loop.astro).
 *
 * A loop plays only while near the viewport, and a global cap keeps at
 * most MAX_ACTIVE videos decoding at once (the cheapest way to guarantee
 * the page never juggles a dozen decoders). Reduced motion: never plays —
 * the poster stays as a still.
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

export function initLoops(root: ParentNode, ctx: MotionContext): void {
  if (ctx.reducedMotion) return;
  for (const video of root.querySelectorAll<HTMLVideoElement>("video[data-loop]")) {
    video.muted = true; // property AND attribute — some engines check only one
    // Play while near the viewport, release the decoder when far away.
    inView(
      video,
      () => {
        play(video);
        return () => pause(video);
      },
      { margin: "25% 0px 25% 0px" }
    );
  }
}
