import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealChars } from "../../shared/motion/reveals";

/**
 * Shared case-study header: mono index eyebrow, display brand name,
 * discipline tags, short description. All three cases use this so the
 * section keeps one visual grammar while each case's imagery layout differs.
 */
export interface CaseCopy {
  index: string;
  name: string;
  tags: readonly string[];
  description: string;
}

export function buildCaseHeader(ctx: MotionContext, copy: CaseCopy): DocumentFragment {
  const frag = document.createDocumentFragment();

  const header = document.createElement("header");
  header.className = "case__header container";

  const index = document.createElement("p");
  index.className = "eyebrow";
  index.textContent = copy.index;

  const name = document.createElement("h3");
  name.className = "case__name display";
  name.textContent = copy.name;

  const tags = document.createElement("ul");
  tags.className = "case__tags";
  for (const tag of copy.tags) {
    const li = document.createElement("li");
    li.textContent = tag;
    tags.appendChild(li);
  }

  header.append(index, name, tags);

  const description = document.createElement("p");
  description.className = "case__description container";
  description.textContent = copy.description;

  frag.append(header, description);

  // Header choreography: name springs in per-character, copy rises after.
  revealChars(ctx, name);
  revealBlock(ctx, index);
  revealBlock(ctx, description, { delay: 0.15 });

  return frag;
}
