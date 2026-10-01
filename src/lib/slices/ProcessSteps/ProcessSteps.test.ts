import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/svelte";
import { tick } from "svelte";

const navigated = vi.hoisted(() => ({ callbacks: [] as Array<() => void> }));
vi.mock("$app/navigation", () => ({
  afterNavigate: (fn: () => void) => navigated.callbacks.push(fn),
}));

import ProcessSteps from "./index.svelte";
import { PIN_TOP } from "./counters";

const makeSlice = (step_height: "short" | "tall" | null = null) =>
  ({
    slice_type: "process_steps",
    variation: "default",
    primary: { section_id: null, heading: "Let's Build Your Dream Home", intro: [], step_height },
    items: ["Meet with Us", "Partner Early", "Break Ground", "Finish Your Dream Home"].map(
      (title) => ({
        title,
        body: [{ type: "paragraph", text: `${title} body`, spans: [] }],
      }),
    ),
  }) as never;

let wide = true;
let reduced = false;
let tops: number[] = [];
let frames: FrameRequestCallback[] = [];

async function flushFrames() {
  const queued = frames;
  frames = [];
  for (const fn of queued) fn(0);
  await tick();
}
const listeners = new Map<string, Set<() => void>>();

function setMedia() {
  vi.stubGlobal("matchMedia", (query: string) => {
    const set = listeners.get(query) ?? new Set();
    listeners.set(query, set);
    return {
      get matches() {
        return query.includes("min-width") ? wide : query.includes("reduce") ? reduced : false;
      },
      addEventListener: (_: string, fn: () => void) => set.add(fn),
      removeEventListener: (_: string, fn: () => void) => set.delete(fn),
    };
  });
}

