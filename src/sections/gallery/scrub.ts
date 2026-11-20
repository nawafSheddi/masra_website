import { inView } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { createFrameSequence } from "../../shared/media/frame-sequence";
import { revealClip } from "../../shared/motion/reveals";
import { initLoops } from "../../shared/ui/video";
import { chapterMotion } from "../../config/motion.config";
import { sceneProgress, seg } from "./scene";

/**
 * "scrub" motion (Shaya · Steeped). The stop-motion canvas maps the runway
 * to its frames, with the film counter ticking alongside; the flanking
 * loops play only near the viewport.
 *
 * Reduced motion: the canvas paints frame 1 as a still, the loops keep
 * their posters, and the counter stays put.
 */
export function initScrub(stage: HTMLElement, wrapper: HTMLElement, ctx: MotionContext): void {
  const center = stage.querySelector<HTMLElement>(".scrub__center")!;
  const counter = center.querySelector<HTMLElement>(".scrub__counter")!;
  const hint = center.querySelector<HTMLElement>(".scrub__hint")!;
  const prefix = center.dataset.prefix ?? "";

  // The canvas goes first in the center column, above counter + hint.
  const seq = createFrameSequence(center.dataset.sequence as "shaya");
  seq.el.setAttribute("role", "img");
  seq.el.setAttribute("aria-label", center.dataset.sequenceLabel ?? "");
  center.prepend(seq.el);
  const total = String(seq.frameCount).padStart(3, "0");

  stage.querySelectorAll<HTMLElement>(".scrub__still").forEach((still, i) => revealClip(ctx, still, 0.1 + i * 0.1));
  initLoops(stage, ctx);

  // Prefetch the sequence one viewport ahead of arrival — observed on the
  // un-clipped wrapper (palette rule: no clip-path there, ever).
  const pct = chapterMotion.sequencePrefetchMargin * 100;
  inView(wrapper, () => seq.prefetch(), { margin: `${pct}% 0px ${pct}% 0px` });

  if (ctx.reducedMotion) {
    seq.prefetch(); // paints frame 1 as a still once it decodes
    return;
  }

  sceneProgress(wrapper, (p) => {
    // Dead zones at both ends so the scrub starts after the header lands.
    const frame = seq.setProgress(seg(p, 0.12, 0.88));
    if (frame >= 0) counter.textContent = `${prefix} ${String(frame + 1).padStart(3, "0")} / ${total}`;
    // The hint retires once scrubbing begins.
    hint.style.opacity = String(1 - seg(p, 0.1, 0.2));
  });
}
