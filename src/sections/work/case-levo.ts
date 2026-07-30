import { animate, scroll } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { revealClip } from "../../shared/motion/reveals";
import { buildPicture } from "../../shared/ui/picture";
import { strings } from "../../config/strings";
import { imageRoles } from "../../config/site.config";
import { scrollRanges, staggers } from "../../config/motion.config";
import { buildCaseHeader } from "./case-header";

/**
 * Case 03 — LEVO. The slow centerpiece:
 * the baroque banquet still pins for 200vh while the camera pushes in
 * (scale 1 → 1.25); a translucent title plate crossfades over it at the
 * midpoint. Then a 3-up grid with the shared clip reveal.
 */
export function buildCaseLevo(ctx: MotionContext): HTMLElement {
  const article = document.createElement("article");
  article.className = "case-levo";

  article.appendChild(buildCaseHeader(ctx, strings.work.cases.levo));

  // Pinned centerpiece.
  const pinTrack = document.createElement("div");
  pinTrack.className = "case-levo__pin-track";
  const pin = document.createElement("div");
  pin.className = "case-levo__pin";
  const centerPic = buildPicture(imageRoles.levo.centerpiece, { sizes: "100vw" });
  pin.appendChild(centerPic);

  // Title plate that fades in over the push-in at the halfway mark.
  const plate = document.createElement("div");
  plate.className = "case-levo__plate";
  const plateTitle = document.createElement("p");
  plateTitle.className = "case-levo__plate-title display";
  plateTitle.textContent = strings.work.cases.levo.plateTitle;
  plate.appendChild(plateTitle);
  pin.appendChild(plate);

  pinTrack.appendChild(pin);
  article.appendChild(pinTrack);

  // 3-up grid, middle tile dropped (baroque asymmetry).
  const grid = document.createElement("div");
  grid.className = "case-levo__grid container";
  imageRoles.levo.grid.forEach((slug, i) => {
    const tile = document.createElement("div");
    tile.dataset.cursor = "view";
    tile.appendChild(buildPicture(slug, { sizes: "(min-width: 768px) 30vw, 90vw" }));
    grid.appendChild(tile);
    revealClip(ctx, tile, i * staggers.items);
  });
  article.appendChild(grid);

  if (ctx.reducedMotion) {
    // Static fallback: no pin runway; plate reads as a simple caption.
    pinTrack.style.height = "auto";
    pin.style.position = "static";
    pin.style.height = "auto";
    plate.style.position = "static";
    plate.style.background = "none";
    const img = centerPic.querySelector("img");
    if (img) {
      img.style.position = "static";
      img.style.height = "auto";
    }
    centerPic.style.position = "static";
    return article;
  }

  // The push-in: image scales up across the whole 200vh pin runway.
  const img = centerPic.querySelector("img")!;
  scroll(
    animate(img, { scale: [1, scrollRanges.centerpieceZoom] }, { ease: "linear" }),
    { target: pinTrack, offset: ["start start", "end end"] }
  );

  // Title plate: stays hidden through the first half of the pin, then
  // fades in — the scroll window starts at the track's midpoint ("center
  // start" = track center meeting the viewport top, i.e. 50% pinned).
  plate.style.opacity = "0";
  scroll(
    animate(plate, { opacity: [0, 1] }, { ease: "linear" }),
    { target: pinTrack, offset: ["center start", "end end"] }
  );

  return article;
}
