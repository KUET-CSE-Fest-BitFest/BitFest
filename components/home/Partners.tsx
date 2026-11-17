import { fest, sponsors } from "@/lib/fest";
import { TextLink } from "@/components/ui/Button";
import SectionHead from "./SectionHead";

/* 03 · Partners — BitFest 2025's sponsors and media partner on one board (2027 partners are not
   confirmed yet), with the way to partner for 2027 underneath. Glowing signals run along the grid's
   lines, each cell carrying a runner on its top and left edges with its own timing, so light keeps
   moving here and there across the board. The cells are not links, so they have no hover. Names stand in
   until the logo files are added. */

// Fixed, varied timings (seconds) so the runners never line up.
const H_DUR = [6.2, 7.4, 5.6, 8.1, 6.8, 7.7, 5.9, 8.6, 6.5];
const V_DUR = [7.1, 5.8, 8.3, 6.4, 7.9, 6.1, 8.8, 5.5, 7.3];

export default function Partners() {
  return (
    <section id="partners" aria-labelledby="partners-h" className="relative scroll-mt-20 py-28 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-14">
        <div id="partners-h">
          <SectionHead n="03" label="Partners" title="Backed by industry" sub="The sponsors and media partner of BitFest 2025, the last edition. It drew 4,000 participants from 100 universities and 7,000 visitors." />
        </div>
        <div className="lidx relative mt-14 rounded-[20px]">
          <span className="lx lx-rim" />
          <ul className="relative z-[4] grid grid-cols-2 gap-px bg-[rgba(255,214,190,0.09)] lg:grid-cols-3">
            {sponsors.map((s, i) => (
              <li key={s.name} data-reveal className="relative flex aspect-[16/8] flex-col justify-between overflow-hidden bg-[#070607] p-5 md:p-7">
                {/* Signals on this cell's top and left edges. */}
                <span aria-hidden className="grid-sig grid-sig-h" style={{ ["--d" as string]: `${H_DUR[i % 9]}s`, ["--delay" as string]: `${-(i * 1.7) % 6}s` }}><i /></span>
                <span aria-hidden className="grid-sig grid-sig-v" style={{ ["--d" as string]: `${V_DUR[i % 9]}s`, ["--delay" as string]: `${-(i * 2.3) % 7}s` }}><i /></span>
                <span className="relative z-[1] flex items-center gap-2 text-[12px] tabular-nums text-dim">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-line-2" />P{i + 1}
                </span>
                <span className="relative z-[1] flex flex-col gap-1">
                  <span className="text-[clamp(22px,2.6vw,36px)] font-semibold tracking-[-0.03em] text-soft">{s.name}</span>
                  {s.note && <span className="text-[13px] text-dim">{s.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal className="mt-8 flex flex-wrap items-center justify-between gap-4 text-soft">
          <p>Partner with BitFest 2027: festival-wide, event-level, technical, in-kind and media packages.</p>
          <TextLink href={`mailto:${fest.email}`}>{fest.email}</TextLink>
        </div>
      </div>
    </section>
  );
}
