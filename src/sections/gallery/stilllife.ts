import { animate } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { scrollRanges } from "../../config/motion.config";
import { sceneProgress, seg } from "./scene";

/**
 * "stilllife" motion (La Bonté · Candlelight). A pinned museum push-in: the
 * centerpiece zooms (1 → 1.25) for the first half of the runway, then
 * cedes the stage to the detail frames rising through it. A soft candle
 * glow breathes over the scene (off under reduced motion — decoration).
 */
export function initStillLife(stage: HTMLElement, wrapper: HTMLElement, ctx: MotionContext): void {
  if (ctx.reducedMotion) return; // static: centerpiece + details, all visible
  const center = stage.querySelector<HTMLElement>(".stilllife__center")!;
  const glow = stage.querySelector<HTMLElement>(".stilllife__glow")!;
  const details = stage.querySelector<HTMLElement>(".stilllife__details")!;
  const cells = Array.from(details.querySelectorAll<HTMLElement>(".stilllife__cell"));
  const centerImg = center.querySelector("img");

  // Candle flicker — a slow breathing loop, deliberately imperfect timing.
  animate(glow, { opacity: [0.35, 0.6, 0.42, 0.65, 0.35] }, { duration: 5.2, repeat: Infinity, ease: "easeInOut" });

  sceneProgress(wrapper, (p) => {
    if (centerImg) {
      const zoom = 1 + (scrollRanges.centerpieceZoom - 1) * seg(p, 0, 0.55);
      centerImg.style.transform = `scale(${zoom})`;
    }
    // Painting dims as the details take over.
    center.style.opacity = String(1 - 0.55 * seg(p, 0.5, 0.85));
    const rise = seg(p, 0.5, 0.9);
    details.style.opacity = String(rise === 0 ? 0 : Math.min(1, rise * 1.6));
    details.style.transform = `translateY(${(1 - rise) * 40}vh)`;
    cells.forEach((cell, i) => {
      // Staggered per-cell lag — later cells trail the group rise.
      const lag = seg(p, 0.52 + i * 0.05, 0.95);
      cell.style.transform = `translateY(${(1 - lag) * 60}px)`;
    });
  });
}
