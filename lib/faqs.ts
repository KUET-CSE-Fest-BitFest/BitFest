// Every question on the site in one list. General questions sit on the home page; each contest's own
// come from its page content (lib/eventPages). The home FAQ shows them all under topic chips; a
// contest page shows its own questions first, then the general ones.
import { eventPages } from "./eventPages";
import { events, PRIZES_ANNOUNCED } from "./fest";

export type Faq = { q: string; a: string; topic: string };

export const GENERAL = "General";

const general: { q: string; a: string }[] = [
  {
    q: "Who can take part?",
    a: "University students from across Bangladesh. Teams run from two members (3 Minute Thesis) to four (Soccer Bot and Capture The Flag); IUPC teams of three bring a coach, and gaming entries go from solo FIFA and Clash Royale players to Valorant teams of five.",
  },
  {
    q: "When and where is it?",
    a: "The onsite finals are on Friday 5 and Saturday 6 February 2027 on the KUET campus in Khulna, and CSE Night closes the festival on the evening of the 6th. Online rounds run before that, from 13 to 22 January.",
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
    a: PRIZES_ANNOUNCED
      ? "BDT 7,00,000 in cash prizes across the ten competitions, from BDT 35,000 for 3 Minute Thesis to BDT 1,75,000 for IUPC."
      : "BDT 7,00,000 in cash prizes across the ten competitions. Each contest's share is announced with its rulebook.",
  },
  {
    q: "Who organises BitFest?",
    a: "The Department of Computer Science and Engineering at KUET, with four student clubs: SGIPC runs IUPC; KMiNDS the AI Hackathon, the Datathon and 3MT; HACK the Project Showcase, Line Following Robot and Soccer Bot; KCSC Capture The Flag. Write to bitfest@cse.kuet.ac.bd.",
  },
];

export const generalFaqs: Faq[] = general.map((x) => ({ ...x, topic: GENERAL }));

/** Every question, general first, then each contest in programme order. */
export const allFaqs: Faq[] = [
  ...generalFaqs,
  ...events.flatMap((e) => (eventPages[e.slug]?.faqs ?? []).map((f) => ({ ...f, topic: e.name }))),
];

export const allTopics = [GENERAL, ...events.map((e) => e.name)];

/** A contest page's questions: its own (under its name), then the general ones. */
export const contestFaqs = (name: string, faqs: { q: string; a: string }[]): Faq[] => [
  ...faqs.map((f) => ({ ...f, topic: name })),
  ...generalFaqs,
];
