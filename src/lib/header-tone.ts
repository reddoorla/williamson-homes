import type { PageDocument } from "../prismicio-types";

export type HeaderTone = "light" | "dark";

export function headerToneFor(page: Pick<PageDocument, "data">): HeaderTone {
  const first = page.data.slices?.[0];
  if (first?.slice_type !== "page_hero") return "dark";
  return first.primary.text_tone === "dark" ? "dark" : "light";
}
