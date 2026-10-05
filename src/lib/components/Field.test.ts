import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Field from "./Field.svelte";

afterEach(() => cleanup());

/** sRGB, each channel 0–1 and gamma-encoded: the space a browser blends in. */
type Rgb = number[];

/** A resting colour class, read: the class, and its colour and alpha when they
 *  can be measured. One that cannot be is still a colour — it fails as
 *  unmeasured rather than being skipped. */
type Paint = { cls: string; rgb?: Rgb; alpha?: number };

/** `--color-*` declarations in a stylesheet, as raw CSS values. */
const declared = (css: string): Record<string, string> =>
  Object.fromEntries(
    [...css.matchAll(/--color-([a-z0-9-]+):\s*([^;]+);/gi)].map((m) => [m[1], m[2].trim()]),
  );

/** Every colour a class can name: Tailwind's default palette, overridden by
 *  app.css's `@theme` (cwd-relative: under jsdom `import.meta.url` is not a
 *  file: URL — see theme-contrast.test.ts). */
const NAMED: Record<string, string> = {
  ...declared(readFileSync(resolve(process.cwd(), "node_modules/tailwindcss/theme.css"), "utf8")),
  ...declared(
    /@theme\s*\{([\s\S]*?)\n\}/.exec(
      readFileSync(resolve(process.cwd(), "src/app.css"), "utf8"),
    )?.[1] ?? "",
  ),
};

/** A CSS colour as sRGB: hex, white/black, or `oklch()` (OKLab to linear sRGB,
 *  clipped to the gamut). Anything else is undefined: unmeasured. */
function parse(value: string): Rgb | undefined {
  const v = ({ white: "#fff", black: "#000" } as Record<string, string>)[value] ?? value;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v)?.[1];
  if (hex) {
    const six = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex;
    return [0, 2, 4].map((i) => parseInt(six.slice(i, i + 2), 16) / 255);
  }
  const ok = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)(%?)\s+(-?[\d.]+|none)(?:deg)?\s*\)$/i.exec(v);
  if (!ok) return undefined;
  const L = Number(ok[1]) / (ok[2] ? 100 : 1);
  const C = Number(ok[3]) * (ok[4] ? 0.004 : 1);
  const h = ok[5] === "none" ? 0 : (Number(ok[5]) * Math.PI) / 180;
  const [a, b] = [C * Math.cos(h), C * Math.sin(h)];
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => {
    const x = Math.min(1, Math.max(0, c));
    return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  });
}

/** Whether a class's colour part names a colour: a palette or `@theme` name,
 *  a palette-shaped `<hue>-<shade>`, or an arbitrary colour value. */
