import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/svelte";
import { tick } from "svelte";

const navigated = vi.hoisted(() => ({ callbacks: [] as Array<() => void> }));
vi.mock("$app/navigation", () => ({
  afterNavigate: (fn: () => void) => navigated.callbacks.push(fn),
}));

import ProcessSteps from "./index.svelte";

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
let trackTop = 2000;
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

const VIEWPORT = 1000;
const HEAD = 100;
const STEP = 200;
const AREA = 240 + 80;
const CONTENT = HEAD + AREA + 96;
const PIN = (VIEWPORT - CONTENT) / 2;
const STEP_LEN = 600;
const HOLD = 800;

beforeEach(() => {
  navigated.callbacks = [];
  listeners.clear();
  wide = true;
  reduced = false;
  trackTop = 2000;
  setMedia();
  frames = [];
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => frames.push(fn));
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.stubGlobal("innerHeight", VIEWPORT);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.classList.contains("wh-steps-track")) {
      return { top: trackTop, bottom: trackTop + 3000 } as DOMRect;
    }
    return { top: 0, bottom: 0 } as DOMRect;
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.classList.contains("wh-steps-head") ? HEAD : STEP;
  });
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

async function scrollBy(scrolled: number) {
  trackTop = PIN - scrolled;
  window.dispatchEvent(new Event("scroll"));
  await flushFrames();
}

const steps = (c: HTMLElement) => [...c.querySelectorAll("li")];
const active = (c: HTMLElement) => steps(c).map((li) => li.hasAttribute("data-active"));
const opacity = (el: Element | null) => (el as HTMLElement | null)?.style.opacity ?? "";
const bodies = (c: HTMLElement) => steps(c).map((li) => opacity(li.querySelector(".wh-prose")));
const circles = (c: HTMLElement) =>
  steps(c).map((li) => opacity(li.querySelector(".wh-step-number")));
const titles = (c: HTMLElement) => steps(c).map((li) => opacity(li.querySelector("h3")));
const rises = (c: HTMLElement) => steps(c).map((li) => li.style.transform);
const stage = (c: HTMLElement) => c.querySelector(".wh-steps-stage") as HTMLElement;
const track = (c: HTMLElement) => c.querySelector(".wh-steps-track") as HTMLElement;

