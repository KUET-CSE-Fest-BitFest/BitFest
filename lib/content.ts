// Everything marked [LIKE THIS] is a placeholder — replace with the official details.

export const event = {
  name: "Soccer Bot",
  category: "Robotics",
  index: "03",
  total: "08",
  tagline: "Build it. Drive it. Score.",
  intro:
    "Teams bring their own robot cars and battle head-to-head on the arena — outplaying the other bot to put the ball in its goal.",
  registerHref: "#register",
  rulebookHref: "#", // [RULEBOOK PDF URL]
  registrationUrl: "#", // [REGISTRATION FORM URL]
};

export const facts = [
  { label: "Final", value: "3 Jan 2027" },
  { label: "Venue", value: "Student Welfare Center" },
  { label: "Prize pool", value: "70K", suffix: "+ BDT", accent: true },
  { label: "Team size", value: "[TEAM SIZE]" },
  { label: "Registration closes", value: "26 Dec" },
];

export const about = [
  { k: "01", t: "Build", d: "Design and wire your own robot within the spec — chassis, drive, kicker, power." },
  { k: "02", t: "Drive", d: "Control it live on the arena. Speed matters, but control wins matches." },
  { k: "03", t: "Score", d: "Outplay the opponent bot and put the ball in their net before the whistle." },
];

export const parts = [
  { name: "Chassis", spec: "[W × L] mm", rule: "The robot must fit within a [MAX W × L] mm footprint at the start of every match." },
  { name: "Drive system", spec: "[TYPES]", rule: "Allowed drive types: [ALLOWED WHEELS / TRACKS]. No ground-damaging treads." },
  { name: "Kicker", spec: "[TYPE]", rule: "Active kicking mechanisms are [ALLOWED / NOT ALLOWED]. Ball may not be trapped." },
  { name: "Power", spec: "≤ [V] V", rule: "On-board supply must not exceed [MAX] V. Batteries must be secured and insulated." },
  { name: "Controller", spec: "[WIRED / RF]", rule: "Control method: [WIRED / WIRELESS RULES]. Frequencies must not interfere with other teams." },
];

export const rules = [
  { n: "01", t: "Match length", d: "[X] minutes per half, [Y] minute break. The clock stops only at the referee's call." },
  { n: "02", t: "Kick-off", d: "Ball placed at centre. Bots start inside their own half, behind the line." },
  { n: "03", t: "Goals", d: "A goal counts when the whole ball crosses the goal line between the posts." },
  { n: "04", t: "Fouls", d: "Ramming, pinning or holding the ball for more than [N] seconds gives a free restart to the opponent." },
  { n: "05", t: "Repairs", d: "One technical time-out of [N] minutes per team per match." },
  { n: "06", t: "Ties", d: "Group stage draws stand. Knockout draws go to a [GOLDEN GOAL / PENALTY] decider." },
];

export const timeline = [
  { when: "[DATE]", t: "Registration opens", d: "Submit team details and your bot's spec sheet." },
  { when: "26 Dec", t: "Registration closes", d: "Final team list and bot specs locked." },
  { when: "[DATE]", t: "Robot inspection", d: "Size, weight and power checks before any match." },
  { when: "[DATE]", t: "Group stage", d: "Round-robin groups. Top teams advance." },
  { when: "[DATE]", t: "Knockouts", d: "Quarter-finals and semi-finals, single elimination." },
  { when: "3 Jan", t: "Grand final", d: "Two bots. One arena. Champion crowned." },
];

export const prizes = [
  { place: "Champion", amount: "35K", tone: "orange" },
  { place: "1st runner-up", amount: "20K", tone: "ink" },
  { place: "2nd runner-up", amount: "15K", tone: "ink" },
] as const;

export const faqs = [
  { q: "Who can participate?", a: "[ELIGIBILITY — e.g. university and college students from any institution in Bangladesh.]" },
  { q: "Can one person be in two teams?", a: "[ANSWER]" },
  { q: "Do we need to bring our own controller and batteries?", a: "[ANSWER]" },
  { q: "Is there a registration fee?", a: "[FEE AND PAYMENT METHOD]" },
  { q: "What happens if our bot fails inspection?", a: "[ANSWER — e.g. you get one chance to fix it before your first match.]" },
];

export const otherEvents = [
  { name: "IUPC", tag: "Programming", href: "#" },
  { name: "Hackathon", tag: "AI & API · 24h", href: "#" },
  { name: "Project Showcase", tag: "Innovation", href: "#" },
  { name: "Gaming Contest", tag: "Esports", href: "#" },
  { name: "[EVENT 06]", tag: "[CATEGORY]", href: "#" },
  { name: "[EVENT 07]", tag: "[CATEGORY]", href: "#" },
  { name: "[EVENT 08]", tag: "[CATEGORY]", href: "#" },
];
