# Lessons learned

- 2026-11-20 — [npx without node_modules runs a stranger's package](2026-11-20-npx-without-node-modules.md) — bare `npx tsc` fetched `tsc@2.0.4`; install first or use `npx -p typescript tsc`
- 2026-11-20 — [Lenis: scroll-margin is already honoured, and the limit is 0 at boot](2026-11-20-lenis-scroll-margin-and-limit.md) — never pass `offset` with CSS scroll-margin; `lenis.resize()` before post-boot jumps
- 2026-11-20 — [`git add x && git commit` takes the whole index](2026-11-20-git-commit-takes-the-whole-index.md) — check `git diff --cached --stat` before partial commits
- 2026-11-20 — [Astro collections come back sorted by id](2026-11-20-astro-file-loader-sorts-by-id.md) — ordered lists need an explicit position; parity checks must compare order
