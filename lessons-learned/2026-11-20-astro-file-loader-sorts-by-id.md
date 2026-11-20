# Astro collections come back sorted by id, not in file order

**Date:** 2026-11-20 · **Where:** `src/content.config.ts`

## What happened
`services.yaml` and `featured-clients.yaml` rendered alphabetically ("Art
Direction" first) even though the files list them in display order. The
page-height parity check passed anyway, because every row is the same
height.

## Root cause
`getCollection()` returns entries ordered by id, and the `file()` loader
doesn't keep the array order.

## Rule
- Any list where order matters needs an explicit position. Here,
  `orderedList()` in `content.config.ts` records each entry's index at
  load time, and the getters sort by it. Clients use an explicit `order:`
  field.
- Parity checks must compare **content order** (names in sequence), not
  just layout sizes.
