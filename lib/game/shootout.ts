// Drag-to-shoot penalty mini game. World is 1200×640; draw() scales uniformly to the canvas width.

export const SW = 1200, SH = 640;
const GY = 150, P1 = 450, P2 = 750, SPOT = { x: 600, y: 500 };

export type ShotResult = "GOAL" | "SAVED" | "MISS";

export class Shootout {
  phase: "idle" | "aim" | "fly" | "done" = "idle";
  ball = { x: SPOT.x, y: SPOT.y, vx: 0, vy: 0 };
  drag: { x: number; y: number } | null = null;
  streak = 0;
  best = 0;
  onResult?: (r: ShotResult, streak: number, best: number) => void;
  private kx = 600;
  private kdir = 1;
  private t = 0;
  private wait = 0;
  private parts: { x: number; y: number; vx: number; vy: number; life: number; c: string }[] = [];

  get level() { return 1 + Math.floor(this.streak / 2); }

  down(p: { x: number; y: number }) {
    if (this.phase !== "idle") return false;
    if (Math.hypot(p.x - this.ball.x, p.y - this.ball.y) < 90) { this.drag = p; this.phase = "aim"; return true; }
    return false;
  }
  move(p: { x: number; y: number }) { if (this.phase === "aim") this.drag = p; }
  up() {
    if (this.phase !== "aim" || !this.drag) return;
    const dx = this.ball.x - this.drag.x, dy = this.ball.y - this.drag.y, L = Math.hypot(dx, dy);
    if (L < 12) { this.phase = "idle"; return; }
    const pw = Math.min(L, 220) / 220;
    this.ball.vx = (dx / L) * pw * 28; this.ball.vy = (dy / L) * pw * 28;
    this.phase = "fly";
  }

  private finish(r: ShotResult) {
    this.phase = "done"; this.wait = 70;
    if (r === "GOAL") {
      this.streak++; this.best = Math.max(this.best, this.streak);
      for (let i = 0; i < 80; i++) {
        const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 8;
        this.parts.push({ x: this.ball.x, y: this.ball.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 50 + Math.random() * 30, c: Math.random() < 0.7 ? "#ff7a3d" : "#fff" });
      }
    } else this.streak = 0;
    this.onResult?.(r, this.streak, this.best);
  }

  step() {
    const b = this.ball;
    this.t++;
    const kspd = 2 + this.level * 0.85;
    if (Math.random() < 0.015) this.kdir = -this.kdir;
    this.kx += this.kdir * kspd;
    if (this.phase === "fly" && b.vy < 0) this.kx += Math.max(-kspd * 0.6, Math.min(kspd * 0.6, (b.x - this.kx) * 0.05)) * Math.min(1, this.level / 4);
    if (this.kx < P1 + 40) { this.kx = P1 + 40; this.kdir = 1; }
    if (this.kx > P2 - 40) { this.kx = P2 - 40; this.kdir = -1; }

    if (this.phase === "fly") {
      b.x += b.vx; b.y += b.vy; b.vx *= 0.992; b.vy *= 0.992;
      if (b.y < GY + 32 && b.y > GY - 6 && Math.abs(b.x - this.kx) < 46 && b.vy < 0) { b.vy = Math.abs(b.vy) * 0.5; b.vx += (b.x - this.kx) * 0.15; this.finish("SAVED"); }
      else if (b.y < GY) { if (b.x > P1 && b.x < P2) { b.vx *= 0.2; b.vy *= 0.2; this.finish("GOAL"); } else this.finish("MISS"); }
      else if (b.x < 0 || b.x > SW || b.y > SH || Math.hypot(b.vx, b.vy) < 0.4) this.finish("MISS");
    } else if (this.phase === "done") {
      b.x += b.vx; b.y += b.vy; b.vx *= 0.94; b.vy *= 0.94;
      if (--this.wait <= 0) { b.x = SPOT.x + (Math.random() - 0.5) * 240; b.y = SPOT.y; b.vx = b.vy = 0; this.phase = "idle"; }
    }
    this.parts = this.parts.filter((p) => p.life-- > 0);
    for (const p of this.parts) { p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy = p.vy * 0.96 + 0.12; }
  }

