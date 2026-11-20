# `npx <bin>` without node_modules runs a stranger's package

## What happened

While checking whether masra-v2.pages.dev matched the repo, `npx tsc
--noEmit` was run in a checkout with no `node_modules/`. Instead of
TypeScript's compiler, npx downloaded and ran the unrelated registry
package `tsc@2.0.4` (a deprecated placeholder that only prints a warning).
It did no harm, but it could have been any package.

## Root cause

`npx <name>` resolves a *package* named `<name>` when no local binary
exists. The TypeScript binary is `tsc` but its package is `typescript`, so
the lookup fell through to the npm registry's `tsc` package.

## Rule

- Before running any project binary through `npx`, check that
  `node_modules/` exists (`npx pnpm install --frozen-lockfile` first).
- When a binary must run without an install, name the package
  explicitly: `npx -p typescript tsc`, never bare `npx tsc`.
- Prefer the project's own scripts (`npx pnpm build`), which resolve
  binaries from `node_modules/.bin` only.
