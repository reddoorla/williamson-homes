export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const between = (a: number, b: number, t: number) => clamp01((t - a) / (b - a));

export const DWELL = 0.15;

export type Lengths = { step: number; hold: number };

export function stageLengths(viewport: number, tall: boolean): Lengths {
  return { step: Math.round(viewport * (tall ? 0.85 : 0.6)), hold: Math.round(viewport * 0.8) };
}

export function trackHeight(stage: number, count: number, lengths: Lengths) {
  return stage + Math.max(0, count - 1) * lengths.step + lengths.hold;
}

export type Progress = { t: number; solid: number };

export function progress(scrolled: number, count: number, lengths: Lengths): Progress {
  const last = Math.max(0, count - 1);
  const travel = last * lengths.step;
  const raw = Math.min(last, Math.max(0, scrolled) / (lengths.step || 1));
  const base = Math.min(Math.floor(raw), last);
  const f = base === last ? 0 : raw - base;
  const t = base + smoothstep((f - DWELL) / (1 - 2 * DWELL));
  const solid = smoothstep((scrolled - travel) / (lengths.hold * 0.5 || 1));
  return { t, solid };
}

export type StepLook = {
  rise: number;
  opacity: number;
  textOpacity: number;
  active: boolean;
  solid: number;
};

export function stepLooks(count: number, { t, solid }: Progress): StepLook[] {
  const last = count - 1;
  const base = Math.min(Math.floor(t), last);
  const f = t - base;
  const handover = f >= 0.85;
  return Array.from({ length: count }, (_, k) => {
    const d = k - t;
    let opacity = 0;
    let textOpacity = 0;
    if (k < base) opacity = 0;
    else if (k === base) {
      opacity = 1 - between(0.45, 1, f);
      textOpacity = 1 - between(0.15, 0.65, f);
    } else if (d <= 1) {
      opacity = 0.3 + 0.7 * smoothstep(1 - d);
      textOpacity = smoothstep(between(0.4, 0.95, 1 - d));
    } else if (d <= 2) {
      opacity = 0.3 * (2 - d);
    }
    const active = k === base ? !handover || k === last : k === base + 1 && handover;
    return {
      rise: Math.max(0, d),
      opacity,
      textOpacity: k === base && k === last ? 1 : textOpacity,
      active,
      solid: k === last ? solid : 0,
    };
  });
}

export function railLength(count: number, { t }: Progress) {
  return Math.max(0, count - 1 - t);
}
