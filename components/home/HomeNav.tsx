"use client";

import { useEffect, useState } from "react";
import BitfestLogo from "@/components/ui/BitfestLogo";
import { fest } from "@/lib/fest";
import { Button } from "@/components/ui/Button";

export type NavLink = { href: string; label: string };
const HOME_LINKS: NavLink[] = [
  { href: "#schedule", label: "Schedule" },
  { href: "#programme", label: "Programme" },
  { href: "#gallery", label: "Gallery" },
  { href: "#partners", label: "Partners" },
  { href: "#faq", label: "FAQ" },
];

/** The site's one navigation bar. Event pages pass their own section links, a page name and a CTA. */
export default function HomeNav({ links = HOME_LINKS, sub, cta = { href: "#schedule", label: "Register" } }: { links?: NavLink[]; sub?: string; cta?: NavLink } = {}) {
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
        <a href="/" aria-label={`${fest.name} ${fest.year} home`} className="flex items-center gap-3">
          <BitfestLogo />
          {sub && <span className="hidden text-[15px] font-medium text-muted xl:inline">{sub}</span>}
        </a>
        <nav aria-label="Sections" className="hidden gap-8 text-[15px] font-medium lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-muted transition hover:text-ink">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button href={cta.href} size="sm" className="nav-btn">
            {/* The narrowest phones get the first word only, so the button clears the logo. */}
            <span className="min-[400px]:hidden">{cta.label.split(" ")[0]}</span>
            <span className="hidden min-[400px]:inline">{cta.label}</span>
          </Button>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="home-menu"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
            className="grid h-11 w-11 place-items-center border border-line-2 transition hover:border-orange lg:hidden"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden>
              <path d={open ? "M3 1l12 10M15 1L3 11" : "M0 1h18M0 6h18M0 11h18"} stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav id="home-menu" aria-label="Sections" className="flex flex-col border-t border-line px-6 py-4 lg:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-lg text-soft transition hover:text-ink">{l.label}</a>
          ))}
        </nav>
      )}
    </header>
  );
}
