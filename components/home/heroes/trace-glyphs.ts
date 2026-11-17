// Letterforms routed like copper traces: grid units, 4 wide and 6 tall, 45° chamfers.

export type Glyph = { w: number; paths: [number, number][][]; pad?: [number, number] };
export const G: Record<string, Glyph> = {
  B: { w: 4, paths: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]], [[3, 3], [4, 4], [4, 5], [3, 6], [0, 6]]], pad: [0, 6] },
  I: { w: 0, paths: [[[0, 6], [0, 0]]], pad: [0, 6] },
  T: { w: 4, paths: [[[2, 6], [2, 0]], [[0, 0], [4, 0]]], pad: [2, 6] },
  F: { w: 4, paths: [[[0, 6], [0, 0], [4, 0]], [[0, 3], [3, 3]]], pad: [0, 6] },
  E: { w: 4, paths: [[[4, 6], [0, 6], [0, 0], [4, 0]], [[0, 3], [3, 3]]], pad: [4, 6] },
  S: { w: 4, paths: [[[0, 6], [3, 6], [4, 5], [4, 4], [3, 3], [1, 3], [0, 2], [0, 1], [1, 0], [4, 0]]], pad: [0, 6] },
  "2": { w: 4, paths: [[[4, 6], [0, 6], [4, 2], [4, 1], [3, 0], [1, 0], [0, 1]]], pad: [4, 6] },
  "5": { w: 4, paths: [[[0, 6], [3, 6], [4, 5], [4, 4], [3, 3], [0, 3], [0, 0], [4, 0]]] },
  "7": { w: 4, paths: [[[0, 0], [4, 0], [4, 1], [2, 3], [2, 6]]], pad: [2, 6] },
};
export const WORD = ["B", "I", "T", "F", "E", "S", "T", " ", "2", "7"];
export const GAP = 1.5, SPACE = 2.6;
// Width of the whole word in grid units (each letter is followed by GAP; the space widens one gap to SPACE).
export const UNITS = WORD.reduce((a, ch) => a + (ch === " " ? SPACE - GAP : G[ch].w + GAP), 0) - GAP;


/* Lettering styles for the traced wordmark. Every style starts from the same skeletons above,
   so signals can still run along each stroke. */

export type LookId = "chamfer" | "rounded" | "condensed" | "extended" | "monoline";
export type Look = { name: string; sx: number; sy: number; gap: number; fillet: number; outline: boolean };
export const LOOKS: Record<LookId, Look> = {
  chamfer: { name: "Chamfer", sx: 1, sy: 1, gap: GAP, fillet: 0, outline: true },
  rounded: { name: "Rounded", sx: 1, sy: 1, gap: GAP, fillet: 0.75, outline: true },
  condensed: { name: "Condensed", sx: 0.6, sy: 1.18, gap: 1.05, fillet: 0, outline: true },
  extended: { name: "Extended", sx: 1.55, sy: 0.82, gap: 1.6, fillet: 0.35, outline: true },
  monoline: { name: "Single line", sx: 1, sy: 1, gap: GAP, fillet: 0, outline: false },
};

type P = { x: number; y: number };

/** Rounds the corners of an open polyline: each corner becomes a short curve (sampled to points). */
function filletPolyline(pts: P[], r: number): P[] {
  if (r <= 0 || pts.length < 3) return pts;
  const out: P[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], p = pts[i], b = pts[i + 1];
    const la = Math.hypot(a.x - p.x, a.y - p.y), lb = Math.hypot(b.x - p.x, b.y - p.y);
    const d = Math.min(r, la / 2, lb / 2);
    const p1 = { x: p.x + ((a.x - p.x) / la) * d, y: p.y + ((a.y - p.y) / la) * d };
    const p2 = { x: p.x + ((b.x - p.x) / lb) * d, y: p.y + ((b.y - p.y) / lb) * d };
    for (let k = 0; k <= 6; k++) {
      const t = k / 6, mt = 1 - t;
      out.push({ x: mt * mt * p1.x + 2 * mt * t * p.x + t * t * p2.x, y: mt * mt * p1.y + 2 * mt * t * p.y + t * t * p2.y });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** Lays the word out for a look inside w×h: returns each letter's strokes in pixels and the unit size. */
export function layoutWord(look: Look, w: number, h: number) {
  const units = WORD.reduce((a, ch) => a + (ch === " " ? SPACE - look.gap : G[ch].w * look.sx + look.gap), 0) - look.gap;
  const tall = 6 * look.sy;
  const u = Math.min((w - 8) / (units + 0.8), (h - 8) / (tall + 0.8));
  let x = (w - units * u) / 2;
  const y0 = (h - tall * u) / 2;
  const letters: { accent: boolean; strokes: P[][] }[] = [];
  WORD.forEach((ch, i) => {
    if (ch === " ") {
      x += (SPACE - look.gap) * u;
      return;
    }
    const g = G[ch];
    const strokes = g.paths.map((path) =>
      filletPolyline(path.map(([a, b]) => ({ x: x + a * look.sx * u, y: y0 + b * look.sy * u })), look.fillet * u),
    );
    letters.push({ accent: i >= 8, strokes });
    x += (g.w * look.sx + look.gap) * u;
  });
  return { u, letters };
}
