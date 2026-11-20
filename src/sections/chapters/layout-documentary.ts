import type { ChapterBuilder } from "./chapters";
import { registerChapterLayout } from "./chapters";
import { buildPicture } from "../../shared/ui/picture";
import { revealFade } from "../../shared/motion/reveals";

/**
 * Layout 07 — "documentary" (Maqsoud · الدِّيرَة).
 *
 * The register break. Everything the commercial chapters do, this one
 * refuses: no pinning, no scrubbing, no clip curtains — a flowing photo
 * essay with Arabic-first captions in the brand's Arabic face and English
 * secondaries in a quiet serif. Frames surface with opacity-only fades
 * (revealFade); the pacing comes from layout rhythm, not effects.
 *
 * Essay rhythm: lead (full) → pair → solo offset → full → pair.
 */

interface Caption {
  ar: string;
  en: string;
}

/** One essay figure: image + bilingual caption + frame number. */
function figure(
  slug: Parameters<typeof buildPicture>[0],
  caption: Caption,
  frameNo: number,
  sizes: string
): HTMLElement {
  const fig = document.createElement("figure");
  fig.className = "docu__figure";

  fig.appendChild(buildPicture(slug, { sizes }));

  const cap = document.createElement("figcaption");
  cap.className = "docu__caption";

  const num = document.createElement("span");
  num.className = "docu__frame-no";
  num.textContent = String(frameNo).padStart(2, "0");

  const ar = document.createElement("span");
  ar.className = "docu__caption-ar";
  ar.dir = "rtl";
  ar.lang = "ar";
  ar.textContent = caption.ar;

  const en = document.createElement("span");
  en.className = "docu__caption-en";
  en.textContent = caption.en;

  cap.append(num, ar, en);
  fig.appendChild(cap);
  return fig;
}

const buildDocumentary: ChapterBuilder = ({ ctx, campaign, copy, stage }) => {
  const docuCopy = copy as unknown as {
    leadCaptionAr: string;
    leadCaptionEn: string;
    captions: readonly Caption[];
  };

  const essay = document.createElement("div");
  essay.className = "chapter__canvas docu";

  // Lead: full-width establishing shot.
  const lead = figure(
    campaign.images.lead,
    { ar: docuCopy.leadCaptionAr, en: docuCopy.leadCaptionEn },
    0,
    "(min-width: 900px) 70vw, 100vw"
  );
  lead.classList.add("docu__figure--full");
  revealFade(ctx, lead);
  essay.appendChild(lead);

  // Essay rhythm over the 7 frames: [pair] [solo] [full] [pair].
  const groups: { cls: string; idxs: number[] }[] = [
    { cls: "docu__row", idxs: [0, 1] },      // shawarma flame + empty room
    { cls: "docu__solo", idxs: [2] },        // juice machine, offset right
    { cls: "docu__figure--full", idxs: [3] },// fries at the spit
    { cls: "docu__row", idxs: [4, 5] },      // griddle + handoff
    { cls: "docu__solo", idxs: [6] },        // closing table shot
  ];

  for (const group of groups) {
    const isRow = group.cls === "docu__row";
    const host = isRow ? document.createElement("div") : essay;
    if (isRow) host.className = "docu__row";

    for (const i of group.idxs) {
      const slug = campaign.images.frames[i];
      const fig = figure(slug, docuCopy.captions[i], i + 1, isRow ? "(min-width: 900px) 34vw, 90vw" : "(min-width: 900px) 55vw, 100vw");
      if (!isRow) fig.classList.add(group.cls);
      revealFade(ctx, fig, isRow ? group.idxs.indexOf(i) * 0.15 : 0);
      host.appendChild(fig);
    }
    if (isRow) essay.appendChild(host);
  }

  stage.appendChild(essay);
};

registerChapterLayout("documentary", buildDocumentary);
