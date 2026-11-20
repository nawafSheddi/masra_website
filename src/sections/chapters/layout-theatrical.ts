import type { ChapterBuilder } from "./chapters";
import { registerChapterLayout } from "./chapters";
import { buildPicture } from "../../shared/ui/picture";
import { revealClip } from "../../shared/motion/reveals";
import { sceneProgress, seg } from "./scene";

/**
 * Layout 01 — "theatrical" (PETI · Crimson).
 *
 * The chapter opens like a stage: the lead frame sits center under a
 * radial spotlight vignette that lifts as you scroll (the "house lights"
 * coming up), while the lead settles from 1.15→1 — the same camera-settle
 * language as the hero. Supporting frames drift apart at different rates
 * like set pieces being carried on.
 */
const buildTheatrical: ChapterBuilder = ({ ctx, campaign, stage, wrapper }) => {
  const canvas = document.createElement("div");
  canvas.className = "chapter__canvas theatrical";

  // Center stage: the lead frame with its own overflow mask.
  const lead = document.createElement("div");
  lead.className = "theatrical__lead";
  const leadPic = buildPicture(campaign.images.lead, { sizes: "(min-width: 900px) 40vw, 80vw" });
  lead.appendChild(leadPic);
  revealClip(ctx, lead);

  // Set pieces: three satellite frames around the lead.
  const satellites: HTMLElement[] = [];
  for (const [i, slug] of campaign.images.frames.slice(0, 3).entries()) {
    const sat = document.createElement("div");
    sat.className = `theatrical__sat theatrical__sat--${i + 1}`;
    sat.appendChild(buildPicture(slug, { sizes: "22vw" }));
    revealClip(ctx, sat, 0.1 + i * 0.1);
    satellites.push(sat);
  }

  // Spotlight vignette: darkens everything but a center pool of light.
  // A dedicated overlay child — never on the observed wrapper (clip/paint
  // effects stay off palette-IO targets).
  const vignette = document.createElement("div");
  vignette.className = "theatrical__vignette";
  vignette.setAttribute("aria-hidden", "true");

  canvas.append(...satellites.slice(0, 1), lead, ...satellites.slice(1), vignette);
  stage.appendChild(canvas);

  if (ctx.reducedMotion) return; // static composition stays fully readable

  const leadImg = leadPic.querySelector("img");
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
};

registerChapterLayout("theatrical", buildTheatrical);
