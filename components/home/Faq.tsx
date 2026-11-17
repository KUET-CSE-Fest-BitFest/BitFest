"use client";

import SectionHead from "./SectionHead";
import FaqList from "@/components/ui/FaqList";

/* 04 · Questions, in a lit lid; the list is the shared FaqList (trace, pads, lit toggles). */

const QA = [
  {
    q: "Who can take part?",
    a: "University students from across Bangladesh. Teams run from two members (3 Minute Thesis) to four (Soccer Bot and Capture The Flag); IUPC teams of three bring a coach, and gaming entries go from solo FIFA and Clash Royale players to Valorant teams of five.",
  },
  {
    q: "When and where is it?",
    a: "The onsite finals are on Friday 29 and Saturday 30 January 2027 on the KUET campus in Khulna, and CSE Night closes the festival on the evening of the 30th. Online rounds run before that, from 13 to 22 January.",
  },
  {
    q: "How do I register?",
    a: "Registration opens on 30 November 2026 and closes on 12 January 2027. Fees are per team: BDT 1,000 to 2,000 for most contests and BDT 5,500 for IUPC. The AI Hackathon preliminary is free, with BDT 2,500 for each team selected for the final.",
  },
  {
    q: "How do the online rounds work?",
    a: "The AI Hackathon and the Datathon each run an online preliminary for 150+ teams; the top 60 and the top 30 come to KUET for the finals. The IT Business Case written round picks 20 teams. Finalists are announced on 24 January.",
  },
  {
    q: "What can we win?",
    a: "BDT 7,00,000 in cash prizes across the ten competitions, from BDT 35,000 for 3 Minute Thesis to BDT 1,75,000 for IUPC.",
  },
  {
    q: "Who organises BitFest?",
    a: "The Department of Computer Science and Engineering at KUET, with four student clubs: SGIPC runs IUPC; KMiNDS the AI Hackathon, the Datathon and 3MT; HACK the Project Showcase, Line Following Robot and Soccer Bot; KCSC Capture The Flag. Write to bitfest@cse.kuet.ac.bd.",
  },
];

export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-h" className="relative scroll-mt-20 py-20 md:py-36">
      <div className="mx-auto max-w-[1440px] px-3 md:px-14">
        {/* The questions sit in a lid: dark face, grain, thin warm rim, lit from the bottom-left. */}
        <div className="lidx relative rounded-[24px] md:rounded-[32px]">
          <span className="lx lx-corner lx-bl lx-warm" style={{ width: "88%", opacity: 0.8 }} />
          <span className="lx lx-rim" />
          <div className="relative z-[4] grid gap-12 px-6 py-12 md:p-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div id="faq-h">
          <SectionHead n="04" label="Questions" title="Before you register" />
        </div>
        <FaqList items={QA} />
          </div>
        </div>
      </div>
    </section>
  );
}
