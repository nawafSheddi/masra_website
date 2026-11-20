import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealChars, revealGroup } from "../../shared/motion/reveals";
import { strings } from "../../config/strings";
import { featuredClients, type FeaturedClient } from "../../config/clients.config";
import { staggers } from "../../config/motion.config";
import "./clients.css";

/** Detects Arabic script so those names render right-to-left. */
const ARABIC = /[؀-ۿ]/;

/**
 * Featured clients — v3 (client feedback item 5). Replaces the v2
 * velocity-reactive marquee wall.
 *
 *   TRUSTED BY
 *   Featured clients                         200+ brands and counting
 *   ┌────┬────┬────┬────┬────┬────┐
 *   │logo│logo│logo│logo│logo│logo│   6 cols desktop · 4 tablet · 3 mobile
 *   └────┴────┴────┴────┴────┴────┘   24 equal cells → every row is full
 *
 * A fixed, ordered grid (roster in clients.config.ts). Every cell has the
 * same box; logos are contained to one max-height token so wide wordmarks
 * and square marks carry similar visual weight. Logos render monochrome
 * (CSS) so mixed brand colors read as one wall, full color on hover.
 * A client without a logo — or whose file fails to load — shows its name
 * as a text wordmark in the same cell, so the grid never breaks.
 */
export function initClients(root: HTMLElement, ctx: MotionContext): void {
  const section = document.createElement("section");
  section.className = "clients container";
  section.id = "clients";

  const header = document.createElement("header");
  header.className = "clients__header";
  const titles = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = strings.clients.eyebrow;
  const title = document.createElement("h2");
  title.className = "clients__title display";
  title.textContent = strings.clients.title;
  titles.append(eyebrow, title);

  // "200+ brands and counting" — copy, decoupled from the grid's length.
  const count = document.createElement("p");
  count.className = "clients__count";
  const countNumber = document.createElement("span");
  countNumber.className = "clients__count-number";
  countNumber.textContent = strings.clients.count;
  const countLabel = document.createElement("span");
  countLabel.textContent = ` ${strings.clients.countLabel}`;
  count.append(countNumber, countLabel);
  header.append(titles, count);

  const grid = document.createElement("ul");
  grid.className = "logo-grid";
  const cells = featuredClients.map((client) => {
    const li = document.createElement("li");
    li.className = "logo-grid__cell";
    li.appendChild(buildMark(client));
    grid.appendChild(li);
    return li;
  });

  section.append(header, grid);
  root.appendChild(section);

  revealBlock(ctx, eyebrow);
  revealChars(ctx, title);
  revealBlock(ctx, count, { delay: 0.1 });
  revealGroup(ctx, cells, staggers.chars * 2);
}

/** Text wordmark used when there is no logo (or the logo fails to load). */
function buildWordmark(client: FeaturedClient): HTMLElement {
  const span = document.createElement("span");
  span.className = "logo-grid__wordmark";
  span.textContent = client.name;
  if (ARABIC.test(client.name)) {
    span.lang = "ar";
    span.dir = "rtl";
  }
  return span;
}

/** Logo image with an automatic wordmark fallback. */
function buildMark(client: FeaturedClient): HTMLElement {
  if (!client.logo) return buildWordmark(client);
  const img = document.createElement("img");
  img.className = "logo-grid__logo";
  img.src = client.logo;
  img.alt = client.name;
  img.loading = "lazy";
  img.decoding = "async";
  // Broken/missing file → swap in the wordmark so the cell never empties.
  img.addEventListener("error", () => img.replaceWith(buildWordmark(client)), { once: true });
  return img;
}
