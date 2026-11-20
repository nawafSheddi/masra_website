# 2026-11-20 — `master` becomes the main (handover) branch

## What changed

- Committed the v2 "Seven Moods" site that had been deployed to
  <https://masra-v2.pages.dev> on 2026-08-05 from an uncommitted working
  tree (`--commit-dirty=true`). Until this commit the live site had no
  matching commit in git history.
- Created the `master` branch from that commit. `master` is now the main
  branch and the one handed over to the client; it is checked out as
  `HEAD`, so a `git clone` of this repo lands on it by default.
- Renamed the old `main` branch (the v1 site, deployed to
  <https://masra-v1.pages.dev>) to `v1`. Nothing was deleted.
- Kept `v2-seven-moods` as-is; it points at the same commit as `master`.
- Added `lessons-learned/` (with `INDEX.md`) per the project conventions.

## Why

- The client is getting the v2 design. `master` is the one clear branch
  that holds exactly what is live at masra-v2.pages.dev, with full history
  (v1 → v2) kept for traceability.

## Verification

- Before committing: every file in `src/`, `public/` and `index.html` was
  unchanged since the deploy. Sampled `public/` files matched the live site
  byte-for-byte, and the live JS/CSS contained all of the working tree's
  copy strings, design tokens and chapter classes.
- After committing: built `master` from a clean worktree with a frozen
  lockfile and compared the output with the live deployment (see the
  session notes for hash results).

## Notes

- Cloudflare Pages deploys are CLI uploads (`wrangler pages deploy
  --branch=<name>`), not git-connected, so renaming branches does not
  affect the live sites. The `--branch` value is only a label:
  - masra-v2's production branch label is still `v2-seven-moods`. Deploy
    `master` to production with `--branch=v2-seven-moods`, or change the
    project's production branch to `master` in the Cloudflare dashboard.
  - masra-v1's production branch label is still `main`. Redeploying v1 to
    production still needs `--branch=main`, even though the git branch is
    now `v1`.
- The repo has no git remote yet. When it is pushed (to the client's or
  your own host), set `master` as the default branch there.
