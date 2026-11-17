// 2v2 AI match rendered in simple 3D (orbit camera, painter's sort). World: x along length, z across, y up.

type Bot = { t: 0 | 1; x: number; z: number; a: number; sp: number; hx: number; hz: number };

export const CAMS = [
  { label: "Broadcast", yaw: 0, pitch: 0.72, dist: 980, follow: 0.25, fx: 0 },
  { label: "Top-down", yaw: 0, pitch: 1.5, dist: 1000, follow: 0, fx: 0 },
  { label: "Goal cam", yaw: -Math.PI / 2, pitch: 0.32, dist: 620, follow: 0.5, fx: 330 },
  { label: "Ball cam", yaw: 0.5, pitch: 0.5, dist: 430, follow: 1, fx: 0 },
] as const;

const FX = 380, FZ = 250, GM = 62;

export class Arena3D {
  cam = { yaw: -0.6, pitch: 0.4, dist: 1400, tyaw: 0, tpitch: 0.72, tdist: 980, follow: 0.25, fx: 0, tx: 0, tz: 0 };
  manual = false;
  preset = 0;
  score = { orange: 0, cyan: 0 };
  onGoal?: (s: { orange: number; cyan: number }) => void;
  private ball = { x: 0, z: 0, y: 6, vx: 0, vz: 0, vy: 0 };
  private bots: Bot[];
  private freeze = 0;
  private f = 0;

  constructor() {
    const mk = (t: 0 | 1, x: number, z: number): Bot => ({ t, x, z, a: t ? Math.PI : 0, sp: 2 + Math.random() * 0.8, hx: x, hz: z });
    this.bots = [mk(0, -140, -60), mk(0, -240, 70), mk(1, 140, 60), mk(1, 240, -70)];
  }

  setPreset(i: number) {
    const c = CAMS[i];
    Object.assign(this.cam, { tyaw: c.yaw, tpitch: c.pitch, tdist: c.dist, follow: c.follow, fx: c.fx });
    this.preset = i; this.manual = false;
  }
  orbit(dx: number, dy: number) {
    this.cam.tyaw += dx * 0.006;
    this.cam.tpitch = Math.max(0.12, Math.min(1.52, this.cam.tpitch + dy * 0.004));
    this.manual = true;
  }
  zoom(d: number) { this.cam.tdist = Math.max(320, Math.min(1500, this.cam.tdist + d * 0.8)); }

  private reset() {
    const b = this.ball;
    Object.assign(b, { x: 0, z: 0, y: 6, vx: (Math.random() - 0.5) * 3, vz: (Math.random() - 0.5) * 3, vy: 0 });
    this.bots.forEach((o) => { o.x = o.hx; o.z = o.hz; o.a = o.t ? Math.PI : 0; });
  }

