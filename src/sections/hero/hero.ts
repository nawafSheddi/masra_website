import { animate, scroll } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealChars } from "../../shared/motion/reveals";
import { durations, eases, scrollRanges } from "../../config/motion.config";

/**
 * Hero — the opening frame.
 *
 * "MASRA / STUDIO" at ~17vw with a portrait PETI film-still z-sandwiched
 * between the two lines. Entrance chains off the preloader: characters
 * spring up from line masks while the panel clip-reveals with an inner zoom.
 * On scroll-out the panel settles (scale → 1) and the type lifts away —
 * the site's first "camera move".
 *
 * Returns a promise for the hero image decode (the preloader gates on it)
 * and the entrance function main.ts calls as the curtain lifts.
 */
export function initHero(section: HTMLElement, ctx: MotionContext): { imageReady: Promise<unknown>; enter: () => void } {
  // Elements rendered by Hero.astro.
  const eyebrow = section.querySelector<HTMLElement>(".hero__eyebrow")!;
  const line1 = section.querySelector<HTMLElement>(".hero__line--back")!;
  const line2 = section.querySelector<HTMLElement>(".hero__line--front")!;
  const panel = section.querySelector<HTMLElement>(".hero__panel")!;
  const picture = panel.querySelector("picture")!;
  const tagline = section.querySelector<HTMLElement>(".hero__tagline")!;
  const cue = section.querySelector<HTMLElement>(".hero__scroll-cue")!;

  // Promise the preloader gates on: hero pixels decoded (or errored — never block).
  const img = picture.querySelector("img")!;
  const imageReady = img.decode().catch(() => undefined);

  /** Entrance choreography — called by main.ts as the preloader curtain lifts. */
  function enter(): void {
    if (ctx.reducedMotion) return;

    // Type: per-character spring rise inside line masks, line 2 slightly later.
    revealChars(ctx, line1, { immediate: true });
    revealChars(ctx, line2, { immediate: true, delay: 0.12 });

    // Panel: clip-wipe up + inner image zooming from 1.35 to its resting 1.15
    // (the remaining 1.15 → 1 settle happens on scroll, below).
    panel.style.clipPath = "inset(100% 0 0 0)";
    animate(
      panel,
      { clipPath: ["inset(100% 0 0 0)", "inset(0% 0 0 0)"] },
      { duration: durations.slow, delay: 0.15, ease: eases.outExpo }
    );
    animate(
      img,
      { scale: [1.35, scrollRanges.heroSettleScale] },
      { duration: durations.slow * 1.5, delay: 0.15, ease: eases.outExpo }
    );

    // Supporting copy rises after the type lands.
    revealBlock(ctx, eyebrow, { immediate: true, delay: 0.5 });
    revealBlock(ctx, tagline, { immediate: true, delay: 0.6 });
    revealBlock(ctx, cue, { immediate: true, delay: 0.7 });

    // Scroll-out camera move: image settles to scale 1, type lifts away,
    // scroll cue fades within the first fifth of the exit.
    // NOTE: the lift animates each LINE, never the .hero__type wrapper — a
    // transform on the wrapper would spawn a stacking context and trap the
    // front line beneath the image panel (breaking the z-sandwich).
    scroll(
      animate(img, { scale: [scrollRanges.heroSettleScale, 1] }, { ease: "linear" }),
      { target: section, offset: ["start start", "end start"] }
    );
    scroll(
      animate([line1, line2], { y: [0, -scrollRanges.heroTypeLift] }, { ease: "linear" }),
      { target: section, offset: ["start start", "end start"] }
    );
    scroll(
      animate(cue, { opacity: [1, 0] }, { ease: "linear" }),
      { target: section, offset: ["start start", "20% start"] }
    );
  }

  return { imageReady, enter };
}
