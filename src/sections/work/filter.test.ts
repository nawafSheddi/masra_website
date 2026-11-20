/**
 * Tests for the Work-section category filter (pure, no DOM).
 * See client-route.test.ts for how these run (node --test, type stripping).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filterByCategory, type WorkCategory } from "./filter.ts";

/** Minimal fixtures shaped like campaigns — only `category` matters. */
const items: ReadonlyArray<{ id: string; category: WorkCategory }> = [
  { id: "peti", category: "artistic" },
  { id: "riyadh", category: "menu" },
  { id: "mamola", category: "lifestyle" },
  { id: "maqsoud", category: "menu" },
];

test("'all' returns every item in original order", () => {
  const result = filterByCategory(items, "all");
  assert.deepEqual(result.map((i) => i.id), ["peti", "riyadh", "mamola", "maqsoud"]);
});

test("'all' returns a new array, not the input", () => {
  assert.notEqual(filterByCategory(items, "all"), items);
});

test("a category keeps only matching items, in original order", () => {
  assert.deepEqual(filterByCategory(items, "menu").map((i) => i.id), ["riyadh", "maqsoud"]);
});

test("a category with no items returns an empty array", () => {
  assert.deepEqual(filterByCategory([{ id: "x", category: "menu" as const }], "artistic"), []);
});
