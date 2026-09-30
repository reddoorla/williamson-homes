import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/svelte";
import { tick } from "svelte";

const navigated = vi.hoisted(() => ({ callbacks: [] as Array<() => void> }));
vi.mock("$app/navigation", () => ({
  afterNavigate: (fn: () => void) => navigated.callbacks.push(fn),
}));

import ProcessSteps from "./index.svelte";

const slice = {
  slice_type: "process_steps",
  variation: "default",
  primary: { section_id: null, heading: "Let's Build Your Dream Home", intro: [] },
  items: ["Meet with Us", "Partner Early", "Break Ground", "Finish Your Dream Home"].map(
    (title) => ({
      title,
      body: [{ type: "paragraph", text: `${title} body`, spans: [] }],
    }),
  ),
} as never;

type Callback = (entries: Array<{ isIntersecting: boolean; target: Element }>) => void;
let observed: Element[] = [];
let fire: Callback = () => {};
let options: IntersectionObserverInit | undefined;
let disconnected = 0;
let tops: number[] = [];

function setMotion(reduced: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduced && query.includes("reduce"),
  }));
}

beforeEach(() => {
  navigated.callbacks = [];
  options = undefined;
  observed = [];
  disconnected = 0;
  tops = [0, 1000, 2000, 3000];
  vi.spyOn(HTMLLIElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLLIElement,
  ) {
    const index = [...(this.parentElement?.children ?? [])].indexOf(this);
    return { top: tops[index] ?? 0 } as DOMRect;
  });
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: Callback, init?: IntersectionObserverInit) {
        fire = callback;
        options = init;
      }
      observe(el: Element) {
        observed.push(el);
      }
      disconnect() {
        disconnected++;
      }
    },
  );
  setMotion(false);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function navigate() {
  for (const fn of navigated.callbacks) fn();
  await tick();
}

async function mount() {
  const result = render(ProcessSteps, { props: { slice } });
  await tick();
  await navigate();
  return result;
}

const active = (container: HTMLElement) =>
  [...container.querySelectorAll("li")].map((li) => li.hasAttribute("data-active"));

describe("ProcessSteps reveal", () => {
  it("starts with only the first step lit once it can observe scrolling", async () => {
    const { container } = await mount();
    expect(observed).toHaveLength(4);
    expect(active(container)).toEqual([true, false, false, false]);
  });

  it("lights every step up to the one scrolled into view, and keeps them lit", async () => {
    const { container } = await mount();
    fire([{ isIntersecting: true, target: observed[2] }]);
    await tick();
    expect(active(container)).toEqual([true, true, true, false]);
    fire([{ isIntersecting: false, target: observed[2] }]);
    await tick();
    expect(active(container)).toEqual([true, true, true, false]);
    fire([{ isIntersecting: true, target: observed[0] }]);
    await tick();
    expect(active(container)).toEqual([true, true, true, false]);
  });

  it("never dims a step that is already on screen when it mounts", async () => {
    tops = [-500, 200, 700, 1600];
    const { container } = await mount();
    expect(active(container)).toEqual([true, true, true, false]);
  });

  it("ignores an entry that is leaving the viewport", async () => {
    const { container } = await mount();
    fire([{ isIntersecting: false, target: observed[3] }]);
    await tick();
    expect(active(container)).toEqual([true, false, false, false]);
  });

  it("lights every step when there is no IntersectionObserver", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = await mount();
    expect(active(container)).toEqual([true, true, true, true]);
  });

  it("stops observing when it unmounts", async () => {
    const { unmount } = await mount();
    unmount();
    expect(disconnected).toBe(1);
  });

  it("keeps the first step lit when every step starts below the fold", async () => {
    tops = [900, 1900, 2900, 3900];
    const { container } = await mount();
    expect(active(container)).toEqual([true, false, false, false]);
  });

  it("hides a dimmed step's text until it is reached", async () => {
    const { container } = await mount();
    const bodies = [...container.querySelectorAll("li .wh-prose")];
    expect(bodies.map((b) => b.classList.contains("opacity-0"))).toEqual([false, true, true, true]);
  });

  it("lights a step once it is 40% up from the bottom of the viewport", async () => {
    await mount();
    expect(options?.rootMargin).toBe("0px 0px -40% 0px");
  });

  it("measures after the navigation's scroll, not at mount, and only once", async () => {
    tops = [-3000, -2000, -1000, 0];
    const { container } = render(ProcessSteps, { props: { slice } });
    await tick();
    expect(active(container)).toEqual([true, true, true, true]);
    tops = [0, 1000, 2000, 3000];
    await navigate();
    expect(active(container)).toEqual([true, false, false, false]);
    tops = [-3000, -2000, -1000, 0];
    await navigate();
    expect(active(container)).toEqual([true, false, false, false]);
    expect(observed).toHaveLength(4);
  });

  it("shows every step at once under reduced motion", async () => {
    setMotion(true);
    const { container } = await mount();
    expect(observed).toHaveLength(0);
    expect(active(container)).toEqual([true, true, true, true]);
  });

  it("keeps every step's text in the markup whether or not it is lit", async () => {
    const { container } = await mount();
    expect(container.textContent).toContain("Finish Your Dream Home body");
  });
});
