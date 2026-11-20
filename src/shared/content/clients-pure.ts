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
