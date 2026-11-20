# Lessons learned

- 2026-11-20 — [npx without node_modules runs a stranger's package](2026-11-20-npx-without-node-modules.md) — bare `npx tsc` fetched `tsc@2.0.4`; install first or use `npx -p typescript tsc`
- 2026-11-20 — [Lenis: scroll-margin is already honoured, and the limit is 0 at boot](2026-11-20-lenis-scroll-margin-and-limit.md) — never pass `offset` with CSS scroll-margin; `lenis.resize()` before post-boot jumps
