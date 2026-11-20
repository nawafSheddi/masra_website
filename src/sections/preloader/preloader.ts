import { animate } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { setScrollLocked } from "../../shared/motion/smooth-scroll";
import { durations, eases } from "../../config/motion.config";

/**
 * Preloader — the darkroom curtain.
 *
 * Sequence: 000→100 mono counter + clip-wipe reveal of the "مسرى" wordmark,
 * then a curtain wipe upward once (a) the counter finishes AND (b) the hero
 * image has decoded — with a 3s hard timeout so a slow network can never
 * trap the visitor. Scroll is locked while it is on screen.
 *
 * `opts.skip` bypasses it (section deep links).
 *
 * Returns a promise resolving when the curtain has fully left — the hero
 * entrance chains off it (starting slightly before it finishes, for overlap).
 */
export function runPreloader(
  ctx: MotionContext,
  heroImageReady: Promise<unknown>,
  opts: { skip?: boolean } = {}
): Promise<void> {
  // v3: deep links into a section (e.g. "/#work" from a client page's nav)
  // skip the curtain entirely — the visitor asked for specific content.
  if (opts.skip) {
    document.querySelector(".preloader")?.remove();
    return Promise.resolve();
  }

  // Elements rendered by Preloader.astro.
  const el = document.querySelector<HTMLElement>(".preloader");
  if (!el) return Promise.resolve();
  const wordmark = el.querySelector<HTMLImageElement>(".preloader__wordmark")!;
  const [counter, counterMirror] = Array.from(el.querySelectorAll<HTMLElement>(".preloader__counter"));
  // The wordmark is held invisible by the CSS motion gate until now.
  wordmark.removeAttribute("data-reveal");

  setScrollLocked(true);

  // Reduced motion: a quiet 300ms beat, no counter theater.
  if (ctx.reducedMotion) {
    return new Promise((resolve) => {
      setTimeout(() => {
        el.remove();
        setScrollLocked(false);
        resolve();
      }, 300);
    });
  }

  // Wordmark: clip-wipe up as ONE block (Arabic is never char-split).
  wordmark.style.clipPath = "inset(0 0 100% 0)";
  animate(
    wordmark,
    { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"], y: [24, 0] },
    { duration: durations.slow, ease: eases.outExpo }
  );

  // Counter: 000 → 100 over the counter duration.
  const counterDone = animate(0, 100, {
    duration: durations.counter,
    ease: "circOut",
    onUpdate: (v) => {
      counter.textContent = String(Math.round(v)).padStart(3, "0");
      counterMirror.textContent = String(Math.round(100 - v)).padStart(3, "0");
    },
  });

  // Exit gate: counter + hero image, but never wait longer than 3s.
  const timeout = new Promise((r) => setTimeout(r, 3000));
  const ready = Promise.race([Promise.all([counterDone, heroImageReady]), timeout]);

  return ready.then(
    () =>
      new Promise<void>((resolve) => {
        // Exit tint: the curtain flushes to chapter 01's crimson right
        // before it lifts — the palette system's opening line.
        el.classList.add("preloader--exit");
        // Curtain wipe: the whole overlay clips away upward like a shutter.
        const wipe = animate(
          el,
          { clipPath: ["inset(0 0 0 0)", "inset(0 0 100% 0)"] },
          { duration: durations.wipe, ease: eases.inOutCine }
        );
        // Hand off to the hero entrance at ~60% of the wipe so the type
        // rises while the curtain is still clearing (cinematic overlap).
        setTimeout(() => resolve(), durations.wipe * 600);
        wipe.then(() => {
          el.remove();
          setScrollLocked(false);
        });
      })
  );
}
