"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "#about", label: "Overview" },
  { href: "#spec", label: "Build spec" },
  { href: "#format", label: "Format" },
  { href: "#timeline", label: "Timeline" },
  { href: "#prizes", label: "Prizes" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid || open ? "border-b border-line bg-bg/95" : "border-b border-transparent"}`}>
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 md:px-14">
        <a href="/" className="text-[17px] font-bold tracking-[0.06em]">
          BITFEST<span className="text-orange">/27</span> <span className="hidden font-semibold text-dim sm:inline">· SOCCER BOT</span>
        </a>
        <nav aria-label="Page sections" className="hidden gap-8 text-[15px] font-medium lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-muted transition hover:text-ink">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button href="#register" size="sm" className="nav-btn">Register team</Button>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mnav"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
            className="grid h-11 w-11 place-items-center border border-line-2 lg:hidden"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden><path d={open ? "M3 1l12 10M15 1L3 11" : "M0 1h18M0 6h18M0 11h18"} stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mnav" aria-label="Page sections" className="flex flex-col border-t border-line px-6 py-4 lg:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-lg text-soft">{l.label}</a>
          ))}
        </nav>
      )}
    </header>
  );
}
