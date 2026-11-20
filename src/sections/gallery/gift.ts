import type { MotionContext } from "../../shared/motion/motion-context";
import { revealClip } from "../../shared/motion/reveals";
import { sceneProgress, seg } from "./scene";

/**
 * "gift" motion (Riyadh · Golden). Slow, widely spaced reveals and one
 * quiet move: the lead eases up a few pixels as the room settles. The
 * palette does the work.
 */
export function initGift(stage: HTMLElement, wrapper: HTMLElement, ctx: MotionContext): void {
  const lead = stage.querySelector<HTMLElement>(".gift__lead")!;
  const cells = Array.from(stage.querySelectorAll<HTMLElement>(".gift__cell"));

  revealClip(ctx, lead);
  // Half the usual stagger tempo.
  cells.forEach((cell, i) => revealClip(ctx, cell, 0.2 + i * 0.16));
  if (ctx.reducedMotion) return;

  sceneProgress(wrapper, (p) => {
    lead.style.transform = `translateY(${(1 - seg(p, 0, 0.6)) * 18}px)`;
  });
}
