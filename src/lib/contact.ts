export const CONTACT_EMAIL = "info@williamson-homes.com";
export const CONTACT_PHONE_DISPLAY = "310.570.7278";
export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;
export const CONTACT_PHONE_HREF = "tel:3105707278";

export const NAV_LINKS = [
  { label: "Projects", href: "/projects" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about-us" },
  { label: "Contact Us", href: "/contact" },
  { label: "Projects", href: "/projects" },
] as const;

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
