# 2026-11-20 — Client handover: v3 merged, repo cleaned for AI-assisted editing

## Why

The site goes to MASRA today. The owner doesn't code; he will update
content and images through Claude Code / Codex. The repo has to be
self-explanatory to an AI agent, and safe to edit from a fresh clone that
doesn't have the 5 GB of raw photos.

## What changed

- **v3 merged into `master`** after a review and test pass:
  - clean clone: `npx pnpm install --frozen-lockfile`, 25/25 tests, and the build all pass;
  - Cloudflare's real Pages handler (`wrangler pages dev`): every
    `/work/<id>`, `/work/nope` and `/work/PETI` return 200 and render;
  - checked in a browser: desktop 1440, mobile 390 (menu, nav jumps, Work
    filter), and reduced motion.
- **The image script works from a fresh clone.** `scripts/optimize-images.mjs`
  used to stop at the first raw photo that wasn't on disk. It now keeps
  already-optimized images whose raw file isn't on this machine and only
  processes the new ones, so the manifest never loses entries. A *new*
  entry without its file still fails, with a message that says where to put
  it. The OG card is kept too when its source is missing.
- **New `AGENTS.md`**, with `CLAUDE.md` importing it: who the owner is, the
  content map (which file to edit for what), recipes, commands, the
  verification routine (test, build, preview, screenshot), and never-do
  rules.
- **`README.md`:** a plain-language section for the owner at the top, plus
  steps for connecting his own Cloudflare account.
- **Repo hygiene:**
  - `.wrangler/` local state is no longer committed and is now ignored.
  - `.gitignore` now says the brand kit is tracked on purpose (it was
    listed as ignored while being tracked).
  - Internal dev docs (v3 spec and plan, inspiration research) are kept
    locally on the developer's machine instead of in the repo.

## Review fixes (fresh review of the v3 diff)

- **Mobile menu:** on short screens (landscape phones) the panel now
  scrolls, so Clients and Contact can be reached. Verified at 667×375.
- **Focus follows nav jumps:** after a header link (or a mobile-menu link)
  scrolls to a section, keyboard focus moves there, so the next Tab
  continues from that section instead of the top of the page. The query
  string (e.g. campaign tracking) is kept in the URL.
- **320px phones:** no horizontal overflow on the home page or any client
  page:
  - the logo grid uses `minmax(0, 1fr)` and wraps long names;
  - the header drops the CTA arrow below 360px;
  - the next-project block can shrink.
- **Bare `/work`** now goes to the Work grid instead of "Project not found".
- **Not-found pages** (`/work/<unknown>`) get `noindex`, so search engines
  don't index them.
- **A malformed URL hash** (e.g. `/#%E0`) no longer throws.
- **Screen readers:**
  - images inside links (work cards, next project) are decorative
    (`alt=""`), so the link is announced by the client's name, not the
    photo description;
  - arrow glyphs are hidden from screen readers.
- **Email subject line** moved into `strings.ts` (i18n rule).
- **Not fixed (low impact, noted for later):**
  - the preloader and the menu share one scroll-lock switch;
  - after Back from a filtered Work grid, the filter resets to All;
  - the `·` separators are still in section code;
  - the logo-wall ink filter isn't a token.

## Verification

See the commands above. The image script was also run in a clean clone
(no raw photos): the manifest was unchanged. A simulated new photo went
from 44 to 45 manifest entries, with only the new derivatives written.

## Still open with the client

1. Approve or edit the six service descriptions (still drafts).
2. Send vector logos: 20 of the 24 logo-wall cells are text placeholders.
3. Confirm the category mapping and the 24 featured clients.
