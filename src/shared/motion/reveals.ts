import { animate, inView, scroll, spring, stagger } from "motion";
import type { MotionContext } from "./motion-context";
import { durations, eases, scrollRanges, springs, staggers } from "../../config/motion.config";
import { splitChars, splitWords } from "./split";

/**
 * Reusable reveal patterns — the shared choreography vocabulary.
 * Every section composes these instead of hand-rolling animate() calls, so
 * the whole page shares one motion language (and one reduced-motion gate).
 *
 * Pattern: elements are visible in authored CSS; each helper sets the
 * hidden "from" state via inline style ONLY when it is actually going to
 * animate (ctx.reducedMotion false). No-JS and reduced-motion users never
 * see hidden content.
 */

/** Clip-path curtain reveal (bottom-up) with an inner counter-zoom.
 *  Used by every image tile on the site.
 *
 *  IMPORTANT: the clip is applied to the element's INNER child while the
 *  outer element is what inView observes. Clipping the observed element
 *  itself would zero its IntersectionObserver area (Chromium factors an
 *  element's own clip-path into intersection) and the reveal would
 *  deadlock — hidden forever because it can never become "visible". */
export function revealClip(ctx: MotionContext, el: HTMLElement, delay = 0): void {
  if (ctx.reducedMotion) return;

  const target = (el.firstElementChild as HTMLElement | null) ?? el;
  const img = el.querySelector("img");
  target.style.clipPath = "inset(0 0 100% 0)";

  // Same Chromium quirk, second layer: the parent's clip-path also zeroes
  // the img's NATIVE lazy-loading intersection, so a clipped tile would
  // never start fetching its image. Flip to eager while the tile (which is
  // never clipped) is still ~1.5 viewports away, so pixels are ready by
  // the time the curtain opens.
  if (img instanceof HTMLImageElement) {
    inView(el, () => {
      img.loading = "eager";
    }, { margin: "150% 0px 150% 0px" });
  }

  inView(
    el,
    () => {
      animate(
        target,
        { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"] },
        { duration: durations.slow, delay, ease: eases.outExpo }
      );
      if (img instanceof HTMLElement) {
        animate(
          img,
          { scale: [1.25, 1] },
          { duration: durations.slow * 1.4, delay, ease: eases.outExpo }
        );
      }
    },
    { amount: 0.25 }
  );
}

/** Character spring-stagger reveal for display type. Splits the element,
 *  hides the chars, and springs them up from below the line mask when the
 *  element scrolls into view (or immediately when `immediate`). */
export function revealChars(
  ctx: MotionContext,
  el: HTMLElement,
  opts: { immediate?: boolean; delay?: number } = {}
): void {
  if (ctx.reducedMotion) return;

  const { chars } = splitChars(el);
  if (!chars.length) {
    // RTL/Arabic content — animate the whole block instead of chars.
    revealBlock(ctx, el, opts);
    return;
  }

  for (const c of chars) c.style.transform = "translateY(110%)";

  const run = () => {
    animate(
      chars,
      { y: ["110%", "0%"], rotate: [4, 0] },
      {
        type: spring,
        ...springs.type,
        delay: stagger(staggers.chars, { startDelay: opts.delay ?? 0 }),
      }
    );
  };

  if (opts.immediate) run();
  else inView(el, run, { amount: 0.5 });
}

/** Word-level spring-stagger reveal — the ONLY split-reveal allowed on
 *  Arabic display type. Each word stays one intact shaped run (splitting
 *  a connected script by glyph destroys its joined letterforms), so this
 *  is safe for the bilingual chapter titles and any dir="rtl" heading. */
export function revealWords(
  ctx: MotionContext,
  el: HTMLElement,
  opts: { immediate?: boolean; delay?: number } = {}
): void {
  if (ctx.reducedMotion) return;

  const words = splitWords(el);
  if (!words.length) return;

  for (const w of words) {
    w.style.opacity = "0";
    w.style.transform = "translateY(0.55em)";
  }

  const run = () => {
    animate(
      words,
      { opacity: [0, 1], y: ["0.55em", "0em"] },
      {
        type: spring,
        ...springs.type,
        delay: stagger(staggers.items * 0.6, { startDelay: opts.delay ?? 0 }),
      }
    );
  };

  if (opts.immediate) run();
  else inView(el, run, { amount: 0.5 });
}

/** Simple y+opacity rise for blocks (paragraphs, labels, stat rows). */
export function revealBlock(
  ctx: MotionContext,
  el: HTMLElement,
  opts: { immediate?: boolean; delay?: number } = {}
): void {
  if (ctx.reducedMotion) return;

  el.style.opacity = "0";
  el.style.transform = "translateY(24px)";

  const run = () => {
    animate(
      el,
      { opacity: [0, 1], y: [24, 0] },
      { duration: durations.base, delay: opts.delay ?? 0, ease: eases.outExpo }
    );
  };

  if (opts.immediate) run();
  else inView(el, run, { amount: 0.4 });
}

/** Opacity-only fade — the documentary register's entire motion budget.
 *  Deliberately slower and stiller than revealBlock: no translation, no
 *  clip, just photographs surfacing like prints in a developer tray. */
export function revealFade(ctx: MotionContext, el: HTMLElement, delay = 0): void {
  if (ctx.reducedMotion) return;

  el.style.opacity = "0";
  inView(
    el,
    () => {
      animate(el, { opacity: [0, 1] }, { duration: durations.slow * 1.3, delay, ease: "easeOut" });
    },
    { amount: 0.3 }
  );
}

/** Staggered rise for a list of siblings (grid tiles, service rows).
 *  `amount` = fraction of the PARENT that must be visible to trigger.
 *  Default 0.2 suits short lists; tall grids (Work: ~2,000px) need a small
 *  value or their first row sits blank on screen until 400px+ of the grid
 *  is visible. */
export function revealGroup(
  ctx: MotionContext,
  els: HTMLElement[],
  interval: number = staggers.items,
  opts: { amount?: number } = {}
): void {
  if (ctx.reducedMotion || !els.length) return;

  for (const el of els) {
    el.style.opacity = "0";
    el.style.transform = "translateY(32px)";
  }

  inView(
    els[0].parentElement ?? els[0],
    () => {
      animate(
        els,
        { opacity: [0, 1], y: [32, 0] },
        { duration: durations.base, delay: stagger(interval), ease: eases.outExpo }
      );
    },
    { amount: opts.amount ?? 0.2 }
  );
}

/**
 * Parallax window: outer element clips, inner image is taller than the
 * window and drifts vertically as the section crosses the viewport —
 * the classic "camera move" treatment for full-bleed stills.
 * Uses scroll() → ScrollTimeline, hardware-accelerated where supported.
 */
export function parallaxWindow(ctx: MotionContext, outer: HTMLElement, inner: HTMLElement): void {
  if (ctx.reducedMotion) return;

  const shift = scrollRanges.parallaxShift * 100;
  scroll(
    animate(inner, { y: [`-${shift}%`, `${shift}%`] }, { ease: "linear" }),
    { target: outer, offset: ["start end", "end start"] }
  );
}
