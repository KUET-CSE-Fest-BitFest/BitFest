"use client";

import { useEffect, useRef } from "react";
import { eventPages } from "@/lib/eventPages";
import EventHero from "@/components/event/EventHero";

/* Datathon option C · Decision boundary. A model's view of the world, drawn by one WebGL shader:
   two classes (orange and plum) as faint warm and plum regions, thin contour lines of the model's
   confidence like a topographic map, and the decision boundary itself as one bright line. The model
   keeps training on its own (the class centres drift, epochs count up); the pointer is a new orange
   sample, and the boundary bends to take it in. Lit additively over the hero ground, rendered below
   device resolution, stopped off screen. */

const page = eventPages.datathon;
const NC = 10, NP = 22;

// Class centres in the canvas's 0–1 width space (y is scaled by the aspect in the shader): [x, y, weight, sharpness].
const CENTRES: [number, number, number, number][] = [
  [0.14, 0.62, 1.1, 26], [0.42, 0.42, 1.0, 30], [0.7, 0.7, 1.15, 24], [0.92, 0.38, 0.9, 34], [0.55, 0.86, 0.8, 40],
  [0.28, 0.82, -1.1, 26], [0.58, 0.58, -1.0, 32], [0.83, 0.86, -1.0, 30], [0.04, 0.34, -0.9, 34], [0.33, 0.3, -0.85, 40],
];

