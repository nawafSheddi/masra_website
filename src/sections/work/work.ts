import { animate } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealChars, revealGroup } from "../../shared/motion/reveals";
import { durations, eases, staggers } from "../../config/motion.config";
import { filterByCategory, type WorkCategory, type WorkFilter } from "./filter";

/**
 * Work — behavior for the server-rendered grid (Work.astro).
 *
 * Tabs are real buttons with aria-pressed inside a labelled group. Hidden
 * cards use the `hidden` attribute, so they leave the layout AND the
 * accessibility tree. With motion, newly shown cards fade/rise in;
 * reduced motion swaps instantly. The filtering rule itself is the pure
 * `filterByCategory` (tested in filter.test.ts).
 */
export function initWork(section: HTMLElement, ctx: MotionContext): void {
  const eyebrow = section.querySelector<HTMLElement>(".eyebrow")!;
  const title = section.querySelector<HTMLElement>(".work__title")!;
  const tabs = section.querySelector<HTMLElement>(".work__tabs")!;
  const buttons = Array.from(tabs.querySelectorAll<HTMLButtonElement>("button[data-filter]"));
  const cards = Array.from(section.querySelectorAll<HTMLLIElement>(".work__item")).map((li) => ({
    li,
    category: li.dataset.category as WorkCategory,
  }));

  // --- Entrance choreography (helpers no-op under reduced motion) --------
  revealBlock(ctx, eyebrow);
  revealChars(ctx, title);
  revealBlock(ctx, tabs, { delay: 0.1 });
  revealGroup(ctx, cards.map((c) => c.li), staggers.items, { amount: 0.05 });

  // --- Filtering ------------------------------------------------------------
  let current: WorkFilter = "all";

  /** Show only `filter`'s cards; sync aria-pressed; animate newcomers. */
  function select(filter: WorkFilter): void {
    if (filter === current) return;
    current = filter;
    for (const btn of buttons) btn.setAttribute("aria-pressed", String(btn.dataset.filter === filter));

    const visible = new Set(filterByCategory(cards, filter));
    const shown: HTMLElement[] = [];
    for (const card of cards) {
      const show = visible.has(card);
      if (show && card.li.hidden) shown.push(card.li);
      card.li.hidden = !show;
    }
    if (ctx.reducedMotion) return;
    // Cards that stay visible simply reflow; only newly shown ones animate.
    shown.forEach((li, i) => {
      animate(
        li,
        { opacity: [0, 1], y: [24, 0] },
        { duration: durations.base, delay: i * staggers.items, ease: eases.outExpo }
      );
    });
  }

  for (const btn of buttons) {
    btn.addEventListener("click", () => select(btn.dataset.filter as WorkFilter));
  }
}