describe("ProcessSteps, the pinned steps stage", () => {
  it("server-renders every step's text as a plain list, step 1 lit, nothing pinned", () => {
    const { container } = render(ProcessSteps, { props: { slice: makeSlice() } });
    expect(active(container)).toEqual([true, false, false, false]);
    expect(bodies(container)).toEqual(["", "", "", ""]);
    expect(container.querySelector("[data-pinning]")).toBeNull();
    expect(stage(container).className).not.toMatch(/(^|\s)sticky(\s|$)/);
    expect(container.textContent).toContain("Finish Your Dream Home body");
  });

  it("pins the heading and steps together, centred in the viewport", async () => {
    const { container } = await mount();
    expect(container.querySelector("[data-pinning]")).not.toBeNull();
    expect(stage(container).className).toMatch(/(^|\s)sticky(\s|$)/);
    expect(stage(container).contains(container.querySelector(".wh-steps-head"))).toBe(true);
    expect(stage(container).style.top).toBe(`${PIN}px`);
    expect(stage(container).style.height).toBe(`${CONTENT}px`);
    expect(track(container).style.height).toBe(`${CONTENT + 3 * STEP_LEN + HOLD}px`);
  });

  it("pins from the bottom edge when the stage is taller than the viewport", async () => {
    vi.stubGlobal("innerHeight", 400);
    const { container } = await mount();
    expect(stage(container).style.top).toBe(`${400 - CONTENT}px`);
  });

  it("rests on step 1 with step 2 waiting one gap below", async () => {
    const { container } = await mount();
    await scrollBy(0);
    expect(active(container)).toEqual([true, false, false, false]);
    expect(rises(container)).toEqual([
      "translate3d(0, 0px, 0)",
      "translate3d(0, 240px, 0)",
      "translate3d(0, 480px, 0)",
      "translate3d(0, 720px, 0)",
    ]);
    expect(bodies(container)).toEqual(["1", "0", "0", "0"]);
    expect(titles(container)).toEqual(["1", "0", "0", "0"]);
    const waiting = steps(container)[1].querySelector(".wh-step-number") as HTMLElement;
    expect(waiting.style.opacity).toBe("");
    expect(waiting.style.borderColor).toBe("color-mix(in srgb, var(--color-secondary) 30%, white)");
  });

  it("keeps an arriving circle's white disc solid, so the rail never shows through it", async () => {
    const { container } = await mount();
    for (const scrolled of [0, STEP_LEN / 3, STEP_LEN / 2, 2.4 * STEP_LEN]) {
      await scrollBy(scrolled);
      for (const li of steps(container)) {
        const rise = li.style.transform.match(/, ([\d.]+)px/)?.[1];
        if (!rise || Number(rise) === 0 || li.hasAttribute("data-active")) continue;
        const number = li.querySelector(".wh-step-number") as HTMLElement;
        expect(number.style.opacity).toBe("");
        expect(number.style.backgroundColor).toBe("");
        expect(number.className).toMatch(/(^|\s)bg-white(\s|$)/);
      }
    }
  });

  it("rises step 2 into the circle as the page scrolls, then hands it the circle", async () => {
    const { container } = await mount();
    await scrollBy(STEP_LEN / 2);
    expect(rises(container)[1]).toBe("translate3d(0, 120px, 0)");
    expect(active(container)).toEqual([true, false, false, false]);
    await scrollBy(STEP_LEN);
    expect(rises(container)[1]).toBe("translate3d(0, 0px, 0)");
    expect(active(container)).toEqual([false, true, false, false]);
    expect(circles(container)[0]).toBe("0");
    expect(titles(container)[0]).toBe("0");
  });

  it("parks Finish Your Dream Home alone, then solidifies it in the primary colour", async () => {
    const { container } = await mount();
    await scrollBy(3 * STEP_LEN);
    const last = steps(container)[3];
    expect(circles(container)).toEqual(["0", "0", "0", "1"]);
    expect(titles(container)).toEqual(["0", "0", "0", "1"]);
    expect(active(container)).toEqual([false, false, false, true]);
    expect(container.querySelector("[data-solid]")).toBeNull();
    await scrollBy(3 * STEP_LEN + HOLD);
    expect(container.querySelector("section")?.hasAttribute("data-solid")).toBe(true);
    const number = last.querySelector(".wh-step-number") as HTMLElement;
    expect(number.style.backgroundColor).toBe("var(--color-primary)");
    expect((last.querySelector("h3") as HTMLElement).style.color).toBe("var(--color-primary)");
    expect(last.querySelector(".wh-step-halo")).not.toBeNull();
    expect(steps(container)[2].querySelector(".wh-step-halo")).toBeNull();
  });

  it("un-solidifies when the page scrolls back up", async () => {
    const { container } = await mount();
    await scrollBy(3 * STEP_LEN + HOLD);
    await scrollBy(STEP_LEN);
    expect(container.querySelector("[data-solid]")).toBeNull();
    expect(active(container)).toEqual([false, true, false, false]);
  });

  it("draws the rail down to the last circle and retracts it as the last step arrives", async () => {
    const { container } = await mount();
    const rail = () => (container.querySelector(".wh-steps-rail") as HTMLElement).style.height;
    await scrollBy(0);
    expect(rail()).toBe(`${3 * 240 - 80}px`);
    await scrollBy(3 * STEP_LEN);
    expect(rail()).toBe("0px");
  });

  it("uses a longer gap and scroll per step when tall", async () => {
    const { container } = await mount("tall");
    expect(rises(container)[1]).toBe("translate3d(0, 360px, 0)");
    const content = HEAD + 360 + 80 + 96;
    expect(track(container).style.height).toBe(`${content + 3 * 850 + HOLD}px`);
  });

  it("does not pin or fade under reduced motion", async () => {
    reduced = true;
    const { container } = await mount();
    expect(container.querySelector("[data-pinning]")).toBeNull();
    expect(container.querySelector(".wh-steps-rail")).toBeNull();
    await scrollBy(3 * STEP_LEN + HOLD);
    expect(bodies(container)).toEqual(["", "", "", ""]);
    expect(rises(container)).toEqual(["", "", "", ""]);
    expect(active(container)).toEqual([true, false, false, false]);
  });

  it("does not pin below the md breakpoint, where the steps stack", async () => {
    wide = false;
    const { container } = await mount();
    expect(container.querySelector("[data-pinning]")).toBeNull();
    expect(track(container).style.height).toBe("");
  });

  it("stops pinning when reduced motion is switched on mid-page", async () => {
    const { container } = await mount();
    await scrollBy(STEP_LEN);
    reduced = true;
    for (const fn of listeners.get("(prefers-reduced-motion: reduce)") ?? []) fn();
    await tick();
    expect(container.querySelector("[data-pinning]")).toBeNull();
    expect(bodies(container)).toEqual(["", "", "", ""]);
    expect(active(container)).toEqual([true, false, false, false]);
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

  it("re-sizes the stage on resize", async () => {
    const { container } = await mount();
    vi.stubGlobal("innerHeight", 1200);
    window.dispatchEvent(new Event("resize"));
    await flushFrames();
    expect(stage(container).style.top).toBe(`${(1200 - CONTENT) / 2}px`);
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

  it("skips the work while the section is far off-screen", async () => {
    const { container } = await mount();
    await scrollBy(3 * STEP_LEN);
    expect(active(container)).toEqual([false, false, false, true]);
    trackTop = 9000;
    window.dispatchEvent(new Event("scroll"));
    await flushFrames();
    expect(active(container)).toEqual([false, false, false, true]);
  });
});