function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;
const FRAG = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2 uRes;
uniform vec4 uC[${NC}];
uniform vec3 uP[${NP}];
uniform vec3 uPtr;
float field(vec2 p, float k){
  float f = 0.0;
  for (int i = 0; i < ${NC}; i++) { vec2 d = p - vec2(uC[i].x, uC[i].y * k); f += uC[i].z * exp(-dot(d, d) * uC[i].w); }
  vec2 d = p - vec2(uPtr.x, uPtr.y * k);
  f += uPtr.z * exp(-dot(d, d) * 70.0);
  return f;
}
void main(){
  float k = uRes.y / uRes.x;
  vec2 p = vec2(gl_FragCoord.x / uRes.x, (1.0 - gl_FragCoord.y / uRes.y) * k);
  float f = field(p, k);
  float pr = 1.0 / (1.0 + exp(-4.0 * f));
  vec3 col = vec3(0.0);
  col += vec3(0.16, 0.05, 0.015) * smoothstep(0.5, 1.0, pr);
  col += vec3(0.085, 0.02, 0.10) * smoothstep(0.5, 0.0, pr);
  float v = pr * 10.0;
  float g = abs(fract(v - 0.5) - 0.5) / max(fwidth(v), 1e-4);
  float line = 1.0 - min(g / 1.15, 1.0);
  float side = (pr - 0.5) * 2.0;
  vec3 warm = mix(vec3(0.55, 0.2, 0.09), vec3(1.0, 0.5, 0.22), clamp(side, 0.0, 1.0));
  vec3 cool = mix(vec3(0.5, 0.17, 0.45), vec3(0.28, 0.09, 0.3), clamp(-side, 0.0, 1.0));
  col += (side > 0.0 ? warm : cool) * line * (0.42 - 0.22 * abs(side));
  float b = abs(f) / max(fwidth(f), 1e-4);
  col += vec3(1.0, 0.55, 0.3) * exp(-b * 0.16) * 0.28;
  col += vec3(1.0, 0.9, 0.8) * (1.0 - smoothstep(0.4, 1.6, b));
  for (int i = 0; i < ${NP}; i++) {
    float r = length((p - vec2(uP[i].x, uP[i].y * k)) * uRes.x);
    vec3 pc = uP[i].z > 0.0 ? vec3(1.0, 0.5, 0.24) : vec3(0.8, 0.3, 0.56);
    col = mix(col, vec3(0.03, 0.02, 0.03), 1.0 - smoothstep(3.4, 4.6, r));
    col = mix(col, pc, 1.0 - smoothstep(2.0, 3.0, r));
  }
  float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}`;

type Ref = React.RefObject<HTMLSpanElement | null>;

function Field({ labelRef, readRef, valRef }: { labelRef: Ref; readRef: Ref; valRef: Ref }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "low-power" });
    if (!gl || !gl.getExtension("OES_standard_derivatives")) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = { res: gl.getUniformLocation(prog, "uRes"), c: gl.getUniformLocation(prog, "uC"), p: gl.getUniformLocation(prog, "uP"), ptr: gl.getUniformLocation(prog, "uPtr") };

    // Training samples ride with their class centres, so they stay on their side as the model moves.
    const r = rand(99);
    const samples = Array.from({ length: NP }, (_, i) => {
      const c = i % NC;
      return { c, dx: (r() - 0.5) * 0.12, dy: (r() - 0.5) * 0.22 };
    });
        const resize = () => {
      const b = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = b.width < 768 ? 0.9 : 0.7;
      canvas.width = Math.max(2, Math.round(b.width * dpr * scale));
      canvas.height = Math.max(2, Math.round(b.height * dpr * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.res, canvas.width, canvas.height);
    };

    const s = { ptr: [0.5, 0.5], w: 0, wT: 0, bump: 0 };
    const C = new Float32Array(NC * 4), P = new Float32Array(NP * 3);
    const centres = (t: number) => {
      CENTRES.forEach(([x, y, w, sh], i) => {
        C.set([x + 0.035 * Math.sin(t * (0.21 + i * 0.023) + i * 1.7), y + 0.06 * Math.cos(t * (0.17 + i * 0.019) + i), w, sh], i * 4);
      });
      samples.forEach((sm, i) => P.set([C[sm.c * 4] + sm.dx, C[sm.c * 4 + 1] + sm.dy, CENTRES[sm.c][2]], i * 3));
    };
    let raf = 0, visible = true, last = performance.now(), drawn = false, epoch = 1, shown = "";
    const t0 = last;
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = reduce ? 20 : (now - t0) / 1000;
      s.w += (s.wT - s.w) * (1 - Math.exp(-dt * 4));
      centres(t);
      gl.uniform4fv(U.c, C);
      gl.uniform3fv(U.p, P);
      gl.uniform3f(U.ptr, s.ptr[0], s.ptr[1], s.w);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!drawn) { drawn = true; canvas.style.opacity = "1"; }
      // Badge: the training clock. Pointing adds a sample, so the model retrains: the loss jumps a
      // little, then settles again.
      epoch = 1 + Math.floor(t / 0.8) % 240;
      s.bump += ((s.wT > 0 ? 0.035 : 0) - s.bump) * (1 - Math.exp(-dt * (s.wT > 0 ? 6 : 0.8)));
      const label = s.wT > 0 ? "Retraining" : "Training";
      const read = s.wT > 0 ? "+1 sample" : `Epoch ${String(epoch).padStart(3, "0")}`;
      const val = `loss ${(0.12 + 0.55 * Math.exp(-epoch / 40) + s.bump).toFixed(3)}`;
      if (label + read + val !== shown) {
        shown = label + read + val;
        if (labelRef.current) labelRef.current.textContent = label;
        if (readRef.current) { readRef.current.textContent = read; readRef.current.style.color = s.wT > 0 ? "#ff7a3d" : ""; }
        if (valRef.current) valRef.current.textContent = val;
      }
    };
    const loop = (now: number) => { draw(now); raf = visible && !reduce ? requestAnimationFrame(loop) : 0; };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };

    const host = canvas.closest("section") ?? canvas.parentElement!;
    const move = (e: Event) => {
      const ev = e as PointerEvent;
      if (ev.pointerType === "touch" && ev.type === "pointermove") return;
      const b = canvas.getBoundingClientRect();
      const y = (ev.clientY - b.top) / b.height;
      s.ptr = [(ev.clientX - b.left) / b.width, y];
      s.wT = y > 0.08 ? 1.25 : 0;
      if (reduce) requestAnimationFrame(draw);
    };
    const leave = () => { s.wT = 0; if (reduce) requestAnimationFrame(draw); };
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerdown", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    resize();
    const ro = new ResizeObserver(() => { resize(); if (reduce || !raf) draw(performance.now()); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
    io.observe(canvas);
    kick();
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerdown", move);
      host.removeEventListener("pointerleave", leave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [labelRef, readRef, valRef]);

  return (
    <div className="absolute inset-x-0 bottom-0 top-[66%] touch-pan-y md:top-[45%] [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.3)_22%,rgba(0,0,0,0.75)_38%,#000_52%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.3)_22%,rgba(0,0,0,0.75)_38%,#000_52%)]">
      <canvas ref={ref} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700" role="img" aria-label="A model's decision boundary between two classes, with contour lines of its confidence. Point at it to add a sample and watch the boundary bend." />
    </div>
  );
}

export default function HeroBoundary() {
  const labelRef = useRef<HTMLSpanElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);
  const valRef = useRef<HTMLSpanElement>(null);
  return (
    <EventHero
      slug="datathon"
      lead={page.lead}
      registerHref={page.registerHref}
      rulebookHref={page.rulebookHref}
      scene={<Field labelRef={labelRef} readRef={readRef} valRef={valRef} />}
      badge={
        <>
          <span className="relative z-[4] hidden items-center gap-2 text-[#ff8a6a] sm:flex"><span className="h-2 w-2 animate-live rounded-full bg-[#ff6a5a]" /><span ref={labelRef}>Training</span></span>
          <span ref={readRef} className="relative z-[4] tabular-nums text-soft">Epoch 001</span>
          <span ref={valRef} className="relative z-[4] text-[20px] font-semibold leading-none tabular-nums text-ink">loss 0.670</span>
        </>
      }
    />
  );
}