const isColour = (name: string) =>
  name in NAMED ||
  ["transparent", "current", "inherit"].includes(name) ||
  /^(?!(?:linear|radial|conic)-)[a-z]+-\d{2,3}$/.test(name) ||
  /^\[(?:#|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(|color:)/i.test(name);

/** A `<prefix>-<colour>[/<alpha>]` class read as paint; undefined for a class
 *  that is not a colour (`border-2`, `text-sm/6`, `hover:bg-dark`). */
function paint(cls: string, prefix: string): Paint | undefined {
  const [, name, modifier] =
    new RegExp(`^${prefix}-(\\[[^\\]]+\\]|[^/]+)(?:/(.+))?$`).exec(cls) ?? [];
  if (!name || !isColour(name)) return undefined;
  if (name === "transparent") return { cls, rgb: [0, 0, 0], alpha: 0 };
  const value = NAMED[name] ?? /^\[(.+)\]$/.exec(name)?.[1].replace(/_/g, " ");
  const alpha =
    modifier === undefined ? 1 : /^\d+$/.test(modifier) ? Number(modifier) / 100 : undefined;
  return { cls, rgb: value === undefined ? undefined : parse(value), alpha };
}

/** `fg` at `alpha`, laid over the opaque `bg`. */
const over = (fg: Rgb, alpha: number, bg: Rgb): Rgb =>
  fg.map((c, i) => alpha * c + (1 - alpha) * bg[i]);

/** WCAG 2.x contrast between two sRGB colours. */
function contrast(a: Rgb, b: Rgb): number {
  const luminance = (rgb: Rgb) =>
    rgb
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("Field", () => {
  it("renders a label associated with the input", () => {
    const { getByLabelText } = render(Field, { name: "email", label: "Email" });
    const input = getByLabelText("Email") as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.tagName).toBe("INPUT");
    expect(input.name).toBe("email");
  });

  it("marks required fields with aria + visible indicator", () => {
    const { getByLabelText, getByText } = render(Field, {
      name: "email",
      label: "Email",
      required: true,
    });
    const input = getByLabelText(/Email/) as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(getByText("(required)")).toBeTruthy();
  });

  it("links description via aria-describedby", () => {
    const { getByLabelText, getByText } = render(Field, {
      name: "email",
      label: "Email",
      description: "We never share it.",
    });
    const input = getByLabelText("Email") as HTMLInputElement;
    const description = getByText("We never share it.");
    expect(input.getAttribute("aria-describedby")).toContain(description.id);
  });

  it("links error via aria-describedby and sets aria-invalid", () => {
    const { getByLabelText, getByRole } = render(Field, {
      name: "email",
      label: "Email",
      error: "Required",
    });
    const input = getByLabelText("Email") as HTMLInputElement;
    const alert = getByRole("alert");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain(alert.id);
    expect(alert.textContent).toBe("Required");
  });

  it("renders a textarea when type=textarea", () => {
    const { getByLabelText } = render(Field, {
      name: "msg",
      label: "Message",
      type: "textarea",
    });
    const textarea = getByLabelText("Message") as HTMLTextAreaElement;
    expect(textarea.tagName).toBe("TEXTAREA");
  });
});

// The control's skin, which had two defects a class list cannot show you.
describe("Field styling", () => {
  it("draws a resting border that clears the 3:1 non-text minimum on every light ground", () => {
    // WCAG 1.4.11 wants 3:1 for a control's boundary. The first border was the
    // template's `--color-light` (#e5e7eb), 1.24:1 on white: invisible boxes,
    // and a visitor hunting for where to type. So the border's colour is
    // MEASURED here rather than named, on both controls.
    for (const type of ["text", "textarea"] as const) {
      const { getByLabelText, unmount } = render(Field, { name: "a", label: "A", type });
      const cls = getByLabelText("A").getAttribute("class") ?? "";
      unmount();
      const borders = cls
        .split(/\s+/)
        .map((c) => paint(c, "border"))
        .filter((p): p is Paint => p !== undefined);
      expect(
        borders.map((p) => p.cls),
        `exactly one resting border colour on the ${type}`,
      ).toHaveLength(1);
      const [border] = borders;
      expect(border.rgb && border.alpha !== undefined, `${type}: ${border.cls} is unmeasured`).toBe(
        true,
      );
      for (const ground of ["background", "white", "light"]) {
        const under = parse(NAMED[ground])!;
        expect(
          contrast(over(border.rgb!, border.alpha!, under), under),
          `${type}: ${border.cls} on bg-${ground}`,
        ).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("keeps the forced-colors outline fallback on focus (Tailwind v4)", () => {
    // In Tailwind v4 `outline-none` resolves to `outline-style: none` and takes
    // the forced-colors fallback with it; `outline-hidden` keeps the 2px
    // transparent outline the forced-colors palette repaints. Under forced
    // colours the ring is dropped by the engine, so that outline is the only
    // focus affordance left.
    for (const type of ["text", "textarea"] as const) {
      const { getByLabelText, unmount } = render(Field, { name: "a", label: "A", type });
      const cls = (getByLabelText("A").getAttribute("class") ?? "").split(/\s+/);
      unmount();
      expect(
        cls.filter((c) => /(^|:)outline-none$/.test(c)),
        type,
      ).toEqual([]);
    }
  });

  it("draws a focus indicator on both controls", () => {
    // app.css's :focus-visible floor leaves form controls out — Field styles
    // its own — so once the outline is hidden, a ring or an outline under
    // focus is the only cue a keyboard user gets (WCAG 2.4.7). Which one, and
    // how wide, is the designer's call.
    for (const type of ["text", "textarea"] as const) {
      const { getByLabelText, unmount } = render(Field, { name: "a", label: "A", type });
      const cls = (getByLabelText("A").getAttribute("class") ?? "").split(/\s+/);
      unmount();
      const hidden = cls.some((c) => /(^|:)outline-(?:hidden|none|0)$/.test(c));
      const drawn = cls.some((c) =>
        /^focus(?:-visible)?:(?:(?:inset-)?ring(?:-(?:[1-9]\d*|\[[\d.]+px\]))?|outline(?:-(?:[1-9]\d*|solid|dashed|dotted|double))?)$/.test(
          c,
        ),
      );
      expect(!hidden || drawn, `${type} draws nothing on focus`).toBe(true);
    }
  });
});

// Modal.svelte finds its initial-focus target by `[autofocus]`; with none, the
// native dialog-focusing steps land on the first focusable child, which is the
// ✕ — the exit. Opt-in, and off by default so no page ever grabs focus on load
// by accident.
describe("Field autofocus", () => {
  it("carries no autofocus attribute unless asked", () => {
    const { getByLabelText } = render(Field, { name: "email", label: "Email" });
    expect((getByLabelText("Email") as HTMLInputElement).hasAttribute("autofocus")).toBe(false);
  });

  it("marks the control as the dialog's focus target when autofocus is set", () => {
    const { getByLabelText } = render(Field, {
      name: "name",
      label: "Name",
      autofocus: true,
    });
    expect((getByLabelText("Name") as HTMLInputElement).hasAttribute("autofocus")).toBe(true);
  });

  it("applies to the textarea as well as the input", () => {
    // The two controls are a standing source of one-sided fixes in this
    // component.
    const { getByLabelText } = render(Field, {
      name: "msg",
      label: "Message",
      type: "textarea",
      autofocus: true,
    });
    expect((getByLabelText("Message") as HTMLTextAreaElement).hasAttribute("autofocus")).toBe(true);
  });
});
