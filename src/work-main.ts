/**
 * MASRA Studio v3 — client page entry (`/work/<id>`, served by work.html).
 *
 * Shared boot (header, Lenis, cursor…), then the client-page template for
 * the id in the URL. The pure `parseClientRoute` decides the id — the same
 * function the dev/preview rewrite uses — so "which URLs are client pages"
 * has one definition.
 */
import { boot } from "./shared/boot";
import { parseClientRoute } from "./shared/routing/client-route";
import { renderClientPage } from "./pages/client/client-page";

// Each client page starts at the top (no restored mid-page offset from a
// different client's layout).
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

const { ctx, main } = boot({ home: false });
renderClientPage(main, ctx, parseClientRoute(location.pathname));
