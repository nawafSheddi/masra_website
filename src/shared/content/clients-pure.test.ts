import assert from "node:assert/strict";
import { test } from "node:test";
import { contrastRatio, nextIndex, paletteCss } from "./clients-pure.ts";

const palette = { bg: "#1a0507", bgElevated: "#2b0c10", ink: "#f6e8e6", inkDim: "#b39694", accent: "#c8102e" };

test("nextIndex returns the following item", () => {
  assert.equal(nextIndex(["a", "b", "c"], "a"), 1);
});

test("nextIndex wraps from the last item to the first", () => {
  assert.equal(nextIndex(["a", "b", "c"], "c"), 0);
});

test("nextIndex falls back to the first item for an unknown id", () => {
  assert.equal(nextIndex(["a", "b"], "zzz"), 0);
});

test("paletteCss maps every role onto the --chapter-* tokens", () => {
  const css = paletteCss("peti", palette);
  assert.match(css, /^body\[data-chapter="peti"\]\{/);
  for (const v of Object.values(palette)) assert.ok(css.includes(v));
  assert.ok(css.includes("--chapter-bg-elevated:#2b0c10"));
});

test("paletteCss refuses values that could break out of the rule", () => {
  assert.throws(() => paletteCss("peti", { ...palette, bg: "red}body{x:y" }));
  assert.throws(() => paletteCss('a"]{', palette));
});

test("contrastRatio matches WCAG reference values", () => {
  assert.equal(Math.round(contrastRatio("#000000", "#ffffff")), 21);
  assert.equal(contrastRatio("#777777", "#777777"), 1);
  // Order doesn't matter.
  assert.equal(contrastRatio("#1a0507", "#f6e8e6"), contrastRatio("#f6e8e6", "#1a0507"));
});
