import { animate, scroll } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealChars } from "../../shared/motion/reveals";
import { buildPicture } from "../../shared/ui/picture";
import { strings } from "../../config/strings";
import { imageRoles } from "../../config/site.config";
import { durations, eases, scrollRanges } from "../../config/motion.config";
import "./hero.css";

/**
 * Hero — the opening frame.
 *
 * "MASRA / STUDIO" at ~17vw with a portrait PETI film-still z-sandwiched
 * between the two lines. Entrance chains off the preloader: characters
 * spring up from line masks while the panel clip-reveals with an inner zoom.
 * On scroll-out the panel settles (scale → 1) and the type lifts away —
 * the site's first "camera move".
 *
 * Returns the hero image element so the preloader can gate on its decode.
 */
export function initHero(root: HTMLElement, ctx: MotionContext): { imageReady: Promise<unknown>; enter: () => void } {
  const section = document.createElement("section");
  section.className = "hero";
  section.id = "hero";

  // Mono eyebrow — studio locator line.
  const eyebrow = document.createElement("p");
  eyebrow.className = "hero__eyebrow eyebrow";
  eyebrow.textContent = strings.hero.eyebrow;

  // The two display lines. Back line renders behind the image panel,
  // front line paints over it (z-sandwich).
  const type = document.createElement("h1");
  type.className = "hero__type display";
  const line1 = document.createElement("span");
  line1.className = "hero__line hero__line--back";
  line1.textContent = strings.hero.line1;
  const line2 = document.createElement("span");
  line2.className = "hero__line hero__line--front";
  line2.textContent = strings.hero.line2;
  type.append(line1, line2);

  // Portrait film-still panel (LCP image — eager + high priority).
  const panel = document.createElement("div");
  panel.className = "hero__panel";
  const picture = buildPicture(imageRoles.hero.panel, {
    sizes: "(min-width: 768px) 38vw, 70vw",
    eager: true,
  });
  panel.appendChild(picture);

  const tagline = document.createElement("p");
  tagline.className = "hero__tagline";
  tagline.textContent = strings.hero.tagline;

  const cue = document.createElement("p");
  cue.className = "hero__scroll-cue";
  cue.textContent = strings.hero.scrollCue;
  cue.setAttribute("aria-label", strings.a11y.scrollDown);

  section.append(eyebrow, type, panel, tagline, cue);
  root.appendChild(section);

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
    revealBlock(ctx, cue, { immediate: true, delay: 0.8 });

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
