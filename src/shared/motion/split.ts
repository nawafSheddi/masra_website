/**
 * Text splitting for staggered reveals.
 *
 * motion.dev's splitText() is a Motion+ (paid) API and is absent from the
 * open-source package (verified against motion@12.43), so this is our own
 * minimal splitter tuned for the two effects the site needs:
 *   - char split → spring-staggered type entrances inside overflow masks
 *   - word split → the manifesto scroll-highlight
 *
 * Accessibility: the original text is preserved in a visually-hidden
 * .sr-only span (aria-label is prohibited on generic span/p roles) and the
 * generated animation spans are aria-hidden, so screen readers hear one
 * clean string, not letter soup.
 *
 * HARD RULE: Arabic (or any RTL/ligature script) must never be split —
 * separating Arabic characters breaks their joined forms. splitChars()
 * refuses and returns the element whole in that case.
 */

const RTL_CHARS = /[֐-ࣿיִ-﷿ﹰ-﻿]/;

/** Visually-hidden copy of the original text for assistive tech. */
function srOnlyText(text: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "sr-only";
  span.textContent = text;
  return span;
}

/** Wrap each character in a masked line: outer span clips, inner span moves. */
export interface CharSplit {
  /** Inner spans — the elements to animate (translateY within the mask). */
  chars: HTMLSpanElement[];
}

export function splitChars(el: HTMLElement): CharSplit {
  const text = el.textContent ?? "";

  // Refuse to split RTL scripts — animate the block as one piece instead.
  if (RTL_CHARS.test(text)) return { chars: [] };

  el.textContent = "";
  el.appendChild(srOnlyText(text));

  const chars: HTMLSpanElement[] = [];
  for (const ch of text) {
    // Each char sits inside its own overflow-hidden mask so it can rise
    // from "below the baseline" without painting outside the line.
    const mask = document.createElement("span");
    mask.setAttribute("aria-hidden", "true");
    mask.style.display = "inline-block";
    mask.style.overflow = "hidden";
    mask.style.verticalAlign = "top";

    const inner = document.createElement("span");
    inner.style.display = "inline-block";
    inner.textContent = ch === " " ? " " : ch;

    mask.appendChild(inner);
    el.appendChild(mask);
    chars.push(inner);
  }
  return { chars };
}

/** Wrap each word in a span (no masks — used for opacity effects). */
export function splitWords(el: HTMLElement): HTMLSpanElement[] {
  const text = el.textContent ?? "";
  el.textContent = "";
  el.appendChild(srOnlyText(text));

  const words: HTMLSpanElement[] = [];
  for (const word of text.split(/\s+/)) {
    const span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");
    span.style.display = "inline-block";
    span.textContent = word;
    el.appendChild(span);
    // Real space between words (collapses correctly on line wrap).
    el.appendChild(document.createTextNode(" "));
    words.push(span);
  }
  return words;
}
