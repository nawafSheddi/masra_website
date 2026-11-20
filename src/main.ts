/**
 * MASRA Studio v2 ("Seven Moods") — boot sequence.
 *
 * Order matters:
 *  1. Styles + motion context (reduced-motion decided before anything moves)
 *  2. Lenis smooth scroll (skipped under reduced motion)
 *  3. Sections mount in site.config order — hero first so its LCP image
 *     starts decoding immediately
 *  4. Palette takeover wires AFTER all sections exist: every chapter
 *     wrapper carries data-chapter-id; every other top-level section gets
 *     the "base" sentinel so scrolling out of the chapter run always
 *     restores the darkroom palette (both directions)
 *  5. Preloader overlays the page and gates on the hero image; its exit
 *     triggers the hero entrance choreography
 */
import "@fontsource/space-mono";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/fonts.css";
import "./styles/chapters.css";

import { createMotionContext, watchReducedMotion } from "./shared/motion/motion-context";
import { initSmoothScroll } from "./shared/motion/smooth-scroll";
import { BASE_CHAPTER, initPaletteTakeover } from "./shared/motion/palette";
import { initCursor } from "./shared/ui/cursor";
import { runPreloader } from "./sections/preloader/preloader";
import { initHero } from "./sections/hero/hero";
import { initManifesto } from "./sections/manifesto/manifesto";
import { initIndexNav } from "./sections/index-nav/index-nav";
import { initChapters } from "./sections/chapters/chapters";
import "./sections/chapters/layouts"; // registers the bespoke chapter layouts
import { initNumbers } from "./sections/numbers/numbers";
import { initServices } from "./sections/services/services";
import { initClients } from "./sections/clients/clients";
import { initContact } from "./sections/contact/contact";
import { sectionOrder, type SectionName } from "./config/site.config";
import { strings } from "./config/strings";
import type { CampaignId } from "./config/campaigns.config";
import "./sections/hero/hero.css";
import "./sections/manifesto/manifesto.css";
import "./sections/chapters/chapters.css";

const app = document.querySelector<HTMLDivElement>("#app")!;
const ctx = createMotionContext();
watchReducedMotion();

if (!ctx.reducedMotion) initSmoothScroll();

// Accessibility: skip link + semantic main landmark.
const skip = document.createElement("a");
skip.className = "skip-link";
skip.href = "#main";
skip.textContent = strings.a11y.skipToContent;
const main = document.createElement("main");
main.id = "main";
app.append(skip, main);

// Hero mounts first (LCP); the rest follow in configured order.
const hero = initHero(main, ctx);

const sectionInits: Record<Exclude<SectionName, "hero">, (root: HTMLElement, c: typeof ctx) => void> = {
  manifesto: initManifesto,
  indexNav: initIndexNav,
  chapters: initChapters,
  numbers: initNumbers,
  services: initServices,
  clients: initClients,
  contact: initContact,
};

for (const name of sectionOrder) {
  if (name === "hero") continue;
  sectionInits[name](main, ctx);
}

// Palette takeover: chapters carry their campaign id; every other
// top-level section is a base-palette sentinel. Wired after mount so the
// observer sees the final DOM.
const paletteTargets: Array<{ el: HTMLElement; id: CampaignId | typeof BASE_CHAPTER }> = [];
for (const el of main.querySelectorAll<HTMLElement>(":scope > section, .chapter")) {
  if (el.classList.contains("chapters")) continue; // container, not a target
  const id = (el.dataset.chapterId as CampaignId | undefined) ?? BASE_CHAPTER;
  paletteTargets.push({ el, id });
}
initPaletteTakeover(paletteTargets);

initCursor(ctx);

// Preloader gates on the hero image, then hands off to the hero entrance.
runPreloader(ctx, hero.imageReady).then(() => hero.enter());
