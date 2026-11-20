# 2026-08-05 — First Cloudflare Pages deployments (masra-v2 + masra-v1)

## What changed

- Created the Cloudflare Pages project `masra-v2` (production branch:
  `v2-seven-moods`) and shipped the first production deployment of the
  v2 "Seven Moods" site to <https://masra-v2.pages.dev>.
- Created the Cloudflare Pages project `masra-v1` (production branch:
  `main`) and deployed the v1 site to <https://masra-v1.pages.dev>,
  built from a temporary git worktree of `main` so the uncommitted v2
  working tree was never touched. v1 build: 41.26 KB gzipped JS /
  3.49 KB CSS, 122 files, 7 MB total. Same live verification as v2:
  200s, immutable image cache headers, hero verified visually, zero
  console errors.
- Deployed via CLI: `npx wrangler pages deploy dist
  --project-name=masra-v2 --branch=v2-seven-moods` — no dashboard/CI
  setup, no environment variables, no Functions.

## Why

- The client will review v2 alongside the v1 site (to be deployed
  later from `main` as a separate Pages project), then pick a
  direction before a custom domain (masra.sa) is attached.

## Verification

- `npx pnpm build` clean: tsc passes, bundle 56.23 KB gzipped JS /
  5.48 KB CSS. Upload: 377 files, 26 MB total, largest asset < 1 MB —
  all well inside Pages limits (25 MB per file, 20k files).
- Live checks after edge propagation (~1 min of 522s is normal for a
  brand-new subdomain): HTML serves 200; `public/_headers` policy
  confirmed live (`cache-control: public, max-age=31536000, immutable`
  on /images/*); zero console errors; hero, preloader, and the IDMI
  chapter (palette takeover + strip layout) verified visually in the
  browser.

## Notes

- Deployed from the working tree with `--commit-dirty=true`; the
  v2 branch changes were not yet committed at deploy time.
- Programmatic `window.scrollTo` bypasses Lenis, so scroll-driven
  palette flips don't fire under script-driven scrolling — native
  wheel/touch input works fine. Only relevant for automation, not
  users.
