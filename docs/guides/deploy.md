# Putting the site on MASRA's Cloudflare account

The site is static: `npx pnpm build` writes plain files to `dist/`, and
Cloudflare serves them. The recommended setup connects the GitHub repo, so
**every push to `master` publishes the site automatically**.

## One-time setup (Cloudflare dashboard)

1. Log in to the studio's Cloudflare account and open **Workers & Pages**,
   then **Create** and **Import a repository**.
2. Connect GitHub and pick the website repo.
3. Build settings:
   - **Build command:** `npx pnpm install --frozen-lockfile && npx pnpm build`
   - **Deploy command:** `npx wrangler deploy` (uses `wrangler.jsonc` in the repo)
   - **Production branch:** `master`
   - Node version: taken from `.node-version` (24).
4. Save and deploy. The first build takes a minute or two. Cloudflare gives
   you a `*.workers.dev` address to check the site on.
5. **Custom domain:** open the project's **Settings**, then **Domains &
   Routes**, then **Add**, and enter `masra.sa` (and `www.masra.sa` if
   wanted). The domain must be on the same Cloudflare account.
6. The site's address for share cards, search engines and the sitemap is
   `site` in `astro.config.mjs` (`https://masra.sa`). Until masra.sa points
   at this project, share-card images won't load. For a preview on another
   address, build with that address:
   `npx pnpm build -- --site https://<preview-address>`.

From then on, every push to `master` publishes in about a minute. Pushes to
other branches build preview versions, so you can check a change before it
goes live.

## What's already configured in the repo

| File | What it does |
|---|---|
| `wrangler.jsonc` | Serves `dist/`; unknown URLs get the 404 page with a real 404 status; `/work/peti` serves `work/peti.html` |
| `public/_headers` | Caching: images, fonts and video cached for a year (their names never change); logos and share cards for a day |
| `public/_redirects` | `/work` (no client) sends visitors to the Work grid |

## Deploying by hand (without the GitHub connection)

```bash
npx pnpm build
npx wrangler login     # once, opens the browser
npx wrangler deploy
```

## Check after any hosting change

- `/`, `/work/peti` and every other client page load (no redirect loop)
- `/work/does-not-exist` shows "Page not found"
- Sharing a client link in WhatsApp shows that client's photo and name
