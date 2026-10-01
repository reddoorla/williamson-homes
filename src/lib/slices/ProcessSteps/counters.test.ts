import { describe, expect, it } from "vitest";
import { counterStates, PIN_TOP, restingStates } from "./counters";

const H = 240;
const tops = (first: number) => [0, 1, 2, 3].map((i) => first + i * H);
const pinned = (reached: number, nextTop: number) =>
  [0, 1, 2, 3].map((i) => (i <= reached ? PIN_TOP : nextTop + (i - reached - 1) * H));
const states = (t: number[]) => counterStates(t, [H, H, H, H]);
const round = (n: number) => Math.round(n * 100) / 100;

describe("counterStates, ported from countersAnim.js", () => {
  it("pins at the reference's top: 256px", () => {
    expect(PIN_TOP).toBe(256);
  });

  it("before the section arrives, lights step 1 and shows only its text", () => {
    const s = states(tops(900));
    expect(s.map((x) => x.active)).toEqual([true, false, false, false]);
    expect(s.map((x) => x.textOpacity)).toEqual([1, 0, 0, 0]);
    expect(s.map((x) => x.opacity)).toEqual([1, 1, 1, 1]);
  });

  it("fades step 2's text in by 1 - easeInCubic as it approaches the pin", () => {
    const s = states(pinned(0, PIN_TOP + 120));
    expect(round(s[1].textOpacity)).toBe(round(1 - 0.5 ** 3));
    expect(s[0].active).toBe(true);
  });

  it("hands the active circle to step 2 once it reaches the pin, and fades step 1 by easeInQuintic", () => {
    const s = states(pinned(1, PIN_TOP + 220));
    expect(s.map((x) => x.active)).toEqual([false, true, false, false]);
    expect(round(s[0].opacity)).toBe(round((220 / H) ** 5));
    expect(round(s[2].textOpacity)).toBe(round(1 - (220 / H) ** 3));
    expect(s[3].textOpacity).toBe(0);
  });

  it("matches the live trace at 1440 (step 2 pinned, step 3 at 476): 0.65 and 0.23", () => {
    const s = states(pinned(1, 476));
    expect(round(s[0].opacity)).toBe(0.65);
    expect(round(s[2].textOpacity)).toBe(0.23);
  });

  it("in the final approach, fades step 3's title and text by easeOutCubic and lights step 4 under 10%", () => {
    const far = states(pinned(2, PIN_TOP + 200));
    expect(far.map((x) => x.active)).toEqual([false, false, true, false]);
    expect(far[0].opacity).toBe(0);
    expect(round(far[2].titleOpacity)).toBe(round(1 - (1 - 200 / H) ** 3));
    const near = states(pinned(2, PIN_TOP + 12));
    expect(near.map((x) => x.active)).toEqual([false, false, true, true]);
    expect(near[2].titleOpacity).toBeLessThan(0.2);
  });

  it("once the last step is pinned, shows it alone and lit", () => {
    const s = states(pinned(3, 0));
    expect(s.map((x) => x.opacity)).toEqual([0, 0, 0, 1]);
    expect(s.map((x) => x.active)).toEqual([false, false, false, true]);
    expect(s[3].textOpacity).toBe(1);
  });

  it("counts a step as reached at exactly the pin, not a pixel later", () => {
    expect(states(pinned(1, PIN_TOP + H)).map((x) => x.active)[1]).toBe(true);
    const justShort = [PIN_TOP, PIN_TOP + 1, PIN_TOP + 1 + H, PIN_TOP + 1 + 2 * H];
    expect(states(justShort).map((x) => x.active)[0]).toBe(true);
  });

  it("works for any number of steps", () => {
    expect(counterStates([], [])).toEqual([]);
    const three = counterStates([PIN_TOP, PIN_TOP, PIN_TOP + 100], [H, H, H]);
    expect(three.map((x) => x.active)).toEqual([false, true, false]);
    expect(three[0].opacity).toBeGreaterThan(0);
  });

  it("rests with every text visible and only step 1 lit", () => {
    expect(restingStates(3)).toEqual([
      { opacity: 1, titleOpacity: 1, textOpacity: 1, active: true },
      { opacity: 1, titleOpacity: 1, textOpacity: 1, active: false },
      { opacity: 1, titleOpacity: 1, textOpacity: 1, active: false },
    ]);
  });
});
