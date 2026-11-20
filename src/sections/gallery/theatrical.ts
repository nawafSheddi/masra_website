import type { MotionContext } from "../../shared/motion/motion-context";
import { revealClip } from "../../shared/motion/reveals";
import { sceneProgress, seg } from "./scene";

/**
 * "theatrical" motion (PETI · Crimson). The page opens like a stage: the
 * spotlight vignette lifts as you scroll (house lights coming up), the lead
 * settles from 1.15 → 1 (the hero's camera-settle language), and the
 * set-piece photos drift apart at different rates.
 */
export function initTheatrical(stage: HTMLElement, wrapper: HTMLElement, ctx: MotionContext): void {
  const lead = stage.querySelector<HTMLElement>(".theatrical__lead")!;
  const satellites = Array.from(stage.querySelectorAll<HTMLElement>(".theatrical__sat"));
  const vignette = stage.querySelector<HTMLElement>(".theatrical__vignette")!;

  revealClip(ctx, lead);
  satellites.forEach((sat, i) => revealClip(ctx, sat, 0.1 + i * 0.1));
  if (ctx.reducedMotion) return; // static composition stays fully readable

  const leadImg = lead.querySelector("img");
  sceneProgress(wrapper, (p) => {
    // House lights: spotlight lifts across the first 40% of the runway.
    vignette.style.opacity = String(1 - seg(p, 0, 0.4));
    // Camera settle on the lead.
    if (leadImg) leadImg.style.transform = `scale(${1.15 - 0.15 * seg(p, 0, 0.55)})`;
    // Set pieces drift vertically at alternating rates.
    const drift = seg(p, 0.1, 1);
    satellites.forEach((sat, i) => {
      const dir = i % 2 === 0 ? -1 : 1;
      sat.style.transform = `translateY(${dir * drift * (36 + i * 14)}px)`;
    });
  });
}
