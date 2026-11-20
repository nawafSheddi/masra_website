import type { ChapterBuilder } from "./chapters";
import { registerChapterLayout } from "./chapters";
import { buildPicture } from "../../shared/ui/picture";
import { revealClip } from "../../shared/motion/reveals";
import { sceneProgress, seg } from "./scene";

/**
 * Layout 06 — "gift" (Riyadh · ذَهَبي).
 *
 * Deliberately the quietest chapter — six frames of kunafa deserve
 * whitespace, not choreography. The sunlit lead sits center on the beige
 * canvas with a slow clip reveal; four detail frames wait in a measured
 * row beneath it. The only scroll motion is a gentle settle on the lead.
 * The palette does the work.
 */
const buildGift: ChapterBuilder = ({ ctx, campaign, stage, wrapper }) => {
  const canvas = document.createElement("div");
  canvas.className = "chapter__canvas gift";

  const lead = document.createElement("div");
  lead.className = "gift__lead";
  lead.appendChild(buildPicture(campaign.images.lead, { sizes: "(min-width: 900px) 34vw, 70vw" }));
  revealClip(ctx, lead);

  const row = document.createElement("div");
  row.className = "gift__row";
  for (const [i, slug] of campaign.images.frames.entries()) {
    const cell = document.createElement("div");
    cell.className = "gift__cell";
    cell.appendChild(buildPicture(slug, { sizes: "(min-width: 900px) 14vw, 40vw" }));
    // Slow, widely-spaced reveals — half the usual stagger tempo.
    revealClip(ctx, cell, 0.2 + i * 0.16);
    row.appendChild(cell);
  }

  canvas.append(lead, row);
  stage.appendChild(canvas);

  if (ctx.reducedMotion) return;

  // One quiet move: the lead eases up a few pixels as the room settles.
  sceneProgress(wrapper, (p) => {
    lead.style.transform = `translateY(${(1 - seg(p, 0, 0.6)) * 18}px)`;
  });
};

registerChapterLayout("gift", buildGift);
