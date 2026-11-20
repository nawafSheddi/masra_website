/**
 * Client page behavior (/work/<id>; markup from pages/work/[id].astro).
 *
 * The body already wears the client's palette from the first paint
 * (BaseLayout sets data-chapter + the palette CSS). Here: intro entrance,
 * the gallery layout's motion, contact, and the palette takeover — the
 * intro + gallery keep the client's colors, the closing sections hand back
 * to the darkroom base.
 */
import { boot } from "./boot";
import { BASE_CHAPTER, initPaletteTakeover } from "../shared/motion/palette";
import { revealBlock, revealChars } from "../shared/motion/reveals";
import { initGallery } from "../sections/gallery/gallery";
import { initContact } from "../sections/contact/contact";

// Each client page starts at the top (no restored mid-page offset from a
// different client's layout).
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

const { ctx, main } = boot({ home: false });

const intro = document.getElementById("intro")!;
const gallery = main.querySelector<HTMLElement>(".chapter")!;
const clientId = intro.dataset.chapterId!;

initGallery(gallery, ctx);
initContact(document.getElementById("contact")!, ctx);

initPaletteTakeover([
  { el: intro, id: clientId },
  { el: gallery, id: clientId },
  ...Array.from(main.querySelectorAll<HTMLElement>(":scope > section:not(#intro)"), (el) => ({
    el,
    id: BASE_CHAPTER,
  })),
]);

// Entrance (helpers no-op under reduced motion).
const q = (sel: string) => intro.querySelector<HTMLElement>(sel)!;
revealBlock(ctx, q(".client-intro__back"), { immediate: true });
revealBlock(ctx, q(".client-intro__meta"), { immediate: true, delay: 0.05 });
revealChars(ctx, q(".client-intro__title"), { immediate: true, delay: 0.1 });
revealBlock(ctx, q(".client-intro__tags"), { immediate: true, delay: 0.3 });
revealBlock(ctx, q(".client-intro__description"), { immediate: true, delay: 0.4 });
revealBlock(ctx, document.querySelector<HTMLElement>(".client-next__link")!);
