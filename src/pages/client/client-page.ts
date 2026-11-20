import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealChars } from "../../shared/motion/reveals";
import { BASE_CHAPTER, initPaletteTakeover, syncThemeColor } from "../../shared/motion/palette";
import { buildPicture } from "../../shared/ui/picture";
import { campaignById, campaigns, type Campaign, type CampaignId, type ClientTemplate } from "../../config/campaigns.config";
import { strings } from "../../config/strings";
import { clientHref, nextId, resolveClientId } from "../../shared/routing/client-route";
import { mountChapter, type ChapterCopy } from "../../sections/chapters/chapters";
import "../../sections/chapters/layouts"; // registers the bespoke chapter layouts
import { initContact } from "../../sections/contact/contact";
import "./client-page.css";

/**
 * Client page — one client on its own at /work/<id> (client feedback:
 * "if we want to showcase just one client").
 *
 *   ← All work
 *   ARTISTIC PHOTOGRAPHY · 2025
 *   PETI                                   ← client's palette takes over
 *   Art direction · Photography · Packaging
 *   A chocolate house dressed in crimson…
 *   ── that client's bespoke chapter layout (gallery) ──
 *   NEXT PROJECT → IDMI  [lead image]      ← base palette returns
 *   Let's work on your project. [Start your project]
 *
 * Templates: the client asked to start with one template and maybe add
 * more. `campaign.template` picks a builder from TEMPLATES below — a new
 * template is one new builder + one union member in campaigns.config.
 */

type TemplateBuilder = (main: HTMLElement, ctx: MotionContext, campaign: Campaign) => void;

const TEMPLATES: Record<ClientTemplate, TemplateBuilder> = {
  standard: buildStandard,
};

/**
 * Render the page for `id` (from parseClientRoute; null = not a valid
 * client URL). Unknown ids get a friendly not-found block, never a blank
 * page or a thrown error.
 */
export function renderClientPage(main: HTMLElement, ctx: MotionContext, id: string | null): void {
  const known = resolveClientId(id, campaigns.map((c) => c.id));
  const campaign = known ? campaignById[known as CampaignId] : null;
  if (!campaign) {
    buildNotFound(main, ctx);
    return;
  }

  const copy = strings.chapters[campaign.id] as ChapterCopy;
  document.title = `${copy.name}${strings.clientPage.titleSuffix}`;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", `${copy.name} — ${strings.work.categoryLabel[campaign.category]}. ${copy.description}`);

  TEMPLATES[campaign.template](main, ctx, campaign);
}

/** "standard" template: intro → chapter gallery → next project → contact. */
function buildStandard(main: HTMLElement, ctx: MotionContext, campaign: Campaign): void {
  const copy = strings.chapters[campaign.id] as ChapterCopy;

  // Paint the client's palette immediately (no darkroom flash before the
  // observer's first callback).
  document.body.dataset.chapter = campaign.id;
  // The observer skips ids that are already set, so tint the mobile
  // browser bar here too (light palettes would otherwise keep it dark).
  syncThemeColor();

  // --- Intro ---------------------------------------------------------------
  const intro = document.createElement("section");
  intro.className = "client-intro container themed";
  intro.id = "intro";
  intro.dataset.chapterId = campaign.id; // palette target (client palette)

  const back = document.createElement("a");
  back.className = "client-intro__back";
  back.href = "/#work";
  back.textContent = `← ${strings.clientPage.back}`;

  const meta = document.createElement("p");
  meta.className = "eyebrow client-intro__meta";
  meta.textContent = `${strings.work.categoryLabel[campaign.category]} · ${campaign.meta.year}`;

  const title = document.createElement("h1");
  title.className = "client-intro__title display";
  title.textContent = copy.name;

  const tags = document.createElement("ul");
  tags.className = "client-intro__tags";
  for (const tag of copy.tags) {
    const li = document.createElement("li");
    li.textContent = tag;
    tags.appendChild(li);
  }

  const description = document.createElement("p");
  description.className = "client-intro__description";
  description.textContent = copy.description;

  intro.append(back, meta, title, tags, description);
  main.appendChild(intro);

  // --- Gallery: the client's bespoke chapter layout ---------------------
  const chapter = mountChapter(main, ctx, campaign);

  // --- Next project ---------------------------------------------------------
  const next = campaignById[nextId(campaigns.map((c) => c.id), campaign.id) as CampaignId];
  const nextSection = document.createElement("section");
  nextSection.className = "client-next container";
  nextSection.id = "next";
  const nextLink = document.createElement("a");
  nextLink.className = "client-next__link";
  nextLink.href = clientHref(next.id);
  nextLink.dataset.cursor = "view";
  const nextText = document.createElement("div");
  const nextLabel = document.createElement("p");
  nextLabel.className = "eyebrow";
  nextLabel.textContent = strings.clientPage.next;
  const nextName = document.createElement("p");
  nextName.className = "client-next__name display";
  nextName.textContent = `${strings.chapters[next.id].name} →`;
  nextText.append(nextLabel, nextName);
  const nextMedia = document.createElement("div");
  nextMedia.className = "client-next__media";
  nextMedia.appendChild(buildPicture(next.images.lead, { sizes: "(min-width: 900px) 24vw, 40vw" }));
  nextLink.append(nextText, nextMedia);
  nextSection.appendChild(nextLink);
  main.appendChild(nextSection);

  // --- Contact (same closing frame as home) -------------------------------
  initContact(main, ctx);

  // Palette: intro + chapter wear the client's palette; the closing
  // sections hand back to the darkroom base.
  initPaletteTakeover([
    { el: intro, id: campaign.id },
    { el: chapter, id: campaign.id },
    ...Array.from(main.querySelectorAll<HTMLElement>(":scope > section:not(#intro)"), (el) => ({
      el,
      id: BASE_CHAPTER as typeof BASE_CHAPTER,
    })),
  ]);

  // Entrance (helpers no-op under reduced motion).
  revealBlock(ctx, back, { immediate: true });
  revealBlock(ctx, meta, { immediate: true, delay: 0.05 });
  revealChars(ctx, title, { immediate: true, delay: 0.1 });
  revealBlock(ctx, tags, { immediate: true, delay: 0.3 });
  revealBlock(ctx, description, { immediate: true, delay: 0.4 });
  revealBlock(ctx, nextLink);
}

/** Friendly dead end for /work/<unknown>: explains and links back. */
function buildNotFound(main: HTMLElement, ctx: MotionContext): void {
  document.title = `${strings.clientPage.notFoundTitle}${strings.clientPage.titleSuffix}`;
  const section = document.createElement("section");
  section.className = "client-intro client-intro--missing container";
  section.id = "intro";
  const title = document.createElement("h1");
  title.className = "client-intro__title display";
  title.textContent = strings.clientPage.notFoundTitle;
  const body = document.createElement("p");
  body.className = "client-intro__description";
  body.textContent = strings.clientPage.notFoundBody;
  const link = document.createElement("a");
  link.className = "btn btn--cta client-intro__home";
  link.href = "/#work";
  link.textContent = strings.clientPage.notFoundLink;
  section.append(title, body, link);
  main.appendChild(section);
  revealBlock(ctx, section, { immediate: true });
}
