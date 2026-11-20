/**
 * Layout registry barrel — importing this module registers every bespoke
 * chapter layout (each file calls registerChapterLayout on evaluation).
 * main.ts imports it before initChapters runs; any layout missing here
 * falls back to the basic editorial stack in chapters.ts.
 */
import "./layout-theatrical";
import "./layout-strip";
import "./layout-stilllife";
import "./layout-picnic";
import "./layout-scrub";
import "./layout-gift";
import "./layout-documentary";
