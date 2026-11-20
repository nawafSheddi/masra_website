/**
 * MASRA Studio v3 — home page entry.
 *
 * Order matters:
 *  1. Shared boot: styles, motion context, Lenis, skip link, fixed header,
 *     <main>, cursor (see shared/boot.ts)
 *  2. Sections mount in site.config order — hero first so its LCP image
 *     starts decoding immediately
 *  3. Palette takeover wires AFTER all sections exist. Every home section
 *     is a base-palette sentinel (client palettes now live on /work/<id>
 *     pages), which keeps body[data-chapter] on the darkroom palette even
 *     when arriving back from a client page via bfcache.
 *  4. Preloader overlays the page and gates on the hero image; its exit
 *     triggers the hero entrance. Deep links ("/#work") and Back-button
 *     returns skip it and jump straight to the right place (see below).
 */
import { boot } from "./shared/boot";
import { BASE_CHAPTER, initPaletteTakeover } from "./shared/motion/palette";
import { scrollToHash, scrollToY } from "./shared/motion/smooth-scroll";
import { runPreloader } from "./sections/preloader/preloader";
import { initHero } from "./sections/hero/hero";
import { initAbout } from "./sections/about/about";
import { initWork } from "./sections/work/work";
import { initServices } from "./sections/services/services";
import { initClients } from "./sections/clients/clients";
import { initContact } from "./sections/contact/contact";
import { sectionOrder, type SectionName } from "./config/site.config";
import type { MotionContext } from "./shared/motion/motion-context";
import "./sections/hero/hero.css";

// The browser would try to restore/jump to the hash before the JS-built
// sections exist; we handle the jump ourselves after the preloader.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

const { ctx, main } = boot({ home: true });

// Hero mounts first (LCP); the rest follow in configured order.
const hero = initHero(main, ctx);

const sectionInits: Record<Exclude<SectionName, "hero">, (root: HTMLElement, c: MotionContext) => void> = {
  about: initAbout,
  work: initWork,
  services: initServices,
  clients: initClients,
  contact: initContact,
};

for (const name of sectionOrder) {
  if (name === "hero") continue;
  sectionInits[name](main, ctx);
}

// Palette: every top-level home section restores the base palette.
initPaletteTakeover(
  Array.from(main.querySelectorAll<HTMLElement>(":scope > section"), (el) => ({ el, id: BASE_CHAPTER }))
);

// --- Arrival modes -----------------------------------------------------
// 1. Deep link like "/#work" (from a client page's nav): skip the
//    preloader's theatre and jump to the section.
// 2. Back/Forward from a client page when the browser could NOT restore
//    the page from bfcache (it reloads instead): we disabled automatic
//    scroll restoration above, so restore the saved offset ourselves and
//    skip the preloader — the visitor is returning, not arriving.
//    (When bfcache DOES restore the page, none of this runs: the page is
//    resumed exactly as it was.)
const SCROLL_KEY = "masra:home-scroll";
const deepLink = location.hash.length > 1 ? location.hash : "";
const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
const savedY = navEntry?.type === "back_forward" ? Number(readSession(SCROLL_KEY)) || 0 : 0;

// Remember where the visitor was whenever they leave the home page.
window.addEventListener("pagehide", () => writeSession(SCROLL_KEY, String(Math.round(window.scrollY))));

runPreloader(ctx, hero.imageReady, { skip: Boolean(deepLink) || savedY > 0 }).then(async () => {
  hero.enter();
  if (!deepLink && savedY === 0) return;
  // Jump only once layout is final: web fonts change line heights (and so
  // every section's offset), then give layout one frame to settle.
  await document.fonts.ready;
  requestAnimationFrame(() => {
    if (savedY > 0) scrollToY(savedY);
    else scrollToHash(deepLink, { immediate: true });
  });
});

/** sessionStorage can throw (privacy modes, blocked storage) — never let
 *  a convenience feature break the page. */
function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeSession(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* storage unavailable — restoring scroll is best-effort */
  }
}
