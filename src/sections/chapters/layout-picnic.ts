import type { ChapterBuilder } from "./chapters";
import { registerChapterLayout } from "./chapters";
import { buildPicture } from "../../shared/ui/picture";
import { revealClip } from "../../shared/motion/reveals";
import { sceneProgress, seg } from "./scene";

/**
 * Layout 04 — "picnic" (Mamola · نُزهَة).
 *
 * The first light-palette break. The header owns the top-left; the pool
 * lead frame floats in the open right half; and a single band of tilted
 * frames drifts along the bottom like photos sliding across a picnic
 * blanket as you scroll.
 */
const buildPicnic: ChapterBuilder = ({ ctx, campaign, stage, wrapper }) => {
  const canvas = document.createElement("div");
  canvas.className = "chapter__canvas picnic";

  // The poolside anchor, floating in the right half beside the header.
  const lead = document.createElement("div");
  lead.className = "picnic__lead";
  lead.appendChild(buildPicture(campaign.images.lead, { sizes: "(min-width: 900px) 30vw, 60vw" }));
  revealClip(ctx, lead);

  // One long drift band along the bottom — all six frames, tossed tilts.
  const band = document.createElement("div");
  band.className = "picnic__band";
  for (const [i, slug] of campaign.images.frames.entries()) {
    const card = document.createElement("div");
    card.className = "picnic__card";
    // Tossed-on-the-blanket resting tilt, alternating direction.
    card.style.rotate = `${(i % 2 === 0 ? 1 : -1) * (1.2 + (i % 3) * 0.6)}deg`;
    card.appendChild(buildPicture(slug, { sizes: "(min-width: 900px) 16vw, 40vw" }));
    revealClip(ctx, card, i * 0.07);
    band.appendChild(card);
  }

  canvas.append(band, lead);
  stage.appendChild(canvas);

  if (ctx.reducedMotion) return; // static scatter, everything visible

  sceneProgress(wrapper, (p) => {
    const travel = seg(p, 0.05, 0.95);
    // The band slides left just enough to tour every frame.
    const distance = Math.max(0, band.scrollWidth - band.clientWidth);
    band.style.transform = `translateX(${-distance * travel}px)`;
    // The lead bobs gently — pool-float physics, not a hard parallax.
    lead.style.transform = `translateY(${Math.sin(travel * Math.PI) * -28}px)`;
  });
};

registerChapterLayout("picnic", buildPicnic);
