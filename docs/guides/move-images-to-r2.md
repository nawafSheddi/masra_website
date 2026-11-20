# Serving images from an R2 bucket

By default, images and video are served by the site itself (from
`public/images` and `public/video`). Moving them to an R2 bucket is optional.
It keeps them separate from the site and makes deploys lighter. The site
switches over with **one setting**, and switches back by removing it.

## 1. Create the bucket (Cloudflare dashboard)

1. Open **R2 Object Storage**, then **Create bucket**, named e.g. `masra-media`.
2. In the bucket's **Settings**, under **Public access**, choose **Custom
   Domains** and **Connect Domain**, then enter e.g. `media.masra.sa`. The
   domain must be on the same Cloudflare account.
   - Don't use the `r2.dev` address for the live site: Cloudflare
     rate-limits it and it doesn't cache.
3. Optional, recommended: on the `masra.sa` zone, open **Caching** and
   enable **Tiered Cache**.

## 2. Upload the files

```bash
cp .env.example .env        # then set R2_BUCKET=masra-media in .env
npx wrangler login          # once
npx pnpm media:upload --dry-run   # see what will be uploaded
npx pnpm media:upload
```

Every file keeps its path (`images/peti/peti-lead-960.avif`), with the same
cache rules as the site.

## 3. Switch the site over

In the Cloudflare project, open **Settings**, then **Variables and Secrets**
(build variables), and add:

```
PUBLIC_MEDIA_BASE_URL = https://media.masra.sa
```

Redeploy. Every image, video, logo and share-card URL now points at the
bucket. To verify, open a client page and check that photos load from
`media.masra.sa` (browser dev tools, Network tab).

## After the switch: adding photos

`media:add` still writes into `public/images` and the manifest, so the repo
stays the source of truth. After adding photos, run `npx pnpm media:upload`
(or `--only images/<client>` for just one client), then push.

## Switching back

Remove `PUBLIC_MEDIA_BASE_URL` and redeploy. The files in `public/` are
still in the repo.

## Notes

- The stop-motion canvas draws frames from the bucket without any CORS
  setup, because the canvas is only painted, never read back.
- The R2 switch lives in `src/shared/media/media-url.ts`.