beforeEach(() => {
  navigated.callbacks = [];
  listeners.clear();
  wide = true;
  reduced = false;
  tops = [900, 1140, 1380, 1620];
  setMedia();
  frames = [];
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => frames.push(fn));
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.spyOn(HTMLLIElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLLIElement,
  ) {
    const index = [...(this.parentElement?.children ?? [])].indexOf(this);
    return { top: tops[index] ?? 0 } as DOMRect;
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(240);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function navigate() {
  for (const fn of navigated.callbacks) fn();
  await tick();
  await flushFrames();
}

async function mount(step_height: "short" | "tall" | null = null) {
  const result = render(ProcessSteps, { props: { slice: makeSlice(step_height) } });
  await tick();
  await navigate();
  return result;
}

async function scrollTo(next: number[]) {
  tops = next;
  window.dispatchEvent(new Event("scroll"));
  await flushFrames();
}

const steps = (c: HTMLElement) => [...c.querySelectorAll("li")];
const active = (c: HTMLElement) => steps(c).map((li) => li.hasAttribute("data-active"));
const opacity = (el: Element | null) => (el as HTMLElement | null)?.style.opacity ?? "";
const bodies = (c: HTMLElement) => steps(c).map((li) => opacity(li.querySelector(".wh-prose")));

describe("ProcessSteps counters (countersAnim.js)", () => {
  it("server-renders every step's text, step 1 lit, nothing pinned", () => {
    const { container } = render(ProcessSteps, { props: { slice: makeSlice() } });
    expect(active(container)).toEqual([true, false, false, false]);
    expect(bodies(container)).toEqual(["", "", "", ""]);
    expect(container.querySelector("[data-pinning]")).toBeNull();
    expect(steps(container).some((li) => li.className.includes("md:sticky"))).toBe(false);
    expect(container.textContent).toContain("Finish Your Dream Home body");
  });

  it("pins the heading at top 0 and every step at top 256px once it runs", async () => {
    const { container } = await mount();
    expect(container.querySelector("[data-pinning]")).not.toBeNull();
    const head = container.querySelector(".wh-steps-head") as HTMLElement;
    expect(head.className).toMatch(/(^|\s)md:sticky(\s|$)/);
    expect(head.className).toMatch(/(^|\s)md:top-0(\s|$)/);
    for (const li of steps(container)) {
      expect(li.className).toMatch(/(^|\s)md:sticky(\s|$)/);
      expect(li.className).toMatch(/(^|\s)md:top-\(--wh-pin\)(\s|$)/);
    }
    const section = container.querySelector("section") as HTMLElement;
    expect(section.style.getPropertyValue("--wh-pin")).toBe("256px");
    expect(PIN_TOP).toBe(16 * 16);
  });

  it("hides the later steps' text until they approach, as the reference does at rest", async () => {
    const { container } = await mount();
    expect(bodies(container)).toEqual(["1", "0", "0", "0"]);
    expect(active(container)).toEqual([true, false, false, false]);
  });

  it("advances on scroll: step 2 pinned lights circle 2 and fades step 1", async () => {
    const { container } = await mount();
    await scrollTo([PIN_TOP, PIN_TOP, PIN_TOP + 220, PIN_TOP + 460]);
    expect(active(container)).toEqual([false, true, false, false]);
    expect(Number(opacity(steps(container)[0]))).toBeCloseTo((220 / 240) ** 5, 5);
    expect(Number(bodies(container)[2])).toBeCloseTo(1 - (220 / 240) ** 3, 5);
  });

  it("shows only the last step once it is pinned", async () => {
    const { container } = await mount();
    await scrollTo([PIN_TOP, PIN_TOP, PIN_TOP, PIN_TOP]);
    expect(steps(container).map((li) => opacity(li))).toEqual(["0", "0", "0", "1"]);
    expect(active(container)).toEqual([false, false, false, true]);
  });

  it("does not pin or fade under reduced motion", async () => {
    reduced = true;
    const { container } = await mount();
    expect(container.querySelector("[data-pinning]")).toBeNull();
    expect(steps(container).some((li) => li.className.includes("md:sticky"))).toBe(false);
    await scrollTo([PIN_TOP, PIN_TOP, PIN_TOP, PIN_TOP]);
    expect(bodies(container)).toEqual(["", "", "", ""]);
    expect(active(container)).toEqual([true, false, false, false]);
  });

  it("does not pin below the md breakpoint, where the steps stack", async () => {
    wide = false;
    const { container } = await mount();
    expect(container.querySelector("[data-pinning]")).toBeNull();
  });

  it("stops pinning when reduced motion is switched on mid-page", async () => {
    const { container } = await mount();
    reduced = true;
    for (const fn of listeners.get("(prefers-reduced-motion: reduce)") ?? []) fn();
    await tick();
    expect(container.querySelector("[data-pinning]")).toBeNull();
    expect(bodies(container)).toEqual(["", "", "", ""]);
  });

  it("spaces steps 15rem apart by default and 40rem when tall", async () => {
    const short = await mount();
    expect(steps(short.container).every((li) => li.className.includes("md:min-h-[15rem]"))).toBe(
      true,
    );
    cleanup();
    navigated.callbacks = [];
    const tall = await mount("tall");
    expect(steps(tall.container).every((li) => li.className.includes("md:min-h-[40rem]"))).toBe(
      true,
    );
  });

  it("removes exactly the listeners it added when it unmounts", async () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = await mount();
    const added = add.mock.calls.filter((c) => c[0] === "scroll" || c[0] === "resize");
    expect(added.map((c) => c[0]).sort()).toEqual(["resize", "scroll"]);
    unmount();
    for (const [type, handler] of added) {
      expect(remove.mock.calls.some((c) => c[0] === type && c[1] === handler)).toBe(true);
    }
    expect([...listeners.values()].every((set) => set.size === 0)).toBe(true);
  });

  it("cancels a pending frame when it unmounts", async () => {
    const cancel = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancel);
    const { unmount } = await mount();
    window.dispatchEvent(new Event("scroll"));
    expect(frames).toHaveLength(1);
    unmount();
    expect(cancel).toHaveBeenCalled();
  });

  it("asks for one frame per burst of scroll events", async () => {
    await mount();
    for (let i = 0; i < 5; i++) window.dispatchEvent(new Event("scroll"));
    expect(frames).toHaveLength(1);
  });

  it("re-measures on resize", async () => {
    const { container } = await mount();
    tops = [PIN_TOP, PIN_TOP, PIN_TOP + 100, PIN_TOP + 340];
    window.dispatchEvent(new Event("resize"));
    await flushFrames();
    expect(active(container)).toEqual([false, true, false, false]);
  });

  it("stops pinning when the viewport narrows below md, and resumes when it widens", async () => {
    const { container } = await mount();
    const query = "(min-width: 768px)";
    wide = false;
    for (const fn of listeners.get(query) ?? []) fn();
    await tick();
    expect(container.querySelector("[data-pinning]")).toBeNull();
    wide = true;
    for (const fn of listeners.get(query) ?? []) fn();
    await flushFrames();
    expect(container.querySelector("[data-pinning]")).not.toBeNull();
  });

  it("pins below a heading taller than 16rem, never under it", async () => {
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.classList.contains("wh-steps-head") ? 316 : 240;
    });
    const { container } = await mount();
    const section = container.querySelector("section") as HTMLElement;
    expect(section.style.getPropertyValue("--wh-pin")).toBe("316px");
    await scrollTo([316, 300, 540, 780]);
    expect(active(container)).toEqual([false, true, false, false]);
  });

  it("fades step 3's number with its title in the final approach, as .find('h3') does", async () => {
    const { container } = await mount();
    await scrollTo([PIN_TOP, PIN_TOP, PIN_TOP, PIN_TOP + 120]);
    const third = steps(container)[2];
    const number = third.querySelector(".wh-step-number") as HTMLElement;
    const title = third.querySelector("h3") as HTMLElement;
    expect(Number(number.style.opacity)).toBeCloseTo(1 - 0.5 ** 3, 5);
    expect(number.style.opacity).toBe(title.style.opacity);
  });

  it("skips the work while the section is off-screen", async () => {
    const { container } = await mount();
    const section = container.querySelector("section") as HTMLElement;
    vi.spyOn(section, "getBoundingClientRect").mockReturnValue({
      top: 5000,
      bottom: 6200,
    } as DOMRect);
    await scrollTo([PIN_TOP, PIN_TOP, PIN_TOP, PIN_TOP]);
    expect(active(container)).toEqual([true, false, false, false]);
  });
});
