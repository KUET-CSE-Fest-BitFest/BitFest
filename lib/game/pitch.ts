// Shared top-down robot-soccer simulation used by the hero and the "What it is" loop.
// World units are fixed (1600×900); draw() scales to any canvas with "cover" fit.

export type Team = "orange" | "cyan";

// The landing theme: a green bot and a light blue-white bot on the slate pitch.
export const COLORS = { orange: "#22c55e", cyan: "#dbe7ee", ball: "#f0f7fa" } as const;

type Bot = { x: number; y: number; a: number; vx: number; vy: number; team: Team; trail: number[]; cd: number };

export type PitchOptions = {
  /** "play": orange can be driven by the user (falls back to AI when idle). "ai": both bots are AI. */
  mode: "play" | "ai";
  onGoal?: (team: Team, score: { orange: number; cyan: number }) => void;
  /** 0–1, darkens the pitch (used behind hero copy). */
  dim?: number;
  /** "contain" (default) shows the whole pitch; "width" spans it edge to edge on landscape screens. */
  fit?: "contain" | "width";
  /** Soft light behind each goal (white left, green right); it flares when that goal is scored in. */
  goalGlow?: boolean;
  /** Draw on a transparent canvas (no page or turf fill), so the page background shows through. */
  clear?: boolean;
};

/** A radial light, drawn once and reused every frame. */
function glowSprite(rgb: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, `rgba(${rgb},0.85)`);
  r.addColorStop(0.3, `rgba(${rgb},0.32)`);
  r.addColorStop(0.65, `rgba(${rgb},0.08)`);
  r.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  return c;
}

export const W = 1600;
export const H = 900;
const L = 70, R = W - 70, T = 70, B = H - 70, CY = H / 2;
const MOUTH = 210, G1 = CY - MOUTH / 2, G2 = CY + MOUTH / 2;

/** A rectangle in world units that bots and the ball stay out of (e.g. the area behind hero copy). */
export type Box = { x0: number; y0: number; x1: number; y1: number };

export class PitchSim {
  me: Bot;
  cpu: Bot;
  ball = { x: W / 2, y: CY, vx: 0, vy: 0 };
  score = { orange: 0, cyan: 0 };
  input = { x: 0, y: 0 };
  controlled = false;
  dim: number;
  waves: { x: number; y: number; r: number }[] = [];
  /** 0–1 flare per goal: "cyan" lights the left goal, "orange" the right. */
  flash = { orange: 0, cyan: 0 };
  private sprites?: { cyan: HTMLCanvasElement; orange: HTMLCanvasElement };
  private freeze = 0;
  private kickReq = false;
  private opts: PitchOptions;
  private frame = 0;
  private keep: Box[] = [];
  /** Where play restarts after a goal: the centre line, below any keep-out area. */
  private spawnY = CY;

  constructor(opts: PitchOptions) {
    this.opts = opts;
    this.dim = opts.dim ?? 0;
    this.me = this.makeBot("orange", 480);
    this.cpu = this.makeBot("cyan", W - 480);
  }

  private makeBot(team: Team, x: number): Bot {
    return { x, y: this.spawnY ?? CY, a: team === "orange" ? 0 : Math.PI, vx: 0, vy: 0, team, trail: [], cd: 0 };
  }

  /** The canvas transform draw() uses: scale and offset of the world on a cw × ch canvas. */
  private view(cw: number, ch: number) {
    const s = cw >= ch ? (this.opts.fit === "width" ? cw / W : Math.min(cw / W, ch / H)) : Math.max(cw / W, ch / H);
    return { s, ox: (cw - W * s) / 2, oy: (ch - H * s) / 2 };
  }

