import { asLink, isFilled, type LinkField } from "@prismicio/client";

import { linkResolver } from "$lib/prismicio";

export type ButtonItem = { href: string; label: string };

export function hrefOf(field: LinkField | null | undefined): string | null {
  if (!field || !isFilled.link(field)) return null;
  return asLink(field, { linkResolver }) ?? null;
}

export function buttonsOf<T extends { button_label: string | null; button_link: LinkField }>(
  items: readonly T[],
): Array<ButtonItem & { item: T }> {
  const out: Array<ButtonItem & { item: T }> = [];
  for (const item of items) {
    const href = hrefOf(item.button_link);
    if (href && item.button_label) out.push({ href, label: item.button_label, item });
  }
  return out;
}
