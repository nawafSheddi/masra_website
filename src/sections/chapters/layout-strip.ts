import type { ChapterBuilder } from "./chapters";
import { registerChapterLayout } from "./chapters";
import { buildPicture } from "../../shared/ui/picture";
import { strings } from "../../config/strings";
import { chapterMotion } from "../../config/motion.config";
import { sceneProgress, seg } from "./scene";

/**
 * Layout 02 — "strip" (IDMI · Roast).
 *
 * The v1 film-strip, ported to the chapter system: five frames ride a
 * horizontal track translated by scroll progress while each image
 * counter-drifts inside its mask (parallax within parallax — the "window
 * seat" effect). Distance is measured at call time so resizes stay honest
 * without a rebuild.
 */
const buildStrip: ChapterBuilder = ({ ctx, campaign, copy, stage, wrapper }) => {
  const canvas = document.createElement("div");
  canvas.className = "chapter__canvas strip";

  const track = document.createElement("div");
  track.className = "strip__track";

  const innerImgs: HTMLImageElement[] = [];
  for (const slug of campaign.images.frames) {
    const frame = document.createElement("div");
    frame.className = "strip__frame";
    const pic = buildPicture(slug, { sizes: "(min-width: 900px) 34vw, 70vw" });
    frame.appendChild(pic);
    const img = pic.querySelector("img");
    if (img) innerImgs.push(img);
    track.appendChild(frame);
  }
  canvas.appendChild(track);

  // "Drag through the roast" — mono caption under the strip.
  const label = document.createElement("p");
  label.className = "eyebrow strip__label";
  label.textContent = (copy as { stripLabel?: string }).stripLabel ?? strings.chapters.idmi.stripLabel;
  canvas.appendChild(label);

  stage.appendChild(canvas);

  if (ctx.reducedMotion) return; // CSS lets the track wrap into a static grid? No — it overflow-scrolls natively.

  sceneProgress(wrapper, (p) => {
    // Measure live: honest across resizes, cheap (layout is already done).
    const distance = Math.max(0, track.scrollWidth - track.clientWidth);
    const travel = seg(p, 0.08, 0.95);
    track.style.transform = `translateX(${-distance * travel}px)`;
    // Counter-drift: images slide gently against the travel direction.
    const counter = chapterMotion.driftShift * 100 * travel;
    for (const img of innerImgs) img.style.transform = `translateX(${-counter}%) scale(1.12)`;
  });
};

registerChapterLayout("strip", buildStrip);