  /** Areas of the canvas (in canvas pixels) that play never enters: bots slide along their edges and
      the ball bounces off them. Restarts move below them. */
  setKeepOut(rects: Box[], cw: number, ch: number) {
    const { s, ox, oy } = this.view(cw, ch);
    this.keep = rects.map((r) => ({ x0: (r.x0 - ox) / s, y0: (r.y0 - oy) / s, x1: (r.x1 - ox) / s, y1: (r.y1 - oy) / s }));
    const under = this.keep.filter((k) => k.x0 < W / 2 + 60 && k.x1 > W / 2 - 60).reduce((y, k) => Math.max(y, k.y1), 0);
    this.spawnY = Math.min(B - 60, Math.max(CY, under + 70));
    for (const p of [this.me, this.cpu]) if (this.inside(p, 30)) { p.y = this.spawnY; this.out(p, 30, 0); }
    if (this.inside(this.ball, 12)) { Object.assign(this.ball, { x: W / 2, y: this.spawnY, vx: 0, vy: 0 }); }
  }

  private inside(p: { x: number; y: number }, r: number) {
    return this.keep.some((k) => p.x > k.x0 - r && p.x < k.x1 + r && p.y > k.y0 - r && p.y < k.y1 + r);
  }

  /** Push a body out of every keep-out box, sideways or down (never up: the boxes start at the top of
      play), reflecting its velocity by `bounce`. */
  private out(p: { x: number; y: number; vx: number; vy: number }, r: number, bounce: number) {
    for (let pass = 0; pass < 3; pass++) {
      let moved = false;
      for (const k of this.keep) {
        const x0 = k.x0 - r, x1 = k.x1 + r, y0 = k.y0 - r, y1 = k.y1 + r;
        if (!(p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1)) continue;
        const dl = p.x - x0, dr = x1 - p.x, db = y1 - p.y;
        const m = Math.min(dl, dr, db);
        if (m === db) { p.y = y1; if (p.vy < 0) p.vy = -p.vy * bounce; }
        else if (m === dl) { p.x = x0; if (p.vx > 0) p.vx = -p.vx * bounce; }
        else { p.x = x1; if (p.vx < 0) p.vx = -p.vx * bounce; }
        moved = true;
      }
      if (!moved) return;
    }
  }

  get kickCharge() { return 1 - this.me.cd / 45; }
  get speed() { return Math.hypot(this.me.vx, this.me.vy); }

  kick() { this.kickReq = true; }

  reset() {
    Object.assign(this.me, this.makeBot("orange", 480));
    Object.assign(this.cpu, this.makeBot("cyan", W - 480));
    Object.assign(this.ball, { x: W / 2, y: this.spawnY, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3 });
  }

  /** Seek a point just behind the ball on the line to the target goal. Returns desired accel. */
  private ai(b: Bot, goalX: number, accel: number) {
    const ball = this.ball;
    let dx = goalX - ball.x, dy = CY - ball.y;
    const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const behind = (b.x - ball.x) * dx + (b.y - ball.y) * dy > 0;
    const tx = ball.x - dx * 30;
    let ty = ball.y - dy * 30;
    if (behind) ty += b.y < ball.y ? -46 : 46;
    let ax = tx - b.x, ay = ty - b.y;
    const al = Math.hypot(ax, ay) || 1;
    ax = (ax / al) * accel; ay = (ay / al) * accel;
    return { ax, ay };
  }

  private move(b: Bot, ax: number, ay: number) {
    b.vx = (b.vx + ax) * 0.92; b.vy = (b.vy + ay) * 0.92;
    if (Math.hypot(b.vx, b.vy) > 0.4) {
      const want = Math.atan2(b.vy, b.vx);
      let d = want - b.a;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      b.a += d * 0.18;
    }
    b.x = Math.max(L + 24, Math.min(R - 24, b.x + b.vx));
    b.y = Math.max(T + 24, Math.min(B - 24, b.y + b.vy));
    if (this.keep.length) this.out(b, 30, 0);
    b.trail.push(b.x, b.y);
    if (b.trail.length > 40) b.trail.splice(0, 2);
    if (b.cd > 0) b.cd--;
  }

