---
name: publish
description: Publish the MASRA website changes (commit + push so Cloudflare deploys). Use when the owner says publish, go live, upload the changes, or update the site.
---

1. `git status`, then summarize the pending changes for the owner in plain
   words.
2. `npx pnpm check` must pass.
3. Ask: "Publish these changes to the live site?" Wait for a clear yes.
4. Commit with a short, plain message, then `git push` to `master`. Never
   force-push.
5. Cloudflare builds and publishes in about a minute (if the project is
   connected; see `docs/guides/deploy.md`). Then open the live page that
   changed and confirm it shows the update.
