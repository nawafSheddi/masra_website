import type { MotionContext } from "../../shared/motion/motion-context";
import { revealBlock, revealChars } from "../../shared/motion/reveals";
import { strings } from "../../config/strings";
import { buildCasePeti } from "./case-peti";
import { buildCaseIdmi } from "./case-idmi";
import { buildCaseLevo } from "./case-levo";
import "./work.css";

/**
 * Work — the portfolio's heart: section header + three case studies,
 * each with its own signature layout (vertical editorial / horizontal
 * film-strip / pinned centerpiece). Case order mirrors the shoots'
 * visual escalation: red drama → bright energy → baroque finale.
 */
export function initWork(root: HTMLElement, ctx: MotionContext): void {
  const section = document.createElement("section");
  section.className = "work";
  section.id = "work";

  const header = document.createElement("header");
  header.className = "work__header container";
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = strings.work.eyebrow;
  const title = document.createElement("h2");
  title.className = "work__title display";
  title.textContent = strings.work.title;
  header.append(eyebrow, title);
  section.appendChild(header);

  section.append(buildCasePeti(ctx), buildCaseIdmi(ctx), buildCaseLevo(ctx));
  root.appendChild(section);

  revealBlock(ctx, eyebrow);
  revealChars(ctx, title);
}
