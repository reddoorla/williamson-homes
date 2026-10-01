import { describe, expect, it } from "vitest";
import { cubicBezier, ix2EaseIn, ix2EaseOut } from "./easing";

describe("cubicBezier", () => {
  it("is linear for the linear curve", () => {
    const linear = cubicBezier(0, 0, 1, 1);
    for (const t of [0, 0.1, 0.5, 0.9, 1]) expect(linear(t)).toBeCloseTo(t, 5);
  });

  it("matches CSS ease-in and ease-out at known points", () => {
    expect(ix2EaseIn(0.5)).toBeCloseTo(0.3153, 3);
    expect(ix2EaseOut(0.5)).toBeCloseTo(0.6847, 3);
    expect(ix2EaseIn(0.25)).toBeCloseTo(0.0935, 3);
  });

  it("pins its ends and stays monotonic", () => {
    let last = -1;
    for (let t = 0; t <= 1.0001; t += 0.01) {
      const v = ix2EaseIn(t);
      expect(v).toBeGreaterThanOrEqual(last - 1e-9);
      last = v;
    }
    expect(ix2EaseIn(0)).toBe(0);
    expect(ix2EaseOut(1)).toBe(1);
  });
});
