/**
 * Shared page behavior boot — what every page sets up identically, in the
 * order it matters (the markup itself is rendered by BaseLayout.astro):
 *
 *  1. Motion context (reduced motion decided before anything moves)
 *  2. Lenis smooth scroll (skipped under reduced motion)
 *  3. Header behavior (menu, jumps, solid-on-scroll)
 *  4. Custom cursor (desktop pointers only)
 *  5. Blur-up image fades
 *
 * Each page entry (home.ts, client.ts) then wires its own sections.
 */
import { createMotionContext, watchReducedMotion, type MotionContext } from "../shared/motion/motion-context";
import { initSmoothScroll } from "../shared/motion/smooth-scroll";
import { initCursor } from "../shared/ui/cursor";
import { initPictureFades } from "../shared/ui/picture-fade";
import { initHeader } from "../sections/header/header";

export interface BootResult {
  ctx: MotionContext;
  /** The <main> landmark. */
  main: HTMLElement;
}

export function boot(opts: { home: boolean }): BootResult {
  const ctx = createMotionContext();
  watchReducedMotion();
  if (!ctx.reducedMotion) initSmoothScroll();

  initHeader(document.querySelector<HTMLElement>(".site-header")!, ctx, { home: opts.home });
  initCursor(ctx);
  initPictureFades();

  return { ctx, main: document.getElementById("main")! };
}
