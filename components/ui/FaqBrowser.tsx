"use client";

import { useId, useState } from "react";
import type { Faq } from "@/lib/faqs";
import { fest } from "@/lib/fest";

/* The questions, built to grow: a search field and one chip per topic (with counts) over a single
   accordion. One answer open at a time, the first open to start. Six questions show; the rest wait
   behind "Show all". Searching runs across every topic, lists every match and marks the words. */

const PAGE = 6;

function Mark({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${safe})`, "ig"));
  return <>{parts.map((p, i) => (p.toLowerCase() === q.toLowerCase() ? <mark key={i} className="rounded-[3px] bg-orange/25 px-0.5 text-ink">{p}</mark> : p))}</>;
}

export default function FaqBrowser({ items, topics, all = true, initial }: { items: Faq[]; topics: string[]; all?: boolean; initial?: string }) {
  const uid = useId();
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState(initial ?? (all ? "All" : topics[0]));
  const [open, setOpen] = useState(0);
  const [more, setMore] = useState(false);

  const query = q.trim();
  const hit = (f: Faq) => !query || `${f.q} ${f.a} ${f.topic}`.toLowerCase().includes(query.toLowerCase());
  // Searching looks across every topic; otherwise the chosen topic (or all of them).
  const list = items.filter((f) => (query || topic === "All" || f.topic === topic) && hit(f));
  const shown = more || query ? list : list.slice(0, PAGE);
  const tagged = query || topic === "All";
  const chips = all ? ["All", ...topics] : topics;
  const count = (t: string) => (t === "All" ? items.length : items.filter((f) => f.topic === t).length);

  return (
    <div data-reveal className="flex min-w-0 flex-col gap-5">
      <label className="relative flex h-12 items-center gap-3 rounded-[12px] bg-[#0c0a0b] px-4 shadow-[inset_0_0_0_1px_rgba(255,214,190,0.18)] transition-shadow hover:shadow-[inset_0_0_0_1px_rgba(255,214,190,0.32)] focus-within:shadow-[inset_0_0_0_1.5px_#ff7a3d]">
        <svg aria-hidden width="17" height="17" viewBox="0 0 20 20" className="shrink-0 text-muted"><circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M13 13l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(0); }}
          placeholder={`Search ${items.length} questions`}
          aria-label="Search the questions"
          className="faq-search h-full w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-muted"
        />
        {q && <button type="button" onClick={() => { setQ(""); setOpen(0); }} className="shrink-0 text-[13px] font-medium text-muted transition-colors hover:text-ink">Clear</button>}
      </label>

      {/* Topics: one row that scrolls sideways on phones, centred lines from tablets up. */}
      <div role="group" aria-label="Topics" className="faq-chips -mx-6 flex gap-2 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0">
        {chips.map((t) => {
          const on = !query && topic === t;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => { setTopic(t); setQ(""); setOpen(0); setMore(false); }}
              className={`flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-[color,background-color,box-shadow] duration-200 ${on ? "bg-orange text-[#1a0d06]" : "text-soft shadow-[inset_0_0_0_1px_rgba(255,214,190,0.18)] hover:text-ink hover:shadow-[inset_0_0_0_1px_rgba(255,214,190,0.4)]"}`}
            >
              {t}
              <span className={`tabular-nums ${on ? "text-[#1a0d06]/60" : "text-dim"}`}>{count(t)}</span>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className={`text-center text-[14px] text-muted ${query ? "" : "sr-only"}`}>
        {query ? `${list.length} ${list.length === 1 ? "answer" : "answers"} for “${query}”` : ""}
      </p>

      {list.length === 0 ? (
        <p className="border-t border-[rgba(255,214,190,0.1)] pt-6 text-[17px] leading-relaxed text-soft">
          Nothing matches yet. Write to{" "}
          <a href={`mailto:${fest.email}`} className="text-ink underline decoration-orange/60 underline-offset-4 transition-colors hover:text-orange">{fest.email}</a>{" "}
          and the team will answer.
        </p>
      ) : (
        <ul className="flex flex-col">
          {shown.map((f, i) => {
            const on = open === i;
            const id = `${uid}-${i}`;
            return (
              <li key={`${f.topic}|${f.q}`} className="border-t border-[rgba(255,214,190,0.1)] first:border-t-0">
                <button type="button" aria-expanded={on} aria-controls={id} onClick={() => setOpen(on ? -1 : i)} className="group flex w-full items-center justify-between gap-6 py-4 text-left">
                  <span className="flex flex-col gap-1">
                    {tagged && <span className="text-[13px] font-medium text-orange">{f.topic}</span>}
                    <span className={`text-[19px] font-semibold tracking-[-0.015em] transition-colors md:text-[21px] ${on ? "text-ink" : "text-soft group-hover:text-ink"}`}><Mark text={f.q} q={query} /></span>
                  </span>
                  <span aria-hidden className="faq-toggle relative grid h-9 w-9 shrink-0 place-items-center rounded-[9px]" data-on={on}>
                    <span className="absolute h-[1.5px] w-3 rounded-full bg-current" />
                    <span className={`absolute h-3 w-[1.5px] rounded-full bg-current transition-transform duration-300 ${on ? "scale-y-0" : ""}`} />
                  </span>
                </button>
                <div id={id} className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="max-w-[680px] pb-5 text-[16px] leading-relaxed text-soft md:text-[17px]"><Mark text={f.a} q={query} /></p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!query && list.length > PAGE && (
        <button type="button" onClick={() => setMore((m) => !m)} className="faq-more faq-toggle relative h-12 rounded-[12px] text-[15px] font-medium" data-on="false">
          {more ? "Show fewer" : `Show all ${list.length} questions`}
        </button>
      )}
    </div>
  );
}
