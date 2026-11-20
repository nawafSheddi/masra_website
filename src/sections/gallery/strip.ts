import type { MotionContext } from "../../shared/motion/motion-context";
import { chapterMotion } from "../../config/motion.config";
import { sceneProgress, seg } from "./scene";

/**
 * "strip" motion (IDMI · Roast). The frames ride a horizontal track
 * translated by scroll progress while each image counter-drifts inside its
 * mask (parallax within parallax). Distance is measured live so resizes
 * stay honest. Reduced motion: the track scrolls natively.
 */
export function initStrip(stage: HTMLElement, wrapper: HTMLElement, ctx: MotionContext): void {
  if (ctx.reducedMotion) return;
  const track = stage.querySelector<HTMLElement>(".strip__track")!;
  const innerImgs = Array.from(track.querySelectorAll<HTMLImageElement>("img"));

  sceneProgress(wrapper, (p) => {
    const distance = Math.max(0, track.scrollWidth - track.clientWidth);
    const travel = seg(p, 0.08, 0.95);
    track.style.transform = `translateX(${-distance * travel}px)`;
    // Counter-drift: images slide gently against the travel direction.
    const counter = chapterMotion.driftShift * 100 * travel;
    for (const img of innerImgs) img.style.transform = `translateX(${-counter}%) scale(1.12)`;
  });
}
