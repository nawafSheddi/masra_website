import assert from "node:assert/strict";
import { test } from "node:test";
import { derivativeFiles, nextSlug, parseArgs, widthsFor, ID_PATTERN } from "./media-core.mjs";

test("widthsFor never upscales past the original", () => {
  assert.deepEqual(widthsFor("feature", 2000), [480, 960, 1600]);
  assert.deepEqual(widthsFor("feature", 6000), [480, 960, 1600, 2400]);
});

test("widthsFor keeps a tiny photo at its own width", () => {
  assert.deepEqual(widthsFor("grid", 300), [300]);
});

test("widthsFor rejects unknown roles", () => {
  assert.throws(() => widthsFor("huge", 2000), /Unknown role/);
});

test("nextSlug continues after the highest existing number", () => {
  assert.equal(nextSlug("peti", ["peti-photo-1", "peti-photo-3", "peti-lead", "idmi-photo-9"]), "peti-photo-4");
});

test("nextSlug starts at 1 for a new client", () => {
  assert.equal(nextSlug("newco", ["peti-lead"]), "newco-photo-1");
});

test("derivativeFiles lists avif + webp per width", () => {
  assert.deepEqual(derivativeFiles("a", { widths: [480, 960] }), ["a-480.avif", "a-480.webp", "a-960.avif", "a-960.webp"]);
});

test("parseArgs reads values and flags", () => {
  assert.deepEqual(parseArgs(["x", "--client", "peti", "--lead"]), { _: ["x"], client: "peti", lead: true });
});

test("ID_PATTERN accepts kebab-case ids only", () => {
  assert.ok(ID_PATTERN.test("la-bonte"));
  assert.ok(!ID_PATTERN.test("La Bonté"));
  assert.ok(!ID_PATTERN.test("../x"));
});
