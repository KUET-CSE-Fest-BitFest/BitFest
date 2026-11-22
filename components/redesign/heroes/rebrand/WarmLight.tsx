"use client";

import { useEffect, useRef } from "react";

/* A warm light rendered by one small WebGL shader: cream at its centre, through orange to deep
   rust and brown, then black. It leans toward the pointer, flows slowly on its own,
   and can also show "thermal" hot spots. Under it sits a static CSS gradient, so the first paint is
   already lit; the canvas fades in once it has drawn. It renders below device resolution (the image
   is soft anyway), stops when off screen, and draws one still frame under reduced motion. */

export type Ramp = [number, string][];

export const EMBER: Ramp = [
  [0, "#030304"], [0.12, "#120805"], [0.26, "#2e130a"], [0.4, "#6a2a10"], [0.54, "#b8461a"],
  [0.68, "#ff7a3d"], [0.82, "#ffa066"], [0.93, "#ffcaa4"], [1, "#fff3ea"],
];
// Thermal camera palette, kept to the brand: black, brown, rust, orange, peach, cream.
export const IRONBOW: Ramp = [
  [0, "#040304"], [0.14, "#170a06"], [0.28, "#3a160b"], [0.42, "#7a2e12"], [0.54, "#c24a1c"],
  [0.66, "#ee6428"], [0.77, "#ff8a4a"], [0.88, "#ffbf96"], [1, "#fff4ec"],
];

type Props = {
  mode?: "corner" | "thermal";
  ramp?: Ramp;
  /** Where the light rests, in 0–1 of the canvas (y down). */
  rest?: [number, number];
  /** Radius in widths of the canvas. */
  radius?: number;
  /** How far the light follows the pointer (0–1). */
  lean?: number;
  /** A point to swing toward instead of the pointer (e.g. a hovered contest). */
  focus?: [number, number] | null;
  /** Thermal: hot spots in 0–1 of the canvas; the active one runs hottest, `hot` hottest of all. */
  cores?: [number, number][];
  active?: number;
  hot?: number | null;
  /** Keeps the light's centre inside [x0, y0, x1, y1] (0–1 of the canvas), e.g. away from the title. */
  box?: [number, number, number, number];
  /** Element that reports the pointer (default: the canvas's parent). */
  track?: React.RefObject<HTMLElement | null>;
  scale?: number;
  className?: string;
};

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;
const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uLight;
uniform float uRadius;
uniform float uHover;
uniform float uMode;
uniform vec4 uCores[8];
uniform sampler2D uRamp;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 1.7; a *= 0.5; }
  return v;
}

