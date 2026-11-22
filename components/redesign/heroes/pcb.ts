// Shared drawing helpers for the circuit-board heroes.

export type Pt = { x: number; y: number };
export type Route = { pts: Pt[]; cum: number[]; len: number };
export type Box = { x: number; y: number; w: number; h: number };

export let ORANGE = "255,122,61";
export let INK = "242,239,236";
let PULSE = "#ffd2bd";
/** The redesign's theme sets its canvas colours as CSS variables on the page root
    (--rd-acc-rgb, --rd-ink-rgb as "r,g,b", --rd-pulse as a colour); read them before drawing. */
export function readCanvasTheme() {
  if (typeof window === "undefined") return;
  const cs = getComputedStyle(document.documentElement);
  const a = cs.getPropertyValue("--rd-acc-rgb").trim();
  const i = cs.getPropertyValue("--rd-ink-rgb").trim();
  const p = cs.getPropertyValue("--rd-pulse").trim();
  if (a) ORANGE = a;
  if (i) INK = i;
  if (p) PULSE = p;
}

export const route = (pts: Pt[]): Route => {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return { pts, cum, len: cum[cum.length - 1] };
};

/** Point at distance s along a route. */
export const at = (r: Route, s: number): Pt => {
  s = Math.max(0, Math.min(r.len, s));
  let i = 1;
  while (i < r.cum.length - 1 && r.cum[i] < s) i++;
  const a = r.pts[i - 1], b = r.pts[i];
  const seg = r.cum[i] - r.cum[i - 1] || 1;
  const k = (s - r.cum[i - 1]) / seg;
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
};

export const distTo = (r: Route, p: Pt) => {
  let d = Infinity;
  for (let i = 1; i < r.pts.length; i++) {
    const a = r.pts[i - 1], b = r.pts[i];
    const vx = b.x - a.x, vy = b.y - a.y;
    const l2 = vx * vx + vy * vy || 1;
    const k = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / l2));
    d = Math.min(d, Math.hypot(p.x - (a.x + vx * k), p.y - (a.y + vy * k)));
  }
  return d;
};

export const strokeRoute = (ctx: CanvasRenderingContext2D, r: Route) => {
  ctx.beginPath();
  ctx.moveTo(r.pts[0].x, r.pts[0].y);
  for (let i = 1; i < r.pts.length; i++) ctx.lineTo(r.pts[i].x, r.pts[i].y);
  ctx.stroke();
};

/** Seeded random so decoration stays put between reloads. */
export const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

/** A signal: a short fading tail with a hot head, at distance s along r. */
export function drawPulse(ctx: CanvasRenderingContext2D, r: Route, s: number, tail = 26, width = 2.5) {
  const head = at(r, s), mid = at(r, s - tail / 2), end = at(r, s - tail);
  const g = ctx.createLinearGradient(end.x, end.y, head.x, head.y);
  g.addColorStop(0, `rgba(${ORANGE},0)`);
  g.addColorStop(1, `rgba(${ORANGE},1)`);
  ctx.strokeStyle = g;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(mid.x, mid.y);
  ctx.lineTo(head.x, head.y);
  ctx.stroke();
  // Head: a soft halo and a hot core (no shadowBlur, which is costly every frame).
  ctx.fillStyle = `rgba(${ORANGE},0.28)`;
  ctx.beginPath();
  ctx.arc(head.x, head.y, width * 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PULSE;
  ctx.beginPath();
  ctx.arc(head.x, head.y, width, 0, Math.PI * 2);
  ctx.fill();
}

/** Crosshair ring that follows the pointer. */
export function drawProbe(ctx: CanvasRenderingContext2D, p: Pt) {
  ctx.strokeStyle = `rgba(${ORANGE},0.75)`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    ctx.moveTo(p.x + dx * 17, p.y + dy * 17);
    ctx.lineTo(p.x + dx * 25, p.y + dy * 25);
  }
  ctx.stroke();
}

/** Signals that spawn on a route and run to its end. Call step() each frame. */
export class PulseLane {
  list: { s: number; v: number }[] = [];
  next = 0;
  arrived = -9;
  step(t: number, dt: number, len: number, rate: { gap: [number, number]; speed: number }) {
    if (t > this.next) {
      this.list.push({ s: 0, v: 150 + Math.random() * 90 });
      this.next = t + rate.gap[0] + Math.random() * (rate.gap[1] - rate.gap[0]);
    }
    for (let j = this.list.length - 1; j >= 0; j--) {
      const p = this.list[j];
      p.s += p.v * rate.speed * dt;
      if (p.s >= len) {
        this.arrived = t;
        this.list.splice(j, 1);
      }
    }
  }
}
