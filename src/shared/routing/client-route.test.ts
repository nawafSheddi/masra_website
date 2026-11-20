/**
 * Tests for the client-page URL helpers (pure, no DOM).
 *
 * Run with `npx pnpm test` — Node's built-in runner executes this file
 * directly (native TypeScript type stripping, no test framework installed).
 * Relative imports carry the `.ts` extension because Node resolves files
 * literally; tsconfig excludes *.test.ts from the app typecheck.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { clientHref, isWorkPath, nextId, parseClientRoute, resolveClientId } from "./client-route.ts";

test("parseClientRoute reads the id from /work/<id>", () => {
  assert.equal(parseClientRoute("/work/peti"), "peti");
});

test("parseClientRoute tolerates a trailing slash", () => {
  assert.equal(parseClientRoute("/work/peti/"), "peti");
});

test("parseClientRoute accepts hyphenated ids", () => {
  assert.equal(parseClientRoute("/work/la-bonte"), "la-bonte");
});

test("parseClientRoute rejects uppercase ids (ids are lowercase slugs)", () => {
  assert.equal(parseClientRoute("/work/PETI"), null);
});

test("parseClientRoute rejects a missing id", () => {
  assert.equal(parseClientRoute("/work/"), null);
  assert.equal(parseClientRoute("/work"), null);
});

test("parseClientRoute rejects non-work paths", () => {
  assert.equal(parseClientRoute("/"), null);
  assert.equal(parseClientRoute("/about/peti"), null);
});

test("parseClientRoute rejects deeper paths", () => {
  assert.equal(parseClientRoute("/work/peti/extra"), null);
});

test("isWorkPath matches everything Cloudflare's /work/* rule rewrites", () => {
  assert.equal(isWorkPath("/work/peti"), true);
  assert.equal(isWorkPath("/work/PETI"), true); // template shows not-found
  assert.equal(isWorkPath("/work/peti/extra"), true);
  assert.equal(isWorkPath("/work/"), true);
});

test("isWorkPath leaves other paths alone", () => {
  assert.equal(isWorkPath("/"), false);
  assert.equal(isWorkPath("/work"), false);
  assert.equal(isWorkPath("/work.html"), false);
  assert.equal(isWorkPath("/workshop/x"), false);
});

test("clientHref builds the canonical client URL", () => {
  assert.equal(clientHref("idmi"), "/work/idmi");
});

test("nextId wraps from the last id to the first", () => {
  assert.equal(nextId(["a", "b", "c"], "c"), "a");
});

test("nextId returns the following id", () => {
  assert.equal(nextId(["a", "b"], "a"), "b");
});

test("nextId falls back to the first id when current is unknown", () => {
  assert.equal(nextId(["a"], "zzz"), "a");
});

test("resolveClientId accepts a known id", () => {
  assert.equal(resolveClientId("peti", ["peti", "idmi"]), "peti");
});

test("resolveClientId rejects unknown ids and null", () => {
  assert.equal(resolveClientId("nope", ["peti"]), null);
  assert.equal(resolveClientId(null, ["peti"]), null);
});

test("resolveClientId rejects inherited object keys like 'constructor'", () => {
  // Regression: `id in campaignById` matched Object.prototype keys and
  // /work/constructor crashed the page with a TypeError.
  assert.equal(resolveClientId("constructor", ["peti"]), null);
  assert.equal(resolveClientId("tostring", ["peti"]), null);
});
