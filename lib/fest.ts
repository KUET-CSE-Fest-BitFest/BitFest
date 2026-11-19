// Fest-wide facts and the ten competitions, from the BitFest 2027 sponsorship proposal (Dept. of CSE,
// KUET, November 2026): dates, team sizes, fees, prize money and the organizing clubs. Venues are not
// in it ("final clock times and venues are published with each event's rulebook").

export const fest = {
  name: "BitFest",
  /** The edition, shown after the name: "BitFest 4.0". The dates carry the year. */
  year: "4.0",
  edition: "4th KUET CSE National Fest",
  kicker: "4th KUET CSE National Fest",
  motto: "AI for Mankind, Society and the SDGs",
  blurb: "Ten national competitions in programming, AI, data science, research, robotics, innovation, cybersecurity, business and esports. Two days on the KUET campus, Khulna.",
  dates: "5–6 February 2027",
  venue: "KUET campus, Khulna",
  prizePool: "700K",
  email: "bitfest@cse.kuet.ac.bd",
  phone: "+880 1723-593626",
  facebook: "https://www.facebook.com/BitFestCSE",
};

export type FestEvent = {
  slug: string;
  name: string;
  /** Short form for tight spaces (chips, LED board). */
  short: string;
  kind: string;
  line: string;
  /** The onsite day: Friday 5 or Saturday 6 February 2027 (IUPC's mock contest is on the 5th). */
  day: string;
  venue: string;
  pool: string;
  /** The KUET club (or the BitFest team) that runs it. */
  club: string;
  team: string;
  fee: string;
  onsite: string;
  href: string;
};

// Every contest has its own page at /events/<slug>.
const E = (e: Omit<FestEvent, "venue" | "href"> & { href?: string }): FestEvent => ({ venue: "KUET campus", href: `/events/${e.slug}`, ...e });

export const events: FestEvent[] = [
  E({ slug: "iupc", name: "IUPC", short: "IUPC", kind: "Programming", line: "Inter-University Programming Contest, ICPC rules", day: "6 Feb", pool: "175K", club: "SGIPC", team: "3 + coach", fee: "BDT 5,500", onsite: "150 teams" }),
  E({ slug: "ai-hackathon", name: "AI Hackathon", short: "AI HACK", kind: "Artificial intelligence", line: "Build a working AI product in a day", day: "5 Feb", pool: "100K", club: "KMiNDS", team: "3", fee: "Free prelim · BDT 2,500 onsite", onsite: "60 of 150+ teams" }),
  E({ slug: "datathon", name: "Datathon", short: "DATATHON", kind: "Data science", line: "Real datasets, a leaderboard, then the final", day: "6 Feb", pool: "80K", club: "KMiNDS", team: "3", fee: "BDT 1,000", onsite: "30 of 150+ teams" }),
  E({ slug: "3mt", name: "3 Minute Thesis", short: "3MT", kind: "Research", line: "One project, three minutes, one slide", day: "6 Feb", pool: "35K", club: "KMiNDS", team: "2", fee: "BDT 1,000", onsite: "30 teams" }),
  E({ slug: "project-showcase", name: "Project Showcase", short: "SHOWCASE", kind: "Innovation", line: "Demo working software and hardware", day: "5 Feb", pool: "45K", club: "HACK", team: "Up to 3", fee: "BDT 1,500", onsite: "35 teams" }),
  E({ slug: "lfr", name: "Line Following Robot", short: "LFR", kind: "Robotics", line: "Autonomous robots race a complex track", day: "5 Feb", pool: "55K", club: "HACK", team: "3", fee: "BDT 1,500", onsite: "30 teams" }),
  E({ slug: "soccer-bot", name: "Soccer Bot", short: "SOCCER BOT", kind: "Robotics", line: "Robot soccer, groups then knockouts", day: "5 Feb", pool: "50K", club: "HACK", team: "4", fee: "BDT 2,000", onsite: "30 teams" }),
  E({ slug: "ctf", name: "Capture The Flag", short: "CTF", kind: "Cybersecurity", line: "Jeopardy-style flags on a live scoreboard", day: "6 Feb", pool: "70K", club: "KCSC", team: "4", fee: "BDT 1,000", onsite: "40 teams" }),
  E({ slug: "it-case", name: "IT Business Case", short: "IT CASE", kind: "Business", line: "Crack a business-technology case, then defend it", day: "6 Feb", pool: "50K", club: "BitFest team", team: "3", fee: "BDT 1,000", onsite: "20 teams" }),
  E({ slug: "gaming", name: "Gaming", short: "GAMING", kind: "Esports", line: "Valorant, FIFA and Clash Royale", day: "5 Feb", pool: "40K", club: "BitFest team", team: "1–5", fee: "Valorant BDT 1,500 · FIFA 400 · Clash Royale 300", onsite: "80 entries" }),
];

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Every contest now has its own page; the 2025 pages stay mapped for any contest set back to "#". */
const OLD: Record<string, string> = { iupc: "iupc", "ai-hackathon": "hackathon", lfr: "lfr", "project-showcase": "project-showcase", gaming: "gaming", "it-case": "it-case" };
export const oldSite = (slug: string) => (OLD[slug] ? `https://bitfest2025.netlify.app/${OLD[slug]}` : "/#schedule");
export const eventHref = (e: FestEvent) => (e.href !== "#" ? e.href : oldSite(e.slug));
export const isExternal = (e: FestEvent) => e.href === "#" && Boolean(OLD[e.slug]);

