/**
 * Home page behavior (the markup is server-rendered by pages/index.astro).
 *
 * Order matters:
 *  1. Shared boot: motion context, Lenis, header, cursor, image fades
 *  2. Each section's behavior, found by its id
 *  3. Palette: every home section is a base-palette sentinel, which keeps
 *     body[data-chapter] on the darkroom palette even when arriving back
 *     from a client page via bfcache
 *  4. Preloader gates on the hero image; its exit triggers the hero
 *     entrance. Deep links ("/#work") and Back-button returns skip it and
 *     jump straight to the right place.
 */
import { boot } from "./boot";
import { BASE_CHAPTER, initPaletteTakeover } from "../shared/motion/palette";
import { scrollToHash, scrollToY } from "../shared/motion/smooth-scroll";
import { runPreloader } from "../sections/preloader/preloader";
import { initHero } from "../sections/hero/hero";
import { initAbout } from "../sections/about/about";
import { initWork } from "../sections/work/work";
import { initServices } from "../sections/services/services";
import { initClients } from "../sections/clients/clients";
import { initContact } from "../sections/contact/contact";
import type { MotionContext } from "../shared/motion/motion-context";

// We handle hash jumps and Back-button scroll ourselves (after the
// preloader), so the browser must not try first.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

const { ctx, main } = boot({ home: true });

const byId = (id: string) => document.getElementById(id);
// The hero can be hidden (site.config sectionOrder); then the preloader
// simply doesn't wait for its image.
const heroEl = byId("hero");
const hero = heroEl ? initHero(heroEl, ctx) : { imageReady: Promise.resolve(), enter: () => {} };
const inits: Record<string, (el: HTMLElement, c: MotionContext) => void> = {
  about: initAbout,
  work: initWork,
  services: initServices,
  clients: initClients,
  contact: initContact,
};
for (const [id, init] of Object.entries(inits)) {
  const el = byId(id);
  if (el) init(el, ctx);
}

// Palette: every top-level home section restores the base palette.
initPaletteTakeover(
  Array.from(main.querySelectorAll<HTMLElement>(":scope > section"), (el) => ({ el, id: BASE_CHAPTER }))
);

// --- Arrival modes -----------------------------------------------------
// 1. Deep link like "/#work" (from a client page's nav): skip the
//    preloader and jump to the section.
// 2. Back/Forward from a client page when the browser could NOT restore
//    the page from bfcache: restore the saved offset and skip the
//    preloader — the visitor is returning, not arriving.
const SCROLL_KEY = "masra:home-scroll";
const deepLink = location.hash.length > 1 ? location.hash : "";
const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
const savedY = navEntry?.type === "back_forward" ? Number(readSession(SCROLL_KEY)) || 0 : 0;

// Remember where the visitor was whenever they leave the home page.
window.addEventListener("pagehide", () => writeSession(SCROLL_KEY, String(Math.round(window.scrollY))));

const skip = Boolean(deepLink) || savedY > 0 || document.documentElement.classList.contains("skip-preloader");
runPreloader(ctx, hero.imageReady, { skip }).then(async () => {
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
