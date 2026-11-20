import Lenis from "lenis";

/**
 * Lenis smooth scrolling.
 *
 * Lenis lerps the REAL window scroll position (it is not a transform-based
 * fake scroller), which means motion.dev's scroll() / ScrollTimeline keeps
 * reading correct values and stays hardware-accelerated. Touch devices keep
 * native scrolling (syncTouch stays off) — Lenis only smooths wheel input.
 *
 * v3 scroll-feel fix (client feedback: "scrolling is slow on mouse and
 * phone"): the main cause was ~20,000px of pinned chapter scenes on the
 * home page (moved to per-client pages, runways shortened). The second
 * cause was wheel latency: v2 used lerp 0.09 — *below* Lenis' own default
 * of 0.1 — so every wheel tick eased in over many frames. v3 uses 0.15:
 * still smooth, but the page tracks the wheel closely enough to feel
 * native. (Higher lerp = less smoothing; 1 = no smoothing.)
 *
 * Never instantiated when reduced motion is on.
 */

/** Wheel smoothing intensity (0–1). Tune here only. */
const WHEEL_LERP = 0.15;

/** Duration (s) of programmatic jumps (nav links, "back to work"). */
const JUMP_DURATION = 1.1;

let lenis: Lenis | null = null;

export function initSmoothScroll(): Lenis {
  lenis = new Lenis({
    lerp: WHEEL_LERP,
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

/** Smooth-scroll to an element. The fixed-header offset comes from CSS
 *  `scroll-margin-top: var(--header-h)` on anchored sections, which BOTH
 *  Lenis (1.3+ reads it) and native scrollIntoView honour — so no explicit
 *  offset here (passing one too landed headings a full header-height low).
 *  Falls back to an instant native jump when Lenis is absent (reduced
 *  motion). */
export function scrollTo(target: HTMLElement, opts: { immediate?: boolean } = {}): void {
  if (lenis) {
    // Re-measure first: right after boot Lenis may not have observed the
    // JS-built page yet, so its scroll limit is still ~0 and the jump would
    // clamp to the top (deep links like "/#work" silently failed).
    lenis.resize();
    lenis.scrollTo(target, {
      duration: JUMP_DURATION,
      immediate: opts.immediate ?? false,
    });
  } else {
    target.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

/** Jump to an absolute scroll position (restoring the home page's offset
 *  after Back from a client page). Same post-boot `resize()` rule as
 *  scrollTo — the page is JS-built, so Lenis' limit may still be ~0. */
export function scrollToY(y: number): void {
  if (lenis) {
    lenis.resize();
    lenis.scrollTo(y, { immediate: true });
  } else {
    window.scrollTo(0, y);
  }
}

/**
 * Jump to an in-page anchor like "#work". Returns false when no element
 * matches (caller can then let the browser handle the link normally).
 */
export function scrollToHash(hash: string, opts: { immediate?: boolean } = {}): boolean {
  if (!hash || hash === "#") return false;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return false;
  scrollTo(target, opts);
  return true;
}

/** Lock/unlock scrolling (preloader + open mobile menu hold the page still). */
export function setScrollLocked(locked: boolean): void {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
}
