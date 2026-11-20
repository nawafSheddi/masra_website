import { animate } from "motion";
import type { ChapterBuilder } from "./chapters";
import { registerChapterLayout } from "./chapters";
import { buildPicture } from "../../shared/ui/picture";
import { scrollRanges } from "../../config/motion.config";
import { sceneProgress, seg } from "./scene";

/**
 * Layout 03 — "stilllife" (La Bonté · Candlelight).
 *
 * A pinned museum push-in: the baroque centerpiece slowly zooms
 * (1 → 1.25) for the first half of the runway, then cedes the stage to a
 * quartet of detail frames that rise through it. A soft candle-glow
 * breathes over the scene (killed under reduced motion — it's pure
 * decoration).
 */
const buildStillLife: ChapterBuilder = ({ ctx, campaign, stage, wrapper }) => {
  const canvas = document.createElement("div");
  canvas.className = "chapter__canvas stilllife";

  // The pinned painting.
  const center = document.createElement("div");
  center.className = "stilllife__center";
  const centerPic = buildPicture(campaign.images.lead, { sizes: "(min-width: 900px) 62vw, 100vw" });
  center.appendChild(centerPic);

  // Candle glow: breathing warm radial, additively blended.
  const glow = document.createElement("div");
  glow.className = "stilllife__glow";
  glow.setAttribute("aria-hidden", "true");
  center.appendChild(glow);

  // The quartet that rises over the painting in the second half.
  const details = document.createElement("div");
  details.className = "stilllife__details";
  const cells: HTMLElement[] = [];
  for (const slug of campaign.images.frames) {
    const cell = document.createElement("div");
    cell.className = "stilllife__cell";
    cell.appendChild(buildPicture(slug, { sizes: "(min-width: 900px) 22vw, 45vw" }));
    cells.push(cell);
    details.appendChild(cell);
  }

  canvas.append(center, details);
  stage.appendChild(canvas);

  if (ctx.reducedMotion) return; // static: centerpiece + quartet, all visible

  // Candle flicker — a slow breathing loop, deliberately imperfect timing.
  animate(
    glow,
    { opacity: [0.35, 0.6, 0.42, 0.65, 0.35] },
    { duration: 5.2, repeat: Infinity, ease: "easeInOut" }
  );

  const centerImg = centerPic.querySelector("img");
  // The quartet starts below the fold of the stage and rises.
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
};

registerChapterLayout("stilllife", buildStillLife);