// The roadmap: registration 30 Nov 2026 – 12 Jan 2027, online rounds 13–22 Jan, finalists on 24 Jan,
// onsite finals on Fri 5 and Sat 6 Feb. Dates are day offsets from 30 Nov 2026 (43 = 12 Jan, 67 = 5 Feb).
export type Milestone = { kind: "window" | "deadline" | "round" | "shortlist" | "final"; from: number; to?: number; label: string; open?: boolean };
export const SCHEDULE_START = new Date(2026, 10, 30);
export const SCHEDULE_DAYS = 69;
const REG: Milestone = { kind: "window", from: 0, to: 43, label: "Registration" };
export const schedule: Record<string, Milestone[]> = {
  iupc: [REG, { kind: "final", from: 67, to: 68, label: "Mock contest Fri 3 pm, main contest Sat (5 hours)" }],
  "ai-hackathon": [
    REG,
    { kind: "round", from: 44, to: 53, label: "Online preliminary, free to enter" },
    { kind: "shortlist", from: 55, label: "Top 60 announced" },
    { kind: "final", from: 67, label: "Onsite final, 10 am – 7 pm" },
  ],
  datathon: [
    REG,
    { kind: "round", from: 44, to: 53, label: "Online preliminary on a leaderboard" },
    { kind: "shortlist", from: 55, label: "Top 30 announced" },
    { kind: "final", from: 68, label: "Onsite final, 9 am – 3 pm" },
  ],
  "3mt": [REG, { kind: "final", from: 68, label: "Presentations" }],
  "project-showcase": [REG, { kind: "final", from: 67, label: "Exhibition and judging, 10 am – 5 pm" }],
  lfr: [REG, { kind: "final", from: 67, label: "Runs and finals, until 5 pm" }],
  "soccer-bot": [REG, { kind: "final", from: 67, label: "Group matches and knockouts, until 5 pm" }],
  ctf: [REG, { kind: "final", from: 68, label: "Contest on a live scoreboard" }],
  "it-case": [
    REG,
    { kind: "round", from: 44, to: 53, label: "Written online round" },
    { kind: "shortlist", from: 55, label: "Top 20 announced" },
    { kind: "final", from: 68, label: "Case round and final" },
  ],
  gaming: [REG, { kind: "final", from: 67, label: "Group stages and finals, 10 am – 5 pm" }],
};

// "5 Feb" for a day offset. Formatted by hand and cached: the schedule asks for these labels hundreds of
// times while the home page starts up, and toLocaleDateString is slow on budget devices.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabels = new Map<number, string>();
export const dayLabel = (d: number) => {
  let label = dayLabels.get(d);
  if (label === undefined) {
    const t = new Date(SCHEDULE_START);
    t.setDate(t.getDate() + d);
    label = `${t.getDate()} ${MONTHS[t.getMonth()]}`;
    dayLabels.set(d, label);
  }
  return label;
};

// Prize money in thousands of BDT. The proposal gives each contest's total only; the split between
// places comes with each rulebook, so `top` stays empty.
export const prizes: Record<string, { top: [number, number, number] | null; extra?: string; total: number | null }> = Object.fromEntries(
  events.map((e) => [e.slug, { top: null, total: parseInt(e.pool, 10) }]),
);

// BitFest 2025's sponsors and media partner, as listed in the proposal. 2027 partners are not confirmed yet.
export const sponsors: { name: string; note?: string }[] = [
  { name: "MIAKI" },
  { name: "Brain Station 23" },
  { name: "City Group" },
  { name: "Apsis" },
  { name: "MicroMac" },
  { name: "NRBC Bank" },
  { name: "Suffix IT" },
  { name: "MSI" },
  { name: "Jamuna TV", note: "Media partner" },
];

// The four KUET clubs (and the BitFest team) that run the contests.
export const clubs = [
  { name: "SGIPC", runs: "IUPC" },
  { name: "KMiNDS", runs: "AI Hackathon, Datathon, 3 Minute Thesis" },
  { name: "HACK", runs: "Project Showcase, Line Following Robot, Soccer Bot" },
  { name: "KCSC", runs: "Capture The Flag" },
  { name: "BitFest team", runs: "IT Business Case, Gaming" },
];
