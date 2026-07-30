import type { MotionContext } from "../../shared/motion/motion-context";
import { parallaxWindow, revealClip } from "../../shared/motion/reveals";
import { buildPicture } from "../../shared/ui/picture";
import { strings } from "../../config/strings";
import { imageRoles } from "../../config/site.config";
import { staggers } from "../../config/motion.config";
import { buildCaseHeader } from "./case-header";

/**
 * Case 01 — PETI. Vertical editorial:
 *   - 90svh full-bleed lead inside a parallax window (image drifts + settles)
 *   - offset two-column grid with staggered clip-path reveals
 *   - wide landscape closer
 */
export function buildCasePeti(ctx: MotionContext): HTMLElement {
  const article = document.createElement("article");
  article.className = "case-peti";

  article.appendChild(buildCaseHeader(ctx, strings.work.cases.peti));

  // Full-bleed parallax lead.
  const lead = document.createElement("div");
  lead.className = "case-peti__lead";
  lead.dataset.cursor = "view";
  const leadPic = buildPicture(imageRoles.peti.lead, { sizes: "100vw" });
  lead.appendChild(leadPic);
  article.appendChild(lead);

  // Offset grid: right column drops lower (editorial rhythm).
  const grid = document.createElement("div");
  grid.className = "case-peti__grid container";
  imageRoles.peti.grid.forEach((slug, i) => {
    const tile = document.createElement("div");
    tile.dataset.cursor = "view";
    tile.appendChild(buildPicture(slug, { sizes: "(min-width: 768px) 45vw, 90vw" }));
    grid.appendChild(tile);
    revealClip(ctx, tile, i * staggers.items);
  });
  article.appendChild(grid);

  // Wide closer.
  const wide = document.createElement("div");
  wide.className = "case-peti__wide container";
  wide.dataset.cursor = "view";
  wide.appendChild(buildPicture(imageRoles.peti.wide, { sizes: "90vw" }));
  article.appendChild(wide);
  revealClip(ctx, wide);

  // Lead parallax: the inner picture drifts inside the clipped window.
  parallaxWindow(ctx, lead, leadPic);

  return article;
}
