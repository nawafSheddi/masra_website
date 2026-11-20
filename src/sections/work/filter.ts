/**
 * Work-section category model + filter — the pure core behind the
 * All / Artistic / Lifestyle / Menu tabs.
 *
 * The three categories come from the client's feedback (they replace the
 * v2 "Seven Moods"). Which client sits in which category is configured per
 * campaign in campaigns.config.ts (`category` field); display labels live
 * in strings.work. Import-free so `node --test` can run the co-located test.
 */

/** The three photography categories MASRA presents its work under. */
export type WorkCategory = "artistic" | "lifestyle" | "menu";

/** A tab selection: one category, or everything. */
export type WorkFilter = WorkCategory | "all";

/** Tab order, left → right ("all" first). Single source for the UI. */
export const WORK_FILTERS: readonly WorkFilter[] = ["all", "artistic", "lifestyle", "menu"];

/**
 * Items belonging to `filter`, in their original (configured) order.
 * Always returns a fresh array so callers can't mutate the source roster.
 */
export function filterByCategory<T extends { category: WorkCategory }>(
  items: readonly T[],
  filter: WorkFilter
): T[] {
  if (filter === "all") return [...items];
  return items.filter((item) => item.category === filter);
}
