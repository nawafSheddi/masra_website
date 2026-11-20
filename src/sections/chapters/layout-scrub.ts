import { inView } from "motion";
import type { ChapterBuilder } from "./chapters";
import { registerChapterLayout } from "./chapters";
import { buildPicture } from "../../shared/ui/picture";
import { buildLoop } from "../../shared/ui/video";
import { createFrameSequence } from "../../shared/media/frame-sequence";
import { revealClip } from "../../shared/motion/reveals";
import { chapterMotion } from "../../config/motion.config";
import { sceneProgress, seg } from "./scene";

/**
 * Layout 05 — "scrub" (Shaya · Steeped). The centerpiece of the page.
 *
 * A stop-motion clip lives on a <canvas> and plays exactly as fast as you
 * scroll — the 500vh runway maps to 68 frames, with a mono film counter
 * ("F 012 / 068") ticking alongside. Two ambient loops flank the canvas,
 * playing only while near the viewport.
 *
 * Reduced motion: the canvas paints frame 1 as a still, loops become
 * posters (video.ts handles that), and the counter is static.
 */
const buildScrub: ChapterBuilder = ({ ctx, campaign, copy, stage, wrapper }) => {
  const canvas = document.createElement("div");
  canvas.className = "chapter__canvas scrub";

  const scrubCopy = copy as { frameCounterPrefix?: string; scrubHint?: string };

  // --- Center: the scrubbed sequence -----------------------------------
  const seq = createFrameSequence("shaya");
  const center = document.createElement("div");
  center.className = "scrub__center";
  center.appendChild(seq.el);

  // Film counter + hint under the canvas.
  const counter = document.createElement("p");
  counter.className = "eyebrow scrub__counter";
  const total = String(seq.frameCount).padStart(3, "0");
  counter.textContent = `${scrubCopy.frameCounterPrefix ?? "F"} 001 / ${total}`;
  const hint = document.createElement("p");
  hint.className = "eyebrow scrub__hint";
  hint.textContent = scrubCopy.scrubHint ?? "";
  center.append(counter, hint);

  // --- Flanks: ambient loops + stills ----------------------------------
  const loops = campaign.video?.loops ?? [];
  const left = document.createElement("div");
  left.className = "scrub__flank scrub__flank--left";
  if (loops[0]) left.appendChild(buildLoop(ctx, loops[0]));
  const leftStill = document.createElement("div");
  leftStill.className = "scrub__still";
  leftStill.appendChild(buildPicture(campaign.images.frames[0], { sizes: "18vw" }));
  revealClip(ctx, leftStill, 0.1);
  left.appendChild(leftStill);

  const right = document.createElement("div");
  right.className = "scrub__flank scrub__flank--right";
  const rightStill = document.createElement("div");
  rightStill.className = "scrub__still";
  rightStill.appendChild(buildPicture(campaign.images.frames[2], { sizes: "18vw" }));
  revealClip(ctx, rightStill, 0.2);
  right.appendChild(rightStill);
  if (loops[1]) right.appendChild(buildLoop(ctx, loops[1]));

  canvas.append(left, center, right);
  stage.appendChild(canvas);

  // Prefetch the sequence one viewport ahead of arrival — observed on the
  // un-clipped wrapper (palette-IO discipline: no clip-path there, ever).
  inView(wrapper, () => seq.prefetch(), {
    margin: `${chapterMotion.sequencePrefetchMargin * 100}% 0px ${chapterMotion.sequencePrefetchMargin * 100}% 0px`,
  });

  if (ctx.reducedMotion) {
    seq.prefetch(); // paints frame 1 as a still once it decodes
    return;
  }

  sceneProgress(wrapper, (p) => {
    // Dead zones at both ends so the scrub starts after the header lands.
    const frame = seq.setProgress(seg(p, 0.12, 0.88));
    if (frame >= 0) {
      counter.textContent = `${scrubCopy.frameCounterPrefix ?? "F"} ${String(frame + 1).padStart(3, "0")} / ${total}`;
    }
    // The hint retires once scrubbing begins.
    hint.style.opacity = String(1 - seg(p, 0.1, 0.2));
  });
};

registerChapterLayout("scrub", buildScrub);