  step() {
    const { ball, bots } = this;
    this.f++;
    if (this.freeze > 0 && --this.freeze === 0) this.reset();
    if (!this.freeze) for (const b of bots) {
      const gx = b.t ? -FX : FX;
      let dx = gx - ball.x, dz = -ball.z;
      const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
      const behind = (b.x - ball.x) * dx + (b.z - ball.z) * dz > 0;
      let tx = ball.x - dx * 26, tz = ball.z - dz * 26;
      if (behind) tz += b.z < ball.z ? -40 : 40;
      const mate = bots.find((o) => o !== b && o.t === b.t)!;
      if (Math.hypot(mate.x - ball.x, mate.z - ball.z) < Math.hypot(b.x - ball.x, b.z - ball.z) - 40) {
        tx = (b.t ? 1 : -1) * 120 + ball.x * 0.3; tz = ball.z * 0.5 + (b.hz > 0 ? 60 : -60);
      }
      const want = Math.atan2(tz - b.z, tx - b.x);
      let d = want - b.a;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      b.a += Math.max(-0.09, Math.min(0.09, d));
      b.x = Math.max(-FX + 14, Math.min(FX - 14, b.x + Math.cos(b.a) * b.sp));
      b.z = Math.max(-FZ + 14, Math.min(FZ - 14, b.z + Math.sin(b.a) * b.sp));
      if (Math.hypot(b.x - ball.x, b.z - ball.z) < 22) {
        const k = 5 + Math.random() * 2.5;
        ball.vx = (Math.cos(b.a) * 0.5 + dx * 0.5) * k; ball.vz = (Math.sin(b.a) * 0.5 + dz * 0.5) * k;
        ball.vy = Math.random() < 0.25 ? 3 + Math.random() * 3 : 0;
      }
    }
    ball.x += ball.vx; ball.z += ball.vz; ball.vx *= 0.985; ball.vz *= 0.985;
    ball.y += ball.vy; ball.vy -= 0.3;
    if (ball.y < 6) { ball.y = 6; ball.vy = Math.abs(ball.vy) > 1.5 ? -ball.vy * 0.5 : 0; }
    if (Math.abs(ball.z) > FZ - 6) { ball.vz *= -0.85; ball.z = Math.sign(ball.z) * (FZ - 6); }
    if (Math.abs(ball.x) > FX - 6) {
      if (Math.abs(ball.z) < GM && !this.freeze) {
        if (ball.x > 0) this.score.orange++; else this.score.cyan++;
        this.onGoal?.({ ...this.score });
        this.freeze = 100; ball.vx *= 0.2; ball.vz *= 0.2;
      } else if (Math.abs(ball.z) >= GM) { ball.vx *= -0.85; ball.x = Math.sign(ball.x) * (FX - 6); }
      if (Math.abs(ball.x) > FX + 20) { ball.x = Math.sign(ball.x) * (FX + 20); ball.vx = 0; }
    }
    const cam = this.cam;
    cam.yaw += (cam.tyaw - cam.yaw) * 0.08; cam.pitch += (cam.tpitch - cam.pitch) * 0.08; cam.dist += (cam.tdist - cam.dist) * 0.08;
    const wx = cam.fx ? cam.fx : ball.x * cam.follow, wz = ball.z * cam.follow;
    cam.tx += (wx - cam.tx) * 0.06; cam.tz += (wz - cam.tz) * 0.06;
    if (!this.manual && this.preset === 0) cam.tyaw = Math.sin(this.f * 0.003) * 0.25;
  }

  draw(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const cam = this.cam, ball = this.ball;
    const F = Math.min(W, H * 1.6) * 0.95, CX = W / 2, CY = H * 0.53;
    const proj = (x: number, y: number, z: number) => {
      const dx = x - cam.tx, dy = y, dz = z - cam.tz;
      const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      const x1 = dx * cy - dz * sy, z1 = dx * sy + dz * cy;
      const y2 = dy * cp + z1 * sp, z2 = -dy * sp + z1 * cp;
      const zc = z2 + cam.dist;
      if (zc < 20) return null;
      const s = F / zc;
      return { x: CX + x1 * s, y: CY - y2 * s, s, d: zc };
    };
    const poly = (pts: number[][], fill?: string, stroke?: string) => {
      ctx.beginPath(); let ok = true;
      pts.forEach((p, i) => { const q = proj(p[0], p[1], p[2]); if (!q) { ok = false; return; } i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); });
      if (!ok) return;
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
    };
    const line = (pts: number[][]) => {
      ctx.beginPath(); let st = false;
      for (const p of pts) { const q = proj(p[0], p[1], p[2]); if (!q) { st = false; continue; } if (!st) { ctx.moveTo(q.x, q.y); st = true; } else ctx.lineTo(q.x, q.y); }
      ctx.stroke();
    };