  draw(ctx: CanvasRenderingContext2D, cw: number) {
    const s = cw / SW, b = this.ball;
    ctx.save(); ctx.scale(s, s);
    ctx.fillStyle = "#090708"; ctx.fillRect(0, 0, SW, SH);
    for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.014)" : "rgba(255,255,255,0.032)"; ctx.fillRect(0, i * 72, SW, 72); }
    ctx.strokeStyle = "rgba(242,239,236,0.45)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, GY); ctx.lineTo(SW - 60, GY); ctx.stroke();
    ctx.strokeRect(330, GY, 540, 230); ctx.strokeRect(450, GY, 300, 100);
    ctx.beginPath(); ctx.arc(600, GY + 230, 100, 0, Math.PI); ctx.stroke();
    ctx.fillStyle = "rgba(242,239,236,0.6)"; ctx.beginPath(); ctx.arc(SPOT.x, SPOT.y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#f2efec"; ctx.lineWidth = 5; ctx.strokeRect(P1, GY - 64, P2 - P1, 64);
    ctx.strokeStyle = "rgba(242,239,236,0.14)"; ctx.lineWidth = 1;
    for (let x = P1; x <= P2; x += 15) { ctx.beginPath(); ctx.moveTo(x, GY - 64); ctx.lineTo(x, GY); ctx.stroke(); }
    for (let y = GY - 64; y <= GY; y += 13) { ctx.beginPath(); ctx.moveTo(P1, y); ctx.lineTo(P2, y); ctx.stroke(); }

    keeper(ctx, this.kx, GY + 14);

    if (this.phase === "aim" && this.drag) {
      const dx = b.x - this.drag.x, dy = b.y - this.drag.y, L = Math.hypot(dx, dy) || 1, pw = Math.min(L, 220) / 220;
      let px = b.x, py = b.y, vx = (dx / L) * pw * 28, vy = (dy / L) * pw * 28;
      for (let i = 0; i < 44; i++) {
        px += vx; py += vy; vx *= 0.992; vy *= 0.992;
        if (i % 2) continue;
        ctx.fillStyle = `rgba(255,255,255,${0.7 - i / 66})`; ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
        if (py < GY) break;
      }
      ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(b.x - 70, b.y + 40, 140, 8);
      ctx.fillStyle = pw > 0.85 ? "#ff5a5a" : "#ff7a3d"; ctx.fillRect(b.x - 70, b.y + 40, 140 * pw, 8);
    }
    if (this.phase === "idle") {
      ctx.strokeStyle = "rgba(255,122,61,0.6)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(b.x, b.y, 28 + Math.sin(this.t * 0.08) * 6, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.ellipse(b.x + 4, b.y + 8, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = "#fff"; ctx.shadowBlur = 22; ctx.fillStyle = "#fff6ee"; ctx.beginPath(); ctx.arc(b.x, b.y, 13, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    for (const p of this.parts) { ctx.globalAlpha = Math.min(1, p.life / 40); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 4, 4); }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

function keeper(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const col = "#c2458a";
  ctx.save(); ctx.translate(x, y);
  ctx.shadowColor = col; ctx.shadowBlur = 24; ctx.fillStyle = "#151214"; ctx.strokeStyle = col; ctx.lineWidth = 2;
  ctx.fillRect(-34, -16, 68, 32); ctx.strokeRect(-34, -16, 68, 32); ctx.shadowBlur = 0;
  ctx.fillStyle = col; ctx.fillRect(-30, -22, 18, 5); ctx.fillRect(12, -22, 18, 5); ctx.fillRect(-30, 17, 18, 5); ctx.fillRect(12, 17, 18, 5);
  ctx.restore();
}
