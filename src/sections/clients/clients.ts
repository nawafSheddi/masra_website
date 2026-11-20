import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealChars, revealGroup } from "../../shared/motion/reveals";
import { staggers } from "../../config/motion.config";

/** Detects Arabic script so fallback names render right-to-left. */
const ARABIC = /[؀-ۿ]/;

/**
 * Featured clients — behavior for the server-rendered logo wall
 * (Clients.astro): entrance motion, and a text-wordmark fallback for any
 * logo file that fails to load (so a cell never ends up empty).
 */
export function initClients(section: HTMLElement, ctx: MotionContext): void {
  // Broken/missing logo file → swap in the name as a text wordmark.
  for (const img of section.querySelectorAll<HTMLImageElement>("img.logo-grid__logo")) {
    const fallback = () => {
      const span = document.createElement("span");
      span.className = "logo-grid__wordmark";
      span.textContent = img.dataset.name ?? img.alt;
      if (ARABIC.test(span.textContent)) {
        span.lang = "ar";
        span.dir = "rtl";
      }
      img.replaceWith(span);
    };
    if (img.complete && img.naturalWidth === 0) fallback();
    else img.addEventListener("error", fallback, { once: true });
  }

  revealBlock(ctx, section.querySelector<HTMLElement>(".eyebrow")!);
  revealChars(ctx, section.querySelector<HTMLElement>(".clients__title")!);
  revealBlock(ctx, section.querySelector<HTMLElement>(".clients__count")!, { delay: 0.1 });
  revealGroup(
    ctx,
    Array.from(section.querySelectorAll<HTMLElement>(".logo-grid__cell")),
    staggers.chars * 2
  );
}
