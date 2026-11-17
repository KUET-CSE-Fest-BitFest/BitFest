import TraceWordmark from "@/components/home/TraceWordmark";
import { LOOKS, type LookId } from "@/components/home/heroes/trace-glyphs";

export const metadata = { title: "Wordmark styles — BitFest 2027", robots: { index: false } };

const ORDER: { id: LookId; letter: string; note: string }[] = [
  { id: "chamfer", letter: "1", note: "Current. Square ends, 45° corners." },
  { id: "rounded", letter: "2", note: "Soft corners, like bent tube." },
  { id: "condensed", letter: "3", note: "Tall and narrow; more elegant, less blocky." },
  { id: "extended", letter: "4", note: "Wide and low, slightly rounded; reads as engineering." },
  { id: "monoline", letter: "5", note: "Just the copper trace, with a via at each end." },
];

export default function FooterStyles() {
  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-px bg-line">
      {ORDER.map((o) => (
        <section key={o.id} className="flex flex-col gap-6 bg-bg px-6 py-10 md:px-14">
          <p className="flex items-baseline gap-3 text-[15px]">
            <span className="text-xl font-semibold"><span className="text-orange">{o.letter}</span> {LOOKS[o.id].name}</span>
            <span className="text-muted">{o.note}</span>
          </p>
          <TraceWordmark look={o.id} className="relative h-[clamp(120px,17vw,260px)]" />
        </section>
      ))}
    </main>
  );
}
