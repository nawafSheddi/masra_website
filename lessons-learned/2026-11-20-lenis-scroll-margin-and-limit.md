# Lenis: scroll-margin is already honoured, and the limit is 0 at boot

**Date:** 2026-11-20 · **Where:** `src/shared/motion/smooth-scroll.ts`

## What happened

1. Header nav jumps landed sections one full header-height too low
   (heading at 138px instead of 69px).
2. Deep links like `/#work` silently stayed at the top of the page in a
   fresh Chrome tab (worked by luck in another browser).

## Root cause

1. Lenis 1.3's `scrollTo(element)` already reads the element's CSS
   `scroll-margin-top`. We set `scroll-margin-top: var(--header-h)` on
   sections (for the native/reduced-motion path) **and** passed
   `offset: -headerHeight` → offset applied twice.
2. The page is built by JS after Lenis is created. Until Lenis' resize
   observer runs, its scroll `limit` is ~0, so an immediate `scrollTo`
   right after boot clamps to 0.

## Rule

- Put the fixed-header offset in CSS `scroll-margin-top` only; never also
  pass `offset` to `lenis.scrollTo` for elements.
- Before any programmatic jump that can happen right after boot, call
  `lenis.resize()` and wait for `document.fonts.ready` + one frame.
- Verify deep links in a **fresh** tab, measuring
  `el.getBoundingClientRect().top` against the header height — never
  trust a screenshot taken mid-scroll or from a hidden/background pane.
