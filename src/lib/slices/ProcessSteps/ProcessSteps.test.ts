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
      expect(li.className).toMatch(/(^|\s)md:top-64(\s|$)/);
    }
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

  it("removes its listeners when it unmounts", async () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = await mount();
    unmount();
    expect(remove.mock.calls.map((c) => c[0])).toEqual(
      expect.arrayContaining(["scroll", "resize"]),
    );
    expect([...listeners.values()].every((set) => set.size === 0)).toBe(true);
  });
});