    ctx.fillStyle = "#070607"; ctx.fillRect(0, 0, W, H);
    poly([[-FX - 40, 0, -FZ - 40], [FX + 40, 0, -FZ - 40], [FX + 40, 0, FZ + 40], [-FX - 40, 0, FZ + 40]], "#0d0b0c");
    for (let i = 0; i < 10; i += 2) { const x0 = -FX + i * 76; poly([[x0, 0, -FZ], [x0 + 76, 0, -FZ], [x0 + 76, 0, FZ], [x0, 0, FZ]], "rgba(255,255,255,0.025)"); }
    ctx.strokeStyle = "rgba(242,239,236,0.5)"; ctx.lineWidth = 1.6;
    line([[-FX, 0, -FZ], [FX, 0, -FZ], [FX, 0, FZ], [-FX, 0, FZ], [-FX, 0, -FZ]]);
    line([[0, 0, -FZ], [0, 0, FZ]]);
    const circ: number[][] = []; for (let i = 0; i <= 40; i++) { const t = (i / 40) * Math.PI * 2; circ.push([Math.cos(t) * 64, 0, Math.sin(t) * 64]); } line(circ);
    [-1, 1].forEach((s) => line([[s * FX, 0, -120], [s * (FX - 90), 0, -120], [s * (FX - 90), 0, 120], [s * FX, 0, 120]]));
    ([[-1, "#c2458a", "rgba(194,69,138,0.35)"], [1, "#ff7a3d", "rgba(255,122,61,0.35)"]] as const).forEach(([s, c, c2]) => {
      ctx.strokeStyle = c; ctx.lineWidth = 3;
      line([[s * FX, 0, -GM], [s * FX, 40, -GM], [s * FX, 40, GM], [s * FX, 0, GM]]);
      ctx.lineWidth = 1; ctx.strokeStyle = c2;
      for (let z = -GM; z <= GM; z += 16) line([[s * FX, 40, z], [s * (FX + 26), 30, z], [s * (FX + 26), 0, z]]);
    });

    type Obj = { k: "ball" } | { k: "bot"; b: Bot };
    const objs: { o: Obj; d: number }[] = this.bots.map((b) => ({ o: { k: "bot" as const, b }, d: proj(b.x, 0, b.z)?.d ?? 0 }));
    objs.push({ o: { k: "ball" }, d: proj(ball.x, 0, ball.z)?.d ?? 0 });
    objs.sort((p, q) => q.d - p.d);
    for (const { o } of objs) {
      if (o.k === "ball") {
        const sh = proj(ball.x, 0, ball.z), q = proj(ball.x, ball.y, ball.z);
        if (sh) { ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.beginPath(); ctx.ellipse(sh.x, sh.y, 8 * sh.s, 4 * sh.s, 0, 0, Math.PI * 2); ctx.fill(); }
        if (q) { ctx.shadowColor = "#fff"; ctx.shadowBlur = 18; ctx.fillStyle = "#fff6ee"; ctx.beginPath(); ctx.arc(q.x, q.y, 7 * q.s, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
        continue;
      }
      const b = o.b, col = b.t ? "#c2458a" : "#ff7a3d", ca = Math.cos(b.a), sa = Math.sin(b.a);
      const corner = (u: number, v: number, y: number) => [b.x + u * ca - v * sa, y, b.z + u * sa + v * ca];
      const base = [corner(-15, -13, 0), corner(15, -13, 0), corner(15, 13, 0), corner(-15, 13, 0)];
      const top = base.map((p) => [p[0], 18, p[2]]);
      poly(base.map((p) => [p[0] + 4, 0, p[2] + 3]), "rgba(0,0,0,0.5)");
      const faces = [0, 1, 2, 3].map((i) => {
        const j = (i + 1) % 4;
        return { f: [base[i], base[j], top[j], top[i]], d: proj((base[i][0] + base[j][0]) / 2, 9, (base[i][2] + base[j][2]) / 2)?.d ?? 0, front: i === 1 };
      }).sort((p, q) => q.d - p.d);
      ctx.lineWidth = 1.2;
      for (const fc of faces) poly(fc.f, fc.front ? col : "#191517", col);
      ctx.shadowColor = col; ctx.shadowBlur = 14; poly(top, "#211c1e", col); ctx.shadowBlur = 0;
      const tip = proj(...(corner(12, 0, 19) as [number, number, number])), l1 = proj(...(corner(2, -7, 19) as [number, number, number])), l2 = proj(...(corner(2, 7, 19) as [number, number, number]));
      if (tip && l1 && l2) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(l1.x, l1.y); ctx.lineTo(l2.x, l2.y); ctx.closePath(); ctx.fill(); }
    }
  }
}
