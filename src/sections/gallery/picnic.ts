import type { MotionContext } from "../../shared/motion/motion-context";
import { revealClip } from "../../shared/motion/reveals";
import { sceneProgress, seg } from "./scene";

/**
 * "picnic" motion (Mamola). The band slides left just enough to tour every
 * frame; the lead bobs gently — pool-float physics, not a hard parallax.
 */
export function initPicnic(stage: HTMLElement, wrapper: HTMLElement, ctx: MotionContext): void {
  const lead = stage.querySelector<HTMLElement>(".picnic__lead")!;
  const band = stage.querySelector<HTMLElement>(".picnic__band")!;
  const cards = Array.from(band.querySelectorAll<HTMLElement>(".picnic__card"));

  revealClip(ctx, lead);
  cards.forEach((card, i) => revealClip(ctx, card, i * 0.07));
  if (ctx.reducedMotion) return; // static scatter, everything visible

  sceneProgress(wrapper, (p) => {
    const travel = seg(p, 0.05, 0.95);
    const distance = Math.max(0, band.scrollWidth - band.clientWidth);
    band.style.transform = `translateX(${-distance * travel}px)`;
    lead.style.transform = `translateY(${Math.sin(travel * Math.PI) * -28}px)`;
  });
}
