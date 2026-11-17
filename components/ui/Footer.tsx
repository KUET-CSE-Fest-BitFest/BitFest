export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 pb-10 pt-20 md:px-14">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="flex flex-col gap-3">
            <span className="text-xl font-bold tracking-[0.06em]">BITFEST<span className="text-orange">/27</span></span>
            <p className="max-w-[320px] text-soft">The KUET CSE National Fest. Organised by the Department of CSE, KUET, Khulna.</p>
          </div>
          {[
            { h: "Fest", l: [["All events", "/"], ["Schedule", "#"], ["Sponsors", "#"]] },
            { h: "Soccer Bot", l: [["Build spec", "#spec"], ["Format", "#format"], ["Register", "#register"]] },
            { h: "Contact", l: [["[EMAIL]", "#"], ["[FACEBOOK PAGE]", "#"], ["KUET, Khulna 9203", "#"]] },
          ].map((c) => (
            <nav key={c.h} aria-label={c.h} className="flex flex-col gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">{c.h}</span>
              {c.l.map(([t, h]) => <a key={t} href={h} className="text-soft transition hover:text-ink">{t}</a>)}
            </nav>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-4 border-t border-line pt-6 font-mono text-xs tracking-[0.12em] text-dim">
          <span>© 2027 BITFEST · DEPT. OF CSE, KUET</span>
          <span>CODE. COMPETE. CONQUER.</span>
        </div>
      </div>
      <p aria-hidden className="pointer-events-none select-none whitespace-nowrap text-center text-[19vw] font-bold leading-[0.75] tracking-[-0.04em] text-white/[0.03]">SOCCER BOT</p>
    </footer>
  );
}
