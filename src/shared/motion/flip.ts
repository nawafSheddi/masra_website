import { animate } from "motion";
import type { MotionContext } from "./motion-context";
import { chapterMotion, eases } from "../../config/motion.config";

/**
 * FLIP transition helper (First–Last–Invert–Play).
 *
 * For layout swaps that should feel physical instead of teleporting —
 * measure the elements, apply the new layout (the caller's `mutate`),
 * measure again, then animate each element from an inverted transform
 * back to identity. Scale is included so elements that change size
 * morph rather than jump-cut.
 *
 * Reduced motion: runs `mutate` and stops — instant swap.
 */
export function flip(ctx: MotionContext, elements: HTMLElement[], mutate: () => void): void {
  if (ctx.reducedMotion) {
    mutate();
    return;
  }

  // FIRST: capture where everything is.
  const first = elements.map((el) => el.getBoundingClientRect());

  // LAST: apply the new layout.
  mutate();

  // INVERT + PLAY.
  elements.forEach((el, i) => {
    const last = el.getBoundingClientRect();
    const f = first[i];
    if (f.width === 0 || last.width === 0) return; // hidden either side — skip

    const dx = f.left - last.left;
    const dy = f.top - last.top;
    const sx = f.width / last.width;
    const sy = f.height / last.height;
    if (dx === 0 && dy === 0 && sx === 1 && sy === 1) return;

    el.style.transformOrigin = "top left";
    animate(
      el,
      {
        transform: [
          `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
          "translate(0px, 0px) scale(1, 1)",
        ],
      },
      { duration: chapterMotion.flipDuration, ease: eases.outExpo }
    );
  });
}
