import { scroll } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { revealGroup } from "../../shared/motion/reveals";

/**
 * About — behavior for About.astro.
 *
 * The statement is read by scrolling: each word starts dim and brightens
 * as its slice of the section crosses the viewport — a read-along
 * highlight driven by scroll(), scrubbing both directions. The facts row
 * rises in below it. Reduced motion: words stay fully lit.
 */
export function initAbout(section: HTMLElement, ctx: MotionContext): void {
  const words = Array.from(section.querySelectorAll<HTMLElement>(".about__word"));
  const stats = Array.from(section.querySelectorAll<HTMLElement>(".about__stat"));

  revealGroup(ctx, stats);
  if (ctx.reducedMotion) return;

  // Each word carries a short CSS opacity transition so the wavefront
  // feels liquid.
  for (const word of words) {
    word.style.opacity = "0.45";
    word.style.transition = "opacity 0.25s linear";
  }
  scroll(
    (progress: number) => {
      const lit = Math.floor(progress * words.length);
      words.forEach((word, i) => {
        word.style.opacity = i <= lit ? "1" : "0.45";
      });
    },
    // The sentence is fully lit by the time it sits at the upper third of
    // the viewport.
    { target: section, offset: ["start 0.85", "end 0.75"] }
  );
}
