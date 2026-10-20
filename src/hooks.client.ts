import type { ClientInit } from "@sveltejs/kit/hooks";
import { initAnalytics } from "@reddoorla/maintenance/client";

/**
 * GA4, started once when the client app boots.
 *
 * The tag is INERT anywhere but the production hostname and its apex/www twin:
 * localhost, the dev server, Netlify deploy previews and branch deploys never
 * reach the property. That is not tidiness. Reddoor's own property holds 13,312
 * localhost users against 105 real ones for the 30 days to 2026-09-14, from the
 * smoke suite tripping the tag's interaction gate, and GA4 cannot delete that
 * after the fact.
 *
 * The measurement ID below is public by design — it ships in the page. The
 * NUMERIC property ID the monthly report reads is a different value and lives
 * on the site's row in the fleet database. `reddoor-maint audit --fleet turso
 * --only analytics`, run centrally, checks that the two still describe the same
 * site; run from this checkout alone it has no row to pair with.
 */
export const init: ClientInit = () => {
  initAnalytics({
    measurementId: "G-21KD0G311C",
    productionHost: "www.williamson-homes.com",
  });
};
