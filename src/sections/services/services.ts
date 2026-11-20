import { animate, spring } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealChars, revealGroup } from "../../shared/motion/reveals";
import { buildPicture } from "../../shared/ui/picture";
import { strings } from "../../config/strings";
import { serviceThumbs } from "../../config/site.config";
import { springs, staggers } from "../../config/motion.config";
import "./services.css";

/**
 * Services — six disciplines as full-width index rows, each with a short
 * description of what the service includes (v3).
 *
 * Reveal: rows rise with a stagger as the list enters the viewport.
 * Desktop hover: a floating 3:4 thumbnail (one photo mapped per service in
 * site.config) spring-follows the cursor and crossfades per row; the row
 * name slides right and its index lights mint (pure-CSS transitions).
 */
export function initServices(root: HTMLElement, ctx: MotionContext): void {
  const section = document.createElement("section");
  section.className = "services container";
  section.id = "services";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = strings.services.eyebrow;

  const title = document.createElement("h2");
  title.className = "services__title display";
  title.textContent = strings.services.title;

  const list = document.createElement("ul");
  list.className = "services__list";

  const rows: HTMLElement[] = [];
  strings.services.items.forEach((service, i) => {
    const row = document.createElement("li");
    row.className = "services__row";

    const index = document.createElement("span");
    index.className = "services__index";
    index.textContent = String(i + 1).padStart(2, "0");

    // v3: name + one-line "what it includes" description (client feedback
    // item 4). Descriptions are drafts pending client sign-off — see
    // strings.services.
    const text = document.createElement("div");
    text.className = "services__text";
    const name = document.createElement("h3");
    name.className = "services__name";
    name.textContent = service.name;
    const description = document.createElement("p");
    description.className = "services__description";
    description.textContent = service.description;
    text.append(name, description);

    row.append(index, text);
    list.appendChild(row);
    rows.push(row);
  });

  section.append(eyebrow, title, list);
  root.appendChild(section);

  revealBlock(ctx, eyebrow);
  revealChars(ctx, title);
  revealGroup(ctx, rows, staggers.rows);

  // Floating hover thumbnail — desktop pointer sessions only.
  if (!ctx.desktopPointer || ctx.reducedMotion) return;

  const thumb = document.createElement("div");
  thumb.className = "services__thumb";
  thumb.setAttribute("aria-hidden", "true");
  // Pre-build all six pictures; crossfade by toggling visibility (cheaper
  // than swapping srcsets on every row change).
  const pics = serviceThumbs.map((slug) => {
    const pic = buildPicture(slug, { sizes: "17.5rem" });
    pic.style.position = "absolute";
    pic.style.inset = "0";
    pic.style.opacity = "0";
    pic.style.transition = "opacity 0.3s ease";
    thumb.appendChild(pic);
    return pic;
  });
  document.body.appendChild(thumb);

  // Spring-follow: the thumb trails the cursor with the shared follow spring.
  list.addEventListener("pointermove", (e) => {
    animate(
      thumb,
      { x: e.clientX + 24, y: e.clientY - 120 },
      { type: spring, ...springs.follow }
    );
  });

  rows.forEach((row, i) => {
    row.addEventListener("pointerenter", () => {
      thumb.style.opacity = "1";
      pics.forEach((p, j) => (p.style.opacity = j === i ? "1" : "0"));
    });
  });
  list.addEventListener("pointerleave", () => {
    thumb.style.opacity = "0";
  });
}