void main(){
  float k = uRes.y / uRes.x;
  vec2 p = vec2(gl_FragCoord.x / uRes.x, (1.0 - gl_FragCoord.y / uRes.y) * k);
  vec2 L = vec2(uLight.x, uLight.y * k);
  vec2 w = vec2(fbm(p * 2.4 + vec2(uTime * 0.05, 0.0)), fbm(p * 2.4 + vec2(5.2, 1.3) - vec2(0.0, uTime * 0.04)));
  vec2 q = p + (w - 0.5) * 0.28;
  float t;
  if (uMode < 0.5) {
    float d = length(q - L) / uRadius;
    t = 1.0 - smoothstep(0.0, 1.0, d);
    t = pow(t, 1.15);
  } else {
    float h = 0.04 + 0.09 * fbm(p * 3.2 + uTime * 0.07);
    for (int i = 0; i < 8; i++) {
      vec2 c = vec2(uCores[i].x, uCores[i].y * k);
      vec2 r = (q - c) * vec2(1.0, 0.62);
      h += uCores[i].z * exp(-dot(r, r) * uCores[i].w);
    }
    vec2 r = q - L;
    h += uHover * 0.4 * exp(-dot(r, r) * 46.0);
    t = clamp(h, 0.0, 0.9);
  }
  vec3 col = texture2D(uRamp, vec2(t, 0.5)).rgb;
  col += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 96.0;
  gl_FragColor = vec4(col, 1.0);
}`;

/** The redesign's theme can set the light's colours as a CSS variable on the page root,
    "--rd-ramp: 0 #050b14, 0.3 #0f3d4a, …" (stop and colour pairs, dark to light). */
function themeRamp(): Ramp | null {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--rd-ramp").trim();
  if (!raw) return null;
  const stops = raw.split(",").map((p) => p.trim().split(/\s+/)).filter((p) => p.length === 2).map(([s, c]) => [parseFloat(s), c] as [number, string]);
  return stops.length > 1 ? stops : null;
}

function rampTexture(gl: WebGLRenderingContext, ramp: Ramp) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 1;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 256, 0);
  ramp.forEach(([s, col]) => g.addColorStop(s, col));
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 1);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

export default function WarmLight({
  mode = "corner",
  ramp = mode === "thermal" ? IRONBOW : EMBER,
  rest = [0, 1],
  radius = 1,
  lean = 0.45,
  focus = null,
  cores = [],
  active = -1,
  hot = null,
  track,
  box = [-9, -9, 9, 9],
  scale = 0.6,
  className = "",
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Live values the render loop reads without re-running the effect.
  const live = useRef({ focus, active, hot, cores, rest, lean, radius, box });
  live.current = { focus, active, hot, cores, rest, lean, radius, box };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // Phones and tablets keep the static gradient underneath: the light only follows a mouse, and a
    // WebGL context plus a shader every frame is wasted battery and smoothness on a budget phone.
    if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 1024) return;
    // Start once the browser is idle after the page loads: compiling the shader and creating the
    // WebGL context then never land in the page's start-up work. The static gradient shows meanwhile.
    const init = (): (() => void) | undefined => {
      const gl = canvas.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: false, powerPreference: "low-power" });
      if (!gl) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const sh = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      rampTexture(gl, mode === "thermal" ? ramp : themeRamp() ?? ramp);
      const u = (n: string) => gl.getUniformLocation(prog, n);
      const U = { res: u("uRes"), time: u("uTime"), light: u("uLight"), radius: u("uRadius"), hover: u("uHover"), mode: u("uMode"), cores: u("uCores"), ramp: u("uRamp") };
      gl.uniform1i(U.ramp, 0);
      gl.uniform1f(U.mode, mode === "thermal" ? 1 : 0);

      const s = { L: [...live.current.rest] as [number, number], ptr: [0.5, 0.5] as [number, number], hover: 0, hoverT: 0, inside: 0, heat: new Float32Array(8) };
      const resize = () => {
        const r = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(2, Math.round(r.width * dpr * scale));
        canvas.height = Math.max(2, Math.round(r.height * dpr * scale));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(U.res, canvas.width, canvas.height);
      };

      let raf = 0, last = performance.now(), visible = true, drawn = false;
      const t0 = performance.now();
      const draw = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const t = reduce ? 4 : (now - t0) / 1000;
        const v = live.current;
        const e = (k: number) => 1 - Math.exp(-k * dt);
        s.hover += (s.hoverT - s.hover) * e(3.5);
        // Rest point drifts in a slow small loop; the light leans to the pointer or a focus point.
        const rx = v.rest[0] + 0.05 * Math.cos(t * 0.35), ry = v.rest[1] + 0.05 * Math.sin(t * 0.3);
        let tx = rx, ty = ry;
        if (v.focus) { tx = rx + (v.focus[0] - rx) * 0.55; ty = ry + (v.focus[1] - ry) * 0.55; }
        else if (mode === "thermal") { tx = s.ptr[0]; ty = s.ptr[1]; }
        else { tx = rx + (s.ptr[0] - rx) * v.lean * s.hover; ty = ry + (s.ptr[1] - ry) * v.lean * s.hover; }
        if (mode !== "thermal") { tx = Math.min(v.box[2], Math.max(v.box[0], tx)); ty = Math.min(v.box[3], Math.max(v.box[1], ty)); }
        s.L[0] += (tx - s.L[0]) * e(mode === "thermal" ? 9 : 2.6);
        s.L[1] += (ty - s.L[1]) * e(mode === "thermal" ? 9 : 2.6);
        gl.uniform1f(U.time, t);
        gl.uniform2f(U.light, s.L[0], s.L[1]);
        gl.uniform1f(U.radius, v.radius * (1 + 0.04 * s.hover));
        gl.uniform1f(U.hover, mode === "thermal" ? s.hover * s.inside : s.hover);
        if (mode === "thermal") {
          const arr = new Float32Array(32);
          for (let i = 0; i < 8; i++) {
            const c = v.cores[i];
            if (!c) continue;
            const target = i === v.hot ? 0.9 : i === v.active ? 0.8 : 0.42 + 0.08 * Math.sin(t * 0.9 + i * 1.9);
            s.heat[i] += (target - s.heat[i]) * e(reduce ? 60 : 2.2);
            arr.set([c[0], c[1], s.heat[i], 60], i * 4);
          }
          gl.uniform4fv(U.cores, arr);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (!drawn) { drawn = true; canvas.style.opacity = "1"; }
      };
      const loop = (now: number) => {
        draw(now);
        raf = visible && !reduce ? requestAnimationFrame(loop) : 0;
      };
      const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };

      const host = track?.current ?? canvas.parentElement!;
      const move = (ev: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        s.ptr = [(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height];
        s.inside = s.ptr[0] >= 0 && s.ptr[0] <= 1 && s.ptr[1] >= 0 && s.ptr[1] <= 1 ? 1 : 0;
        s.hoverT = ev.pointerType === "touch" ? 0 : 1;
        if (reduce) requestAnimationFrame(draw);
      };
      const leave = () => { s.hoverT = 0; s.inside = 0; if (reduce) requestAnimationFrame(draw); };
      host.addEventListener("pointermove", move, { passive: true });
      host.addEventListener("pointerleave", leave);

      resize();
      const ro = new ResizeObserver(() => { resize(); if (reduce || !raf) draw(performance.now()); });
      ro.observe(canvas);
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
      io.observe(canvas);
      kick();

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        host.removeEventListener("pointermove", move);
        host.removeEventListener("pointerleave", leave);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    };
    let stop: (() => void) | undefined;
    let done = false;
    const start = () => { if (!done) stop = init(); };
    const ric = typeof window.requestIdleCallback === "function";
    const idle = ric ? window.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 400);
    return () => {
      done = true;
      if (ric) window.cancelIdleCallback(idle); else window.clearTimeout(idle);
      stop?.();
    };
    // The shader, ramp and mode are fixed for a mounted light; the rest is read live.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 ${className}`} />;
}
