import { animate } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { setScrollLocked } from "../../shared/motion/smooth-scroll";
import { durations, eases } from "../../config/motion.config";
import { strings } from "../../config/strings";
import "./preloader.css";

/**
 * Preloader — the darkroom curtain.
 *
 * Sequence: 000→100 mono counter + clip-wipe reveal of the "مسرى" wordmark,
 * then a curtain wipe upward once (a) the counter finishes AND (b) the hero
 * image has decoded — with a 3s hard timeout so a slow network can never
 * trap the visitor. Scroll is locked while it is on screen.
 *
 * Returns a promise resolving when the curtain has fully left — the hero
 * entrance chains off it (starting slightly before it finishes, for overlap).
 */
export function runPreloader(ctx: MotionContext, heroImageReady: Promise<unknown>): Promise<void> {
  const el = document.createElement("div");
  el.className = "preloader";
  el.setAttribute("role", "status");
  el.setAttribute("aria-label", strings.a11y.preloaderLabel);

  // Official hand-drawn calligraphic wordmark (brand kit art, never a font).
  const wordmark = document.createElement("img");
  wordmark.className = "preloader__wordmark";
  wordmark.src = "/images/brand/masra-logo-orange.png";
  wordmark.alt = strings.brand.wordmarkEn;
  wordmark.decoding = "async";

  const counter = document.createElement("div");
  counter.className = "preloader__counter";
  counter.textContent = "000";

  el.append(wordmark, counter);
  document.body.appendChild(el);
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
    },
  });

  // Exit gate: counter + hero image, but never wait longer than 3s.
  const timeout = new Promise((r) => setTimeout(r, 3000));
  const ready = Promise.race([Promise.all([counterDone, heroImageReady]), timeout]);

  return ready.then(
    () =>
      new Promise<void>((resolve) => {
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
