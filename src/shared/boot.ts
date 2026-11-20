/**
 * Shared page boot — everything the home page (main.ts) and the client
 * page (work-main.ts) set up identically, in the order it matters:
 *
 *  1. Global styles + fonts
 *  2. Motion context (reduced-motion decided before anything moves)
 *  3. Lenis smooth scroll (skipped under reduced motion)
 *  4. Skip link, the fixed site header (outside <main> — never a palette
 *     target), and the <main id="main"> landmark sections mount into
 *  5. Custom cursor (desktop pointers only; no-op otherwise)
 *
 * Each entry then mounts its own sections and wires the palette takeover.
 */
import "@fontsource/space-mono";
import "../styles/tokens.css";
import "../styles/base.css";
import "../styles/fonts.css";
import "../styles/chapters.css";

import { createMotionContext, watchReducedMotion, type MotionContext } from "./motion/motion-context";
import { initSmoothScroll } from "./motion/smooth-scroll";
import { initCursor } from "./ui/cursor";
import { initHeader } from "../sections/header/header";
import { strings } from "../config/strings";

export interface BootResult {
  ctx: MotionContext;
  /** The <main> landmark; entries append their sections here. */
  main: HTMLElement;
}

/**
 * Boot the shared shell into #app.
 * @param opts.home true for the home page (header links jump in-page).
 */
export function boot(opts: { home: boolean }): BootResult {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  const ctx = createMotionContext();
  watchReducedMotion();

  if (!ctx.reducedMotion) initSmoothScroll();

  // Accessibility: skip link + semantic main landmark.
  const skip = document.createElement("a");
  skip.className = "skip-link";
  skip.href = "#main";
  skip.textContent = strings.a11y.skipToContent;
  const main = document.createElement("main");
  main.id = "main";
  main.tabIndex = -1; // skip-link / home-link target can receive focus

  // DOM (and tab) order: skip link → header → main.
  app.append(skip);
  initHeader(app, ctx, { home: opts.home });
  app.append(main);

  initCursor(ctx);
  return { ctx, main };
}
