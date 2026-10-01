export const PIN_TOP = 256;

export const easeInCubic = (t: number) => t * t * t;
export const easeInQuintic = (t: number) => t * t * t * t * t;
export const easeOutCubic = (t: number) => (t - 1) ** 3 + 1;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export type StepState = {
  opacity: number;
  titleOpacity: number;
  textOpacity: number;
  active: boolean;
};

export function restingStates(count: number): StepState[] {
  return Array.from({ length: count }, (_, i) => ({
    opacity: 1,
    titleOpacity: 1,
    textOpacity: 1,
    active: i === 0,
  }));
}

export function counterStates(tops: number[], heights: number[], pin = PIN_TOP): StepState[] {
  const count = tops.length;
  if (count === 0) return [];
  let phase = 0;
  for (let k = 1; k < count; k++) if (tops[k] <= pin) phase = k;

  if (phase === count - 1) {
    return tops.map((_, k) => ({
      opacity: k === count - 1 ? 1 : 0,
      titleOpacity: 1,
      textOpacity: 1,
      active: k === count - 1,
    }));
  }

  const next = phase + 1;
  const prog = clamp01((tops[next] - pin) / (heights[next] || 1));
  const finalApproach = next === count - 1;

  return tops.map((_, k) => {
    const fadingOut = finalApproach && k === phase && phase > 0;
    return {
      opacity: k < phase - 1 ? 0 : k === phase - 1 ? easeInQuintic(prog) : 1,
      titleOpacity: fadingOut ? easeOutCubic(prog) : 1,
      textOpacity: fadingOut
        ? easeOutCubic(prog)
        : k <= phase
          ? 1
          : k === next
            ? 1 - easeInCubic(prog)
            : 0,
      active: k === phase || (finalApproach && k === next && prog < 0.1),
    };
  });
}
