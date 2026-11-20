import type { MotionContext } from "../../shared/motion/motion-context";
import type { Campaign } from "../../config/campaigns.config";
import { revealBlock, revealChars, revealWords } from "../../shared/motion/reveals";

/**
 * Shared chapter header — the one visual grammar all seven mood-worlds
 * open with: catalog number, giant bilingual mood title, client brand,
 * discipline tags, one-line description. Layout builders own everything
 * below this.
 */

/** The copy fields every chapter guarantees (strings.chapters.* entries
 *  are structurally wider — some carry captions, strip labels, etc.). */
export interface ChapterCopy {
  name: string;
  nameAr?: string;
  mood: string;
  moodAr: string;
  tags: readonly string[];
  description: string;
}

/** Zero-padded catalog number: 1 → "01". */
export const pad2 = (n: number): string => String(n).padStart(2, "0");

export function buildChapterShell(
  ctx: MotionContext,
  campaign: Campaign,
  copy: ChapterCopy
): HTMLElement {
  const header = document.createElement("header");
  header.className = "chapter__header container";

  // "01 / 07 — PETI · 2025" — camera-log metadata line.
  const meta = document.createElement("p");
  meta.className = "eyebrow chapter__meta";
  meta.textContent = `${pad2(campaign.index)} / 07 — ${copy.name} · ${campaign.meta.year}`;

  // Giant bilingual mood title. Latin springs in per-character; Arabic is a
  // connected script, so it animates per-WORD only (revealWords) — glyph
  // splitting would break its joined letterforms.
  const title = document.createElement("h3");
  title.className = "chapter__title";

  const moodEn = document.createElement("span");
  moodEn.className = "chapter__mood-en";
  moodEn.textContent = copy.mood;

  const moodAr = document.createElement("span");
  moodAr.className = "chapter__mood-ar";
  moodAr.dir = "rtl";
  moodAr.lang = "ar";
  moodAr.textContent = copy.moodAr;

  title.append(moodEn, moodAr);

  const tags = document.createElement("ul");
  tags.className = "chapter__tags";
  for (const tag of copy.tags) {
    const li = document.createElement("li");
    li.textContent = tag;
    tags.appendChild(li);
  }

  const description = document.createElement("p");
  description.className = "chapter__description";
  description.textContent = copy.description;

  header.append(meta, title, tags, description);

  // Entrance choreography (all helpers no-op under reduced motion).
  revealBlock(ctx, meta);
  revealChars(ctx, moodEn);
  revealWords(ctx, moodAr, { delay: 0.2 });
  revealBlock(ctx, tags, { delay: 0.1 });
  revealBlock(ctx, description, { delay: 0.2 });

  return header;
}
