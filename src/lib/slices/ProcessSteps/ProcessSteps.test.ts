import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/svelte";
import { tick } from "svelte";

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

function setMotion(reduced: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduced && query.includes("reduce"),
  }));
}

beforeEach(() => {
  observed = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: Callback) {
        fire = callback;
      }
      observe(el: Element) {
        observed.push(el);
      }
      disconnect() {}
    },
  );
  setMotion(false);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const active = (container: HTMLElement) =>
  [...container.querySelectorAll("li")].map((li) => li.hasAttribute("data-active"));

describe("ProcessSteps reveal", () => {
  it("starts with only the first step lit once it can observe scrolling", async () => {
    const { container } = render(ProcessSteps, { props: { slice } });
    await tick();
    expect(observed).toHaveLength(4);
    expect(active(container)).toEqual([true, false, false, false]);
  });

  it("lights every step up to the one scrolled into view, and keeps them lit", async () => {
    const { container } = render(ProcessSteps, { props: { slice } });
    await tick();
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

  it("shows every step at once under reduced motion", async () => {
    setMotion(true);
    const { container } = render(ProcessSteps, { props: { slice } });
    await tick();
    expect(observed).toHaveLength(0);
    expect(active(container)).toEqual([true, true, true, true]);
  });

  it("keeps every step's text in the markup whether or not it is lit", async () => {
    const { container } = render(ProcessSteps, { props: { slice } });
    await tick();
    expect(container.textContent).toContain("Finish Your Dream Home body");
  });
});