  private touch(b: Bot, push: number) {
    const ball = this.ball;
    const dx = ball.x - b.x, dy = ball.y - b.y, d = Math.hypot(dx, dy);
    if (d < 34 && d > 0) {
      ball.x = b.x + (dx / d) * 34; ball.y = b.y + (dy / d) * 34;
      ball.vx = (dx / d) * push + b.vx; ball.vy = (dy / d) * push + b.vy;
    }
  }

  private doKick(b: Bot) {
    if (b.cd > 0) return;
    b.cd = 45;
    this.waves.push({ x: b.x + Math.cos(b.a) * 30, y: b.y + Math.sin(b.a) * 30, r: 0 });
    const d = Math.hypot(this.ball.x - b.x, this.ball.y - b.y);
    if (d < 72) { this.ball.vx = Math.cos(b.a) * 17; this.ball.vy = Math.sin(b.a) * 17; }
  }

  step() {
    this.frame++;
    const { me, cpu, ball } = this;
    if (this.freeze > 0 && --this.freeze === 0) this.reset();

    // Orange: user input when controlled, otherwise AI ("attract mode").
    if (this.opts.mode === "play" && this.controlled) {
      let { x, y } = this.input;
      const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
      this.move(me, x * 0.55, y * 0.55);
      if (this.kickReq) this.doKick(me);
    } else {
      const { ax, ay } = this.ai(me, R, 0.4);
      this.move(me, ax, ay);
      if (Math.hypot(ball.x - me.x, ball.y - me.y) < 60 && ball.x > W * 0.55 && Math.random() < 0.03) this.doKick(me);
    }
    this.kickReq = false;

    const c = this.ai(cpu, L, this.opts.mode === "play" && this.controlled ? 0.42 : 0.4);
    this.move(cpu, c.ax, c.ay);

    if (!this.freeze) { this.touch(me, 3); this.touch(cpu, 4.5); }

    ball.x += ball.vx; ball.y += ball.vy; ball.vx *= 0.982; ball.vy *= 0.982;
    if (ball.y < T + 10 || ball.y > B - 10) { ball.vy *= -0.8; ball.y = Math.max(T + 10, Math.min(B - 10, ball.y)); }
    if (this.keep.length) this.out(ball, 12, 0.8);
    const inMouth = ball.y > G1 && ball.y < G2;
    if (ball.x < L + 10) {
      if (inMouth && !this.freeze) this.goal("cyan");
      else if (!inMouth) { ball.vx = Math.abs(ball.vx) * 0.8; ball.x = L + 10; }
    }
    if (ball.x > R - 10) {
      if (inMouth && !this.freeze) this.goal("orange");
      else if (!inMouth) { ball.vx = -Math.abs(ball.vx) * 0.8; ball.x = R - 10; }
    }
    if (ball.x < L - 30) ball.x = L - 30;
    if (ball.x > R + 30) ball.x = R + 30;

    this.waves = this.waves.filter((w) => (w.r += 6) < 90);
    this.flash.orange *= 0.965;
    this.flash.cyan *= 0.965;
  }

  private goal(team: Team) {
    this.score[team]++;
    this.flash[team] = 1;
    this.freeze = 80;
    this.ball.vx *= 0.3; this.ball.vy *= 0.3;
    this.opts.onGoal?.(team, { ...this.score });
  }

