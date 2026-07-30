/**
 * MASRA Studio — boot sequence.
 *
 * Order matters:
 *  1. Styles + motion context (reduced-motion decided before anything moves)
 *  2. Lenis smooth scroll (skipped under reduced motion)
 *  3. Sections mount in site.config order — hero first so its LCP image
 *     starts decoding immediately
 *  4. Preloader overlays the page and gates on the hero image; its exit
 *     triggers the hero entrance choreography
 */
import "@fontsource/space-mono";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/fonts.css";

import { createMotionContext, watchReducedMotion } from "./shared/motion/motion-context";
import { initSmoothScroll } from "./shared/motion/smooth-scroll";
import { initCursor } from "./shared/ui/cursor";
import { runPreloader } from "./sections/preloader/preloader";
import { initHero } from "./sections/hero/hero";
import { initManifesto } from "./sections/manifesto/manifesto";
import { initWork } from "./sections/work/work";
import { initServices } from "./sections/services/services";
import { initClients } from "./sections/clients/clients";
import { initContact } from "./sections/contact/contact";
import { sectionOrder, type SectionName } from "./config/site.config";
import { strings } from "./config/strings";
import "./sections/hero/hero.css";
import "./sections/manifesto/manifesto.css";

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
  work: initWork,
  services: initServices,
  clients: initClients,
  contact: initContact,
};

for (const name of sectionOrder) {
  if (name === "hero") continue;
  sectionInits[name](main, ctx);
}

initCursor(ctx);

// Preloader gates on the hero image, then hands off to the hero entrance.
// Entrance starts 300ms before the curtain fully clears for overlap.
runPreloader(ctx, hero.imageReady).then(() => hero.enter());
