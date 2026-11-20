import Lenis from "lenis";

/**
 * Lenis smooth scrolling.
 *
 * Lenis lerps the REAL window scroll position (it is not a transform-based
 * fake scroller), which means motion.dev's scroll() / ScrollTimeline keeps
 * reading correct values and stays hardware-accelerated. Touch devices keep
 * native scrolling (syncTouch stays off) — Lenis only smooths wheel input.
 *
 * Never instantiated when reduced motion is on.
 */

let lenis: Lenis | null = null;

export function initSmoothScroll(): Lenis {
  lenis = new Lenis({
    // Slightly floatier than default — matches the site's cinematic pacing.
    lerp: 0.09,
    wheelMultiplier: 1,
  });

  // Drive Lenis from rAF; motion.dev animations run on their own loop.
  function raf(time: number) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenis;
}

/** Current scroll velocity (px/frame) — used to modulate marquee speed. */
export function scrollVelocity(): number {
  return lenis?.velocity ?? 0;
}

/** Smooth-scroll to an element (index-table row clicks → chapter). Falls
 *  back to native scrollIntoView when Lenis is absent (reduced motion). */
export function scrollTo(target: HTMLElement): void {
  if (lenis) lenis.scrollTo(target, { duration: 1.4 });
  else target.scrollIntoView({ behavior: "auto", block: "start" });
}

/** Lock/unlock scrolling (preloader holds the page still until its exit). */
export function setScrollLocked(locked: boolean): void {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
}
