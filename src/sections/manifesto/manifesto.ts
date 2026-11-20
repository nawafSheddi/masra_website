import { scroll } from "motion";
import type { MotionContext } from "../../shared/motion/motion-context";
import { splitWords } from "../../shared/motion/split";
import { revealGroup } from "../../shared/motion/reveals";
import { strings } from "../../config/strings";
import "./manifesto.css";

/**
 * Manifesto — the studio's thesis, read by scrolling.
 *
 * The statement splits into words; each word starts dim (the resting
 * hairline color) and brightens to full cream as its slice of the section
 * crosses the viewport — a read-along highlight driven entirely by
 * scroll(), so it runs on the compositor and scrubs both directions.
 */
export function initManifesto(root: HTMLElement, ctx: MotionContext): void {
  const section = document.createElement("section");
  section.className = "manifesto container";
  section.id = "manifesto";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = strings.manifesto.eyebrow;

  // Emphasis markers: words wrapped in *asterisks* in strings.ts render in
  // the italic emphasis style. Strip the markers, remember which word
  // indices they covered, and tag those spans after the split below.
  const rawTokens = strings.manifesto.statement.split(/\s+/);
  const emphasisIndices = new Set<number>();
  const cleanTokens = rawTokens.map((token, i) => {
    if (/\*[^*]+\*/.test(token)) emphasisIndices.add(i);
    return token.replaceAll("*", "");
  });

  const statement = document.createElement("p");
  statement.className = "manifesto__statement";
  statement.textContent = cleanTokens.join(" ");

  const stats = document.createElement("ul");
  stats.className = "manifesto__stats";
  for (const stat of strings.manifesto.stats) {
    const li = document.createElement("li");
    const value = document.createElement("span");
    value.className = "manifesto__stat-value";
    value.textContent = stat.value;
    const label = document.createElement("span");
    label.className = "manifesto__stat-label";
    label.textContent = stat.label;
    label.style.display = "block";
    li.append(value, label);
    stats.appendChild(li);
  }

  section.append(eyebrow, statement, stats);
  root.appendChild(section);

  if (ctx.reducedMotion) {
    // Static page still gets the typographic emphasis (no split happened,
    // so wrap via a cheap rebuild through the same splitter).
    const staticWords = splitWords(statement);
    staticWords.forEach((w, i) => {
      if (emphasisIndices.has(i)) w.classList.add("manifesto__em");
    });
    return;
  }

  // Word-by-word scroll highlight: scroll() feeds section progress to a
  // callback that lights all words up to the current position. Each word
  // carries a short CSS opacity transition so the wavefront feels liquid,
  // and the scrub runs in both directions for free.
  const words = splitWords(statement);
  words.forEach((word, i) => {
    word.style.opacity = "0.45";
    word.style.transition = "opacity 0.25s linear";
    if (emphasisIndices.has(i)) word.classList.add("manifesto__em");
  });
  scroll(
    (progress: number) => {
      const lit = Math.floor(progress * words.length);
      words.forEach((word, i) => {
        word.style.opacity = i <= lit ? "1" : "0.45";
      });
    },
    // The highlight plays out across the section's middle passage.
    { target: section, offset: ["start 0.8", "end 0.55"] }
  );

  revealGroup(ctx, Array.from(stats.children) as HTMLElement[]);
}