  draw(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
    // Landscape: fit the whole pitch (or span the width). Portrait: cover, so it still fills the screen.
    const { s, ox, oy } = this.view(cw, ch);
    ctx.save();
    if (this.opts.clear) ctx.clearRect(0, 0, cw, ch);
    else { ctx.fillStyle = "#18283f"; ctx.fillRect(0, 0, cw, ch); }
    ctx.translate(ox, oy); ctx.scale(s, s);

    if (!this.opts.clear) { ctx.fillStyle = "#122036"; ctx.fillRect(0, 0, W, H); }
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.012)" : "rgba(255,255,255,0.03)";
      ctx.fillRect(L + (i * (R - L)) / 14, T, (R - L) / 14, B - T);
    }
    if (this.opts.goalGlow) {
      this.sprites ??= { cyan: glowSprite("219,231,238"), orange: glowSprite("34,197,94") };
      const glow = (img: HTMLCanvasElement, x: number, f: number) => {
        ctx.globalAlpha = 0.6 + 0.4 * f;
        ctx.drawImage(img, x - 460, CY - 560, 920, 1120);
        ctx.globalAlpha = 0.75 + 0.25 * f;
        ctx.drawImage(img, x - 120, CY - 230, 240, 460);
      };
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      glow(this.sprites.cyan, L - 14, this.flash.cyan);
      glow(this.sprites.orange, R + 14, this.flash.orange);
      ctx.restore();
    }
    ctx.strokeStyle = "rgba(219,231,238,0.38)"; ctx.lineWidth = 2;
    ctx.strokeRect(L, T, R - L, B - T);
    ctx.beginPath(); ctx.moveTo(W / 2, T); ctx.lineTo(W / 2, B); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, CY, 96, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(L, CY - 170, 140, 340); ctx.strokeRect(R - 140, CY - 170, 140, 340);
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLORS.cyan; ctx.strokeRect(L - 28, G1, 28, MOUTH);
    ctx.strokeStyle = COLORS.orange; ctx.strokeRect(R, G1, 28, MOUTH);

    const trail = (b: Bot, col: string) => {
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath();
      for (let i = 0; i < b.trail.length; i += 2) i ? ctx.lineTo(b.trail[i], b.trail[i + 1]) : ctx.moveTo(b.trail[i], b.trail[i + 1]);
      ctx.stroke();
    };
    trail(this.me, "rgba(34,197,94,0.3)");
    trail(this.cpu, "rgba(219,231,238,0.18)");

    if (this.controlled && this.me.cd === 0) {
      ctx.strokeStyle = "rgba(34,197,94,0.35)"; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(this.me.x, this.me.y);
      ctx.lineTo(this.me.x + Math.cos(this.me.a) * 160, this.me.y + Math.sin(this.me.a) * 160); ctx.stroke();
      ctx.setLineDash([]);
    }
    for (const w of this.waves) {
      ctx.strokeStyle = `rgba(34,197,94,${1 - w.r / 90})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2); ctx.stroke();
    }

    drawBot(ctx, this.cpu, COLORS.cyan);
    drawBot(ctx, this.me, COLORS.orange);

    const ball = this.ball;
    ctx.fillStyle = "rgba(8,16,30,0.5)";
    ctx.beginPath(); ctx.ellipse(ball.x + 3, ball.y + 6, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = "#fff"; ctx.shadowBlur = 20; ctx.fillStyle = COLORS.ball;
    ctx.beginPath(); ctx.arc(ball.x, ball.y, 11, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

    ctx.restore();
    if (this.dim > 0) { ctx.fillStyle = `rgba(24,40,63,${this.dim})`; ctx.fillRect(0, 0, cw, ch); }
  }
}

export function drawBot(ctx: CanvasRenderingContext2D, b: { x: number; y: number; a: number }, col: string, scale = 1) {
  ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); ctx.scale(scale, scale);
  ctx.shadowColor = col; ctx.shadowBlur = 22; ctx.fillStyle = "#122036"; ctx.strokeStyle = col; ctx.lineWidth = 2.5;
  ctx.fillRect(-22, -18, 44, 36); ctx.strokeRect(-22, -18, 44, 36); ctx.shadowBlur = 0;
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(12, -11); ctx.lineTo(12, 11); ctx.closePath(); ctx.fill();
  ctx.fillRect(-18, -23, 18, 5); ctx.fillRect(-18, 18, 18, 5); ctx.fillRect(4, -23, 14, 5); ctx.fillRect(4, 18, 14, 5);
  ctx.restore();
}
