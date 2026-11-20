import { scroll } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { splitWords } from "../../shared/motion/split";
import { revealGroup } from "../../shared/motion/reveals";
import { strings } from "../../config/strings";
import "./about.css";

/**
 * About — v3 (client feedback item 2; evolved from the v2 manifesto).
 *
 * The client's own studio definition, read by scrolling: the statement
 * splits into words; each starts dim and brightens as its slice of the
 * section crosses the viewport — a read-along highlight driven entirely by
 * scroll(), scrubbing both directions. Below it, the facts row:
 * 200+ brands · Since 2023 · Riyadh.
 */
export function initAbout(root: HTMLElement, ctx: MotionContext): void {
  const section = document.createElement("section");
  section.className = "about container";
  section.id = "about";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = strings.about.eyebrow;

  // Emphasis markers: words wrapped in *asterisks* in strings.ts render in
  // the italic emphasis style. Strip the markers, remember which word
  // indices they covered, and tag those spans after the split below.
  const rawTokens = strings.about.statement.split(/\s+/);
  const emphasisIndices = new Set<number>();
  const cleanTokens = rawTokens.map((token, i) => {
    if (/\*[^*]+\*/.test(token)) emphasisIndices.add(i);
    return token.replaceAll("*", "");
  });

  // The statement is the section's heading for assistive tech.
  const statement = document.createElement("h2");
  statement.className = "about__statement";
  statement.textContent = cleanTokens.join(" ");

  // Facts row. Label precedes value in the DOM (and visually), so both the
  // eye and a screen reader get "Since 2023", "Brands 200+".
  const stats = document.createElement("ul");
  stats.className = "about__stats";
  for (const stat of strings.about.stats) {
    const li = document.createElement("li");
    li.className = "about__stat";
    const value = document.createElement("span");
    value.className = "about__stat-value";
    value.textContent = stat.value;
    const label = document.createElement("span");
    label.className = "about__stat-label";
    label.textContent = stat.label;
    label.style.display = "block";
    li.append(label, value);
    stats.appendChild(li);
  }

  section.append(eyebrow, statement, stats);
  root.appendChild(section);

  if (ctx.reducedMotion) {
    // Static page still gets the typographic emphasis (split without the
    // scroll-driven dimming).
    const staticWords = splitWords(statement);
    staticWords.forEach((w, i) => {
      if (emphasisIndices.has(i)) w.classList.add("about__em");
    });
    return;
  }

  // Word-by-word scroll highlight: scroll() feeds section progress to a
  // callback that lights all words up to the current position. Each word
  // carries a short CSS opacity transition so the wavefront feels liquid.
  const words = splitWords(statement);
  words.forEach((word, i) => {
    word.style.opacity = "0.45";
    word.style.transition = "opacity 0.25s linear";
    if (emphasisIndices.has(i)) word.classList.add("about__em");
  });
  scroll(
    (progress: number) => {
      const lit = Math.floor(progress * words.length);
      words.forEach((word, i) => {
        word.style.opacity = i <= lit ? "1" : "0.45";
      });
    },
    // v3: a shorter highlight window than v2's manifesto (the section is
    // shorter now) — the sentence is fully lit by the time it sits at
    // the upper third of the viewport.
    { target: section, offset: ["start 0.85", "end 0.75"] }
  );

  revealGroup(ctx, Array.from(stats.children) as HTMLElement[]);
}
