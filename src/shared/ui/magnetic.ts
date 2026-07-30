import { animate, spring } from "motion";
import type { MotionContext } from "../motion/motion-context";
import { springs } from "../../config/motion.config";

/**
 * Magnetic hover: the element leans toward the cursor within a small
 * radius and springs back on leave. Used on the big contact links.
 * Desktop-pointer only; a no-op under reduced motion.
 */
export function makeMagnetic(ctx: MotionContext, el: HTMLElement, strength = 12): void {
  if (!ctx.desktopPointer || ctx.reducedMotion) return;

  el.addEventListener("pointermove", (e) => {
    const rect = el.getBoundingClientRect();
    // Normalized offset from element center in [-1, 1].
    const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    animate(
      el,
      { x: nx * strength, y: ny * strength },
      { type: spring, ...springs.magnetic }
    );
  });

  el.addEventListener("pointerleave", () => {
    animate(el, { x: 0, y: 0 }, { type: spring, ...springs.magnetic });
  });
}
