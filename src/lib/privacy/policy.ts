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

/** Google Analytics was disclosed ahead of its tag while the tag PR was
 *  pending. The tag now ships (src/hooks.client.ts), so the GA4 switch is
 *  derived from the source like every other service, and this stays false.
 *  scripts/privacy-services.test.ts goes red if it is ever true while the tag
 *  is present. */
export const GA4_DISCLOSED_AHEAD_OF_TAG = false;
