import type { MotionContext } from "../../shared/motion/motion-context";
import { campaigns } from "../../config/campaigns.config";
import { chapterMotion } from "../../config/motion.config";
import { sceneProgress, seg } from "./scene";

/**
 * Between-chapter curtain wipes.
 *
 * As a pinned chapter plays out its final stretch of runway, a soft-arced
 * panel in the NEXT chapter's background color rises from the bottom of
 * the stage — a page-turn beat that pre-announces the coming palette
 * before the body cross-fade lands.
 *
 * Discipline notes:
 *  - The curtain is a CHILD of the stage, never the observed wrapper
 *    (Chromium counts an element's own clip/paint box into its
 *    IntersectionObserver area — decorating the wrapper would deadlock
 *    the palette takeover).
 *  - Colors come from the :root --palette-<id>-bg tokens (chapters.css),
 *    so this module never touches a hex value.
 *  - Purely decorative: aria-hidden, and absent under reduced motion.
 */
export function initCurtains(ctx: MotionContext, section: HTMLElement): void {
  if (ctx.reducedMotion) return; // decorative only — skip entirely

  for (let i = 0; i < campaigns.length; i++) {
    const campaign = campaigns[i];
    // The flowing documentary chapter has no pinned stage to wipe over,
    // and the final chapter hands off to the base palette via the body
    // cross-fade alone.
    if (campaign.layout === "documentary") continue;

    const wrapper = section.querySelector<HTMLElement>(`#chapter-${campaign.id}`);
    const stage = wrapper?.querySelector<HTMLElement>(".chapter__stage");
    if (!wrapper || !stage) continue;

    const next = campaigns[i + 1];
    const curtain = document.createElement("div");
    curtain.className = "curtain";
    curtain.setAttribute("aria-hidden", "true");
    // Next chapter's canvas color — or the base darkroom for the handoff
    // back out of the chapter run.
    curtain.style.background = next
      ? `var(--palette-${next.id}-bg)`
      : "var(--color-bg)";
    stage.appendChild(curtain);

    sceneProgress(wrapper, (p) => {
      // Rise across the final curtainRange fraction of the runway.
      const rise = seg(p, 1 - chapterMotion.curtainRange, 1);
      curtain.style.transform = `translateY(${(1 - rise) * 103}%)`;
    });
  }
}
