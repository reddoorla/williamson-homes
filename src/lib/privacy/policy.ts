export const PRIVACY_POLICY_DRAFT = true;

export const PRIVACY_PATH = "/privacy";

export function formatEffectiveDate(iso: string | undefined): string | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Google Analytics is disclosed before the code that starts it exists.
 *
 *  The GA4 switch is normally derived from the source (`startsAnalytics` in
 *  ./services.ts finds an `initAnalytics(` call), so the page can never claim a
 *  tag the site does not run. This site gets its tag from
 *  `@reddoorla/maintenance`'s `initAnalytics` (the analytics-tag recipe) in the
 *  PR right after this page, and the policy has to be live before the tag is,
 *  not after. So the switch is forced on here until then.
 *
 *  Set this to false in the PR that adds the tag: from then on the derived
 *  switch carries GA4 by itself. scripts/privacy-services.test.ts goes red if
 *  the tag lands while this is still true, so the override cannot outlive its
 *  reason. */
export const GA4_DISCLOSED_AHEAD_OF_TAG = true;
