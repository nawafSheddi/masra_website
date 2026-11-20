import { animate, spring } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealChars, revealGroup } from "../../shared/motion/reveals";
import { springs, staggers } from "../../config/motion.config";

/**
 * Services — behavior for Services.astro.
 *
 * Reveal: rows rise with a stagger as the list enters the viewport.
 * Desktop hover: a floating 3:4 thumbnail (one photo per service, set in
 * src/content/services.yaml) spring-follows the cursor and crossfades per
 * row; the row name slides right and its index lights mint (pure CSS).
 */
export function initServices(section: HTMLElement, ctx: MotionContext): void {
  const list = section.querySelector<HTMLElement>(".services__list")!;
  const rows = Array.from(list.querySelectorAll<HTMLElement>(".services__row"));

  revealBlock(ctx, section.querySelector<HTMLElement>(".eyebrow")!);
  revealChars(ctx, section.querySelector<HTMLElement>(".services__title")!);
  revealGroup(ctx, rows, staggers.rows);

  // Floating hover thumbnail — desktop pointer sessions only.
  if (!ctx.desktopPointer || ctx.reducedMotion) return;

  const thumb = section.querySelector<HTMLElement>(".services__thumb")!;
  const pics = Array.from(thumb.querySelectorAll<HTMLElement>(".pic"));
  // Un-hiding lets the (lazy) preview images start loading.
  thumb.hidden = false;
  // Fixed positioning must not be trapped by a transformed ancestor.
  document.body.appendChild(thumb);

  // Spring-follow: the thumb trails the cursor with the shared follow spring.
  list.addEventListener("pointermove", (e) => {
    animate(thumb, { x: e.clientX + 24, y: e.clientY - 120 }, { type: spring, ...springs.follow });
  });

  rows.forEach((row, i) => {
    row.addEventListener("pointerenter", () => {
      thumb.style.opacity = "1";
      pics.forEach((p, j) => p.classList.toggle("is-active", j === i));
    });
  });
  list.addEventListener("pointerleave", () => {
    thumb.style.opacity = "0";
  });
}
