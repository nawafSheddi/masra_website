import { animate, inView } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock } from "../../shared/motion/reveals";
import { scrollVelocity } from "../../shared/motion/smooth-scroll";
import { strings } from "../../config/strings";
import { marqueeDurations } from "../../config/motion.config";
import "./clients.css";

const ARABIC = /[؀-ۿ]/;

/**
 * Client wall — all 23 client names in three infinite marquees.
 *
 * Each row duplicates its content twice and animates x: 0 → -50% on an
 * infinite linear loop (seamless because the second copy is identical).
 * The middle row runs reversed in vermilion outline. Row speed subtly
 * responds to Lenis scroll velocity — scroll fast and the wall hurries.
 * Reduced motion: a static wrapped grid.
 */
export function initClients(root: HTMLElement, ctx: MotionContext): void {
  const section = document.createElement("section");
  section.className = "clients";
  section.id = "clients";

  const header = document.createElement("header");
  header.className = "clients__header container";
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = strings.clients.eyebrow;
  const count = document.createElement("p");
  count.className = "clients__count";
  const countNumber = document.createElement("span");
  countNumber.className = "clients__count-number";
  const total = strings.clients.names.length;
  countNumber.textContent = String(total);
  const countSuffix = document.createElement("span");
  countSuffix.textContent = strings.clients.countUpSuffix;
  count.append(countNumber, countSuffix);
  header.append(eyebrow, count);
  section.appendChild(header);

  // Split the 23 names across three rows.
  const perRow = Math.ceil(total / 3);
  const rowNames = [
    strings.clients.names.slice(0, perRow),
    strings.clients.names.slice(perRow, perRow * 2),
    strings.clients.names.slice(perRow * 2),
  ];

  /** One copy of a row's content: names separated by brand dots. */
  function buildRowContent(names: readonly string[]): HTMLElement {
    const inner = document.createElement("div");
    inner.className = "clients__row-inner";
    for (const n of names) {
      const name = document.createElement("span");
      name.className = "clients__name";
      name.textContent = n;
      if (ARABIC.test(n)) {
        name.lang = "ar";
        name.dir = "rtl";
      }
      const sep = document.createElement("span");
      sep.className = "clients__sep";
      sep.textContent = "·";
      sep.setAttribute("aria-hidden", "true");
      inner.append(name, sep);
    }
    return inner;
  }

  const rows: HTMLElement[] = rowNames.map((names, i) => {
    const row = document.createElement("div");
    row.className = "clients__row";
    if (i === 1) row.classList.add("clients__row--outline");
    // Two identical copies → x: -50% loops seamlessly.
    row.append(buildRowContent(names), buildRowContent(names));
    section.appendChild(row);
    return row;
  });

  root.appendChild(section);
  revealBlock(ctx, header);

  if (ctx.reducedMotion) {
    section.classList.add("clients--static");
    // Static mode shows one copy per row — remove the duplicates.
    for (const row of rows) row.lastElementChild?.remove();
    return;
  }

  // Infinite marquees; middle row reversed. Speed modulated by scroll
  // velocity (clamped ×1–3) for the reactive-wall feel.
  const animations = rows.map((row, i) => {
    const reversed = i === 1;
    return animate(
      row,
      { x: reversed ? ["-50%", "0%"] : ["0%", "-50%"] },
      { duration: marqueeDurations[i], repeat: Infinity, ease: "linear" }
    );
  });

  function tick() {
    const boost = Math.min(3, 1 + Math.abs(scrollVelocity()) / 25);
    for (const a of animations) a.speed = boost;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Count-up: 0 → 23 when the header enters view.
  countNumber.textContent = "0";
  inView(header, () => {
    animate(0, total, {
      duration: 1.2,
      ease: "circOut",
      onUpdate: (v) => (countNumber.textContent = String(Math.round(v))),
    });
  });
}
