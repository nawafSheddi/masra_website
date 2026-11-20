---
name: add-photos
description: Add, replace or remove photos on a MASRA client page (from a file the owner attaches or a Google Drive download). Use when the owner asks to add/change/remove photos or the main image of a client.
---

Follow `AGENTS.md`: **Recipes → Add photos to a client** (and **Replace a
photo**). In short:

1. Get the original photo path from the owner (attachment or Drive download).
2. `npx pnpm media:add --client <id> --file "<path>"` (`--lead` for the
   main photo, `--role feature` for big shots).
3. Paste the printed YAML into `src/content/clients/<id>.yaml` with real alt
   text describing the photo.
4. `npx pnpm check`, then preview `/work/<id>` at desktop and 390px width,
   and show the owner a screenshot.
5. Ask before committing. Commit the new `public/images/<id>/` files, the
   manifest and the YAML.
