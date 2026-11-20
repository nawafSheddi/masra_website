# `git add <path> && git commit` commits everything already staged

**Date:** 2026-11-20

## What happened
Earlier deletions (`git rm --cached docs/...`) were already staged. Then
`git add src && git commit` was meant to commit only `src/`, but the
docs deletions landed in that commit too.

## Root cause
`git commit` (without paths) commits the whole index, not just what the
last `git add` added.

## Rule
Before a commit that should hold only part of the changes, run
`git diff --cached --stat` and check the list. Or commit with explicit
paths: `git commit -- <paths>`. Fix a wrong split before pushing
(`git reset --soft <base>` and re-commit). Never fix it after pushing.
