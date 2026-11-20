/**
 * Guards the Featured-clients roster rules agreed with the user:
 *  - exactly 24 cells (fills every row evenly at 6 / 4 / 3 columns),
 *  - the seven Work clients lead, in Work order,
 *  - slugs are unique (they double as DOM keys and logo filenames),
 *  - logo paths point into public/images/clients/.
 * Run with `npx pnpm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { featuredClients } from "./clients.config.ts";

test("roster has exactly 24 clients", () => {
  assert.equal(featuredClients.length, 24);
});

test("the seven Work clients come first, in Work order", () => {
  assert.deepEqual(
    featuredClients.slice(0, 7).map((c) => c.slug),
    ["peti", "idmi", "labonte", "mamola", "shaya", "riyadh", "maqsoud"]
  );
});

test("slugs are unique", () => {
  const slugs = featuredClients.map((c) => c.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("every logo path lives under /images/clients/", () => {
  for (const c of featuredClients) {
    if (c.logo !== undefined) assert.match(c.logo, /^\/images\/clients\/[a-z0-9-]+\.(svg|png|webp)$/);
  }
});

test("every client has a non-empty display name", () => {
  for (const c of featuredClients) assert.ok(c.name.trim().length > 0, c.slug);
});
