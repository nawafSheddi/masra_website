import type { MotionContext } from "../../shared/motion/motion-context";
import { initTheatrical } from "./theatrical";
import { initStrip } from "./strip";
import { initStillLife } from "./stilllife";
import { initPicnic } from "./picnic";
import { initScrub } from "./scrub";
import { initGift } from "./gift";
import { initDocumentary } from "./documentary";

/**
 * Gallery behavior: runs the motion for the layout Gallery.astro rendered
 * (read from the wrapper's data-layout). Adding a new layout = a new
 * <Name>.astro + <name>.ts pair, registered here and in Gallery.astro, plus
 * its entry in the schema (src/content.config.ts).
 */
type LayoutInit = (stage: HTMLElement, wrapper: HTMLElement, ctx: MotionContext) => void;

const layouts: Record<string, LayoutInit> = {
  theatrical: initTheatrical,
  strip: initStrip,
  stilllife: initStillLife,
  picnic: initPicnic,
  scrub: initScrub,
  gift: initGift,
  documentary: initDocumentary,
};

export function initGallery(wrapper: HTMLElement, ctx: MotionContext): void {
  const stage = wrapper.querySelector<HTMLElement>(".chapter__stage")!;
  layouts[wrapper.dataset.layout ?? ""]?.(stage, wrapper, ctx);
}
