import { fest } from "@/lib/fest";

export const metadata = { title: "Type previews — BitFest 2027", robots: { index: false } };

const FACES = [
  { id: "1", name: "Geist", v: "--f-geist", note: "Neutral and technical. Even widths, square-ish curves. My pick." },
  { id: "2", name: "Inter Tight", v: "--f-inter-tight", note: "The plainest of the four. Very compact at large sizes." },
  { id: "3", name: "Space Grotesk", v: "--f-space", note: "A little character in the curves; reads as tech." },
  { id: "4", name: "Sora", v: "--f-sora", note: "Rounder and wider; friendlier, still clean." },
];

export default function Fonts() {
  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-px bg-line px-0 py-0">
      {FACES.map((f) => (
        <section key={f.id} className="grid gap-8 bg-bg px-6 py-12 md:grid-cols-[220px_minmax(0,1fr)] md:px-14" style={{ fontFamily: `var(${f.v}), sans-serif` }}>
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-semibold"><span className="text-orange">{f.id}</span> {f.name}</p>
            <p className="max-w-[220px] text-[15px] leading-relaxed text-muted">{f.note}</p>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-[15px] font-medium text-soft">{fest.kicker}</p>
            <h2 className="text-[clamp(64px,9vw,148px)] font-semibold leading-[0.9] tracking-[-0.045em]">
              BitFest <span className="text-orange">2027</span>
            </h2>
            <p className="max-w-[560px] text-lg leading-relaxed text-soft">{fest.blurb}</p>
            <div className="flex flex-wrap gap-x-10 gap-y-3 text-[15px]">
              <span><span className="text-dim">Prize pool</span> <b className="font-semibold">550K+ BDT</b></span>
              <span><span className="text-dim">Soccer Bot</span> <b className="font-semibold">3 Jan · Student Welfare Center</b></span>
              <span><span className="text-dim">IUPC</span> <b className="font-semibold">4 Jan · 140K+ BDT</b></span>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
