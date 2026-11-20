import { animate } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealChars, revealGroup } from "../../shared/motion/reveals";
import { buildPicture } from "../../shared/ui/picture";
import { campaigns, type Campaign } from "../../config/campaigns.config";
import { strings } from "../../config/strings";
import { durations, eases, staggers } from "../../config/motion.config";
import { clientHref } from "../../shared/routing/client-route";
import { WORK_FILTERS, filterByCategory, type WorkFilter } from "./filter";
import "./work.css";

/**
 * Work — v3 (client feedback item 3).
 *
 *   OUR WORK
 *   WORK                                 [All] [Artistic] [Lifestyle] [Menu]
 *   ┌────────┐ ┌────────┐ ┌────────┐
 *   │ image  │ │ image  │ │ image  │    each card → /work/<id>
 *   │ PETI   │ │ IDMI   │ │ …      │
 *   │ Artistic photography · 2025 │
 *
 * Replaces the v2 "Seven Moods" index + chapter run. Category membership
 * comes from campaigns.config (`category`), tab labels from strings.work;
 * the filtering rule itself is the pure `filterByCategory` (tested).
 *
 * Tabs are real buttons with aria-pressed inside a labelled group. Hidden
 * cards use the `hidden` attribute, so they leave the layout AND the
 * accessibility tree. With motion, newly shown cards fade/rise in;
 * reduced motion swaps instantly.
 */
export function initWork(root: HTMLElement, ctx: MotionContext): void {
  const section = document.createElement("section");
  section.className = "work container";
  section.id = "work";

  // --- Header: eyebrow + giant title on the left, tabs on the right -------
  const head = document.createElement("div");
  head.className = "work__head";

  const titles = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = strings.work.eyebrow;
  const title = document.createElement("h2");
  title.className = "work__title display";
  title.textContent = strings.work.title;
  titles.append(eyebrow, title);

  const tabs = document.createElement("div");
  tabs.className = "work__tabs";
  tabs.setAttribute("role", "group");
  tabs.setAttribute("aria-label", strings.work.tabsLabel);
  const tabButtons = new Map<WorkFilter, HTMLButtonElement>();
  for (const filter of WORK_FILTERS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "work__tab";
    btn.textContent = strings.work.tabs[filter];
    btn.setAttribute("aria-pressed", String(filter === "all"));
    btn.addEventListener("click", () => select(filter));
    tabs.appendChild(btn);
    tabButtons.set(filter, btn);
  }
  head.append(titles, tabs);

  // --- Card grid ------------------------------------------------------------
  const grid = document.createElement("ul");
  grid.className = "work__grid";
  const cardById = new Map<Campaign["id"], HTMLLIElement>();
  for (const campaign of campaigns) {
    const li = buildCard(campaign);
    grid.appendChild(li);
    cardById.set(campaign.id, li);
  }

  section.append(head, grid);
  root.appendChild(section);

  // --- Entrance choreography (helpers no-op under reduced motion) --------
  revealBlock(ctx, eyebrow);
  revealChars(ctx, title);
  revealBlock(ctx, tabs, { delay: 0.1 });
  revealGroup(ctx, Array.from(cardById.values()), staggers.items, { amount: 0.05 });

  // --- Filtering ------------------------------------------------------------
  let current: WorkFilter = "all";

  /** Show only `filter`'s cards; sync aria-pressed; animate newcomers. */
  function select(filter: WorkFilter): void {
    if (filter === current) return;
    current = filter;
    for (const [f, btn] of tabButtons) btn.setAttribute("aria-pressed", String(f === filter));

    const visible = new Set(filterByCategory(campaigns, filter).map((c) => c.id));
    const shown: HTMLElement[] = [];
    for (const [id, li] of cardById) {
      const show = visible.has(id);
      if (show && li.hidden) shown.push(li);
      li.hidden = !show;
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
}

/** One client card: a full-card link with lead image, name, category, year. */
function buildCard(campaign: Campaign): HTMLLIElement {
  const copy = strings.chapters[campaign.id];
  const li = document.createElement("li");
  li.className = "work__item";

  const a = document.createElement("a");
  a.className = "work-card";
  a.href = clientHref(campaign.id);
  a.dataset.cursor = "view"; // custom cursor shows "VIEW" over cards

  const media = document.createElement("div");
  media.className = "work-card__media";
  media.appendChild(
    buildPicture(campaign.images.lead, {
      sizes: "(min-width: 900px) 30vw, (min-width: 600px) 45vw, 100vw",
      decorative: true, // the card's name labels the link
    })
  );

  const body = document.createElement("div");
  body.className = "work-card__body";
  const name = document.createElement("h3");
  name.className = "work-card__name";
  name.textContent = copy.name;
  const meta = document.createElement("p");
  meta.className = "work-card__meta eyebrow";
  meta.textContent = `${strings.work.categoryLabel[campaign.category]} · ${campaign.meta.year}`;
  const cta = document.createElement("span");
  cta.className = "work-card__cta";
  cta.setAttribute("aria-hidden", "true"); // the name already labels the link
  cta.textContent = `${strings.work.viewProject} →`;
  body.append(name, meta, cta);

  a.append(media, body);
  li.appendChild(a);
  return li;
}
