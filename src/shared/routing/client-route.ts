/**
 * Client-page URL helpers — the pure core of the `/work/<id>` routing.
 *
 * Every client (campaign) has a shareable page at `/work/<id>`. In
 * production Cloudflare Pages rewrites `/work/*` to `work.html`
 * (public/_redirects); in dev/preview a Vite middleware does the same
 * (vite.config.ts). Both — and the page itself — decide "is this a client
 * URL, and which client?" with `parseClientRoute`, so the rule lives in
 * exactly one place.
 *
 * Deliberately import-free: Node's test runner executes the co-located
 * test file directly, and vite.config.ts imports this module at build time.
 */

/** `/work/<id>` or `/work/<id>/`, id = lowercase slug (a–z, 0–9, hyphen).
 *  Uppercase is rejected on purpose: ids are canonical lowercase, so
 *  `/work/PETI` resolves to the not-found block instead of a duplicate URL. */
const CLIENT_ROUTE = /^\/work\/([a-z0-9-]+)\/?$/;

/**
 * Extract the client id from a URL pathname.
 * @returns the id, or `null` when the path is not a client page.
 */
export function parseClientRoute(pathname: string): string | null {
  const match = CLIENT_ROUTE.exec(pathname);
  return match ? match[1] : null;
}

/**
 * Does this path belong to the client-page template? Mirrors Cloudflare's
 * `/work/*` rewrite (public/_redirects) exactly — ANY path under /work/,
 * valid id or not — so the dev/preview servers behave like production and
 * bad ids (e.g. /work/PETI) reach the template's not-found block instead
 * of falling through to the home page.
 */
export function isWorkPath(pathname: string): boolean {
  return pathname.startsWith("/work/");
}

/**
 * The id if it names a real client, else null. Checks membership in the
 * explicit id list — never `id in someObject`, which also matches
 * inherited keys (`/work/constructor` once crashed the page that way).
 */
export function resolveClientId(id: string | null, knownIds: readonly string[]): string | null {
  return id !== null && knownIds.includes(id) ? id : null;
}

/** Canonical URL of a client page (cards, "next project" links). */
export function clientHref(id: string): string {
  return `/work/${id}`;
}

/**
 * The id after `current` in `ids`, wrapping around at the end — drives the
 * "Next project" link so the last client leads back to the first.
 * An unknown `current` (shouldn't happen, but never dead-end) → first id.
 */
export function nextId(ids: readonly string[], current: string): string {
  const i = ids.indexOf(current);
  if (i === -1) return ids[0];
  return ids[(i + 1) % ids.length];
}
