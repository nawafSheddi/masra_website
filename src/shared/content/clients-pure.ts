/**
 * Pure helpers behind shared/content/clients.ts — no Astro imports, so
 * they run (and are tested) under plain `node --test`.
 */

/** Palette roles a client file defines (see src/content.config.ts). */
export interface Palette {
  bg: string;
  bgElevated: string;
  ink: string;
  inkDim: string;
  accent: string;
}

/** Index of the item after `id` (wraps last → first; unknown id → 0). */
export function nextIndex(ids: readonly string[], id: string): number {
  const i = ids.indexOf(id);
  return i === -1 ? 0 : (i + 1) % ids.length;
}

/**
 * The CSS rule that gives `body[data-chapter="<id>"]` this client's colors.
 * Emitted into the client page's <head>, so the page paints in its palette
 * from the first frame (no flash of the base palette). The ids and colors
 * are schema-validated ([a-z0-9-] file names, #rrggbb), so they're safe to
 * inline.
 */
export function paletteCss(id: string, p: Palette): string {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Invalid client id "${id}"`);
  for (const v of Object.values(p)) {
    if (!/^#[0-9a-fA-F]{6}$/.test(v)) throw new Error(`Invalid color "${v}" for client "${id}"`);
  }
  return (
    `body[data-chapter="${id}"]{` +
    `--chapter-bg:${p.bg};` +
    `--chapter-bg-elevated:${p.bgElevated};` +
    `--chapter-ink:${p.ink};` +
    `--chapter-ink-dim:${p.inkDim};` +
    `--chapter-accent:${p.accent}}`
  );
}

/** WCAG relative luminance of a #rrggbb color. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #rrggbb colors (1 to 21). Body text
 *  needs at least 4.5 to be comfortably readable (WCAG AA). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Minimum contrast for text colors on a client page background. */
export const MIN_TEXT_CONTRAST = 4.5;
