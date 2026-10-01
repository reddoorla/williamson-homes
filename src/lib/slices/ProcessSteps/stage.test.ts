import { describe, expect, it } from "vitest";
import { progress, railLength, stageLengths, stepLooks, trackHeight } from "./stage";

const L = { step: 500, hold: 400 };
const at = (scrolled: number) => progress(scrolled, 4, L);
const looks = (scrolled: number) => stepLooks(4, at(scrolled));

describe("the steps stage", () => {
  it("adds one scroll length per step after the first, plus the hold", () => {
    expect(trackHeight(900, 4, L)).toBe(900 + 3 * 500 + 400);
    expect(stageLengths(1000, false)).toEqual({ step: 600, hold: 800 });
    expect(stageLengths(1000, true)).toEqual({ step: 850, hold: 800 });
  });

  it("rests on step 1 with step 2 waiting faintly below and the rest hidden", () => {
    const s = looks(0);
    expect(s.map((x) => x.active)).toEqual([true, false, false, false]);
    expect(s.map((x) => x.rise)).toEqual([0, 1, 2, 3]);
    expect(s[0].opacity).toBe(1);
    expect(s[0].textOpacity).toBe(1);
    expect(s[1].opacity).toBeCloseTo(0.3, 5);
    expect(s[1].titleOpacity).toBe(0);
    expect(s[1].textOpacity).toBe(0);
    expect(s.slice(2).map((x) => x.opacity)).toEqual([0, 0]);
  });

  it("holds each step still at both ends of its scroll before the next moves", () => {
    expect(at(L.step * 0.1).t).toBe(0);
    expect(at(L.step * 0.9).t).toBe(1);
    expect(at(L.step * 1.05).t).toBe(1);
    expect(at(L.step * 1.5).t).toBeCloseTo(1.5, 5);
  });

  it("rises the next step into the circle as the current one fades, handing the circle over near the end", () => {
    const mid = looks(L.step * 0.5);
    expect(mid[1].rise).toBeCloseTo(0.5, 5);
    expect(mid[0].textOpacity).toBeLessThan(0.5);
    expect(mid[1].opacity).toBeGreaterThan(0.6);
    expect(mid.map((x) => x.active)).toEqual([true, false, false, false]);
    const late = stepLooks(4, { t: 0.9, solid: 0 });
    expect(late.map((x) => x.active)).toEqual([false, true, false, false]);
  });

  it("never shows a title or body at a faint, unreadable opacity while the stage is at rest", () => {
    for (const s of [0, L.step, 2 * L.step, 3 * L.step, 3 * L.step + L.hold]) {
      for (const look of looks(s)) {
        for (const o of [look.titleOpacity, look.textOpacity]) expect([0, 1]).toContain(o);
      }
    }
  });

  it("keeps exactly one circle lit at every point of the scroll", () => {
    for (let s = 0; s <= 3 * L.step + L.hold; s += 7) {
      expect(looks(s).filter((x) => x.active)).toHaveLength(1);
    }
  });

  it("parks the last step alone, fully opaque, with the rail drawn in behind it", () => {
    const s = looks(3 * L.step);
    expect(s.map((x) => x.opacity)).toEqual([0, 0, 0, 1]);
    expect(s.map((x) => x.titleOpacity)).toEqual([0, 0, 0, 1]);
    expect(s[3].textOpacity).toBe(1);
    expect(s[3].rise).toBe(0);
    expect(s[3].active).toBe(true);
    expect(railLength(4, at(3 * L.step))).toBe(0);
    expect(railLength(4, at(0))).toBe(3);
  });

  it("solidifies the last step over the first part of the hold, and only the last step", () => {
    expect(looks(3 * L.step)[3].solid).toBe(0);
    expect(looks(3 * L.step + L.hold * 0.25)[3].solid).toBeCloseTo(0.5, 5);
    expect(looks(3 * L.step + L.hold * 0.5)[3].solid).toBe(1);
    expect(looks(3 * L.step + L.hold * 5)[3].solid).toBe(1);
    expect(
      looks(3 * L.step + L.hold)
        .slice(0, 3)
        .map((x) => x.solid),
    ).toEqual([0, 0, 0]);
    expect(looks(2.5 * L.step)[3].solid).toBe(0);
  });

  it("runs backwards to the same states when the page scrolls up", () => {
    expect(looks(1234)).toEqual(looks(1234));
    expect(looks(-50)).toEqual(looks(0));
  });

  it("handles a single step: it is the last, so it parks and solidifies", () => {
    const s = stepLooks(1, progress(300, 1, L));
    expect(s).toHaveLength(1);
    expect(s[0].active).toBe(true);
    expect(s[0].opacity).toBe(1);
    expect(s[0].solid).toBe(1);
  });
});
