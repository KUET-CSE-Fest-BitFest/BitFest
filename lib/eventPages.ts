// Content for each contest's own page, from the BitFest 2027 sponsorship proposal (dates, team sizes,
// fees, prize totals, judging). Anything in [BRACKETS] is still a placeholder for the organizers.
import { about } from "./content";

export type EventPage = {
  slug: string;
  /** For search results and link previews. */
  description: string;
  lead: string;
  /** The About section's paragraph (the hero carries `lead`). */
  about: string;
  points: { t: string; d: string }[];
  facts: { k: string; v: string }[];
  timeline: { when: string; t: string; d: string }[];
  /** Thousands of BDT. `places` (champion, 1st and 2nd runner-up) once the rulebook gives the split. */
  prizes: { total: number; places?: [number, number, number]; note: string };
  faqs: { q: string; a: string }[];
  registerHref: string;
  rulebookHref: string;
};

export const eventPages: Record<string, EventPage> = {
  "soccer-bot": {
    slug: "soccer-bot",
    description: "Robot soccer at BitFest 4.0: teams of four, group matches and knockouts on 5 February at KUET.",
    lead: "Robot soccer on a purpose-built field. Teams design, build and drive their robots through group matches and a knockout bracket on Friday, 5 February.",
    about: "Teams of four design, build and drive robots that play soccer on a purpose-built field. Matches run through a group stage and then a knockout bracket on Friday, 5 February, with the finals ending by 5 pm. It tests mechanical design, control and match strategy.",
    points: about.map((a) => ({ t: a.t, d: a.d })),
    facts: [
      { k: "Final", v: "Fri 5 Feb 2027" },
      { k: "Team size", v: "4 members" },
      { k: "Registration", v: "BDT 2,000 per team" },
      { k: "Onsite teams", v: "30" },
    ],
    timeline: [
      { when: "30 Nov", t: "Registration opens", d: "Register your team of four online." },
      { when: "12 Jan", t: "Registration closes", d: "The team list is locked." },
      { when: "5 Feb", t: "Group matches", d: "Teams play their group matches on the field from the morning." },
      { when: "5 Feb", t: "Knockouts and final", d: "The knockout bracket, then the final, all done by 5 pm." },
    ],
    prizes: { total: 50, note: "Ranked on match results through the group stage and the knockout." },
    faqs: [
      { q: "Who can take part?", a: "University students from across Bangladesh, in teams of four." },
      { q: "Is there a registration fee?", a: "BDT 2,000 per team. [PAYMENT METHOD]" },
      { q: "When do matches happen?", a: "On Friday, 5 February 2027 at KUET: group matches first, then the knockout bracket, with the finals ending by 5 pm." },
      { q: "How is it decided?", a: "On match results, through the group stage and then the knockout." },
      { q: "Do we bring our own controller and batteries?", a: "[ANSWER]" },
    ],
    registerHref: "#", // [REGISTRATION FORM URL]
    rulebookHref: "#", // [RULEBOOK PDF URL]
  },
  datathon: {
    slug: "datathon",
    description: "Real-world datasets, an online preliminary on a leaderboard, and the top 30 teams in an onsite final at KUET on 6 February. The data science contest at BitFest 4.0.",
    lead: "Real-world datasets and a live leaderboard. 150+ teams enter the online preliminary; the top 30 come to KUET for the final on 6 February.",
    about: "A data science and machine learning contest on real-world datasets: cleaning, modelling and explaining. The online preliminary runs on a leaderboard platform from 13 to 22 January, and the top 30 of 150+ teams are invited to the onsite final at KUET on Saturday, 6 February, from 9 am to 3 pm.",
    points: [
      { t: "Clean", d: "Get a real-world dataset into shape." },
      { t: "Model", d: "Build, validate and climb the preliminary leaderboard." },
      { t: "Explain", d: "Take the final's hidden test set, then present your approach to the judges." },
    ],
    facts: [
      { k: "Final", v: "Sat 6 Feb 2027" },
      { k: "Team size", v: "3 members" },
      { k: "Registration", v: "BDT 1,000 per team" },
      { k: "Onsite teams", v: "Top 30 of 150+" },
    ],
    timeline: [
      { when: "30 Nov", t: "Registration opens", d: "Form a team of three and register online." },
      { when: "12 Jan", t: "Registration closes", d: "The team list is locked for the preliminary." },
      { when: "13–22 Jan", t: "Online preliminary", d: "On a leaderboard platform. BDT 1,000 per team is paid at this stage." },
      { when: "24 Jan", t: "Finalists announced", d: "The top 30 teams are invited to KUET." },
      { when: "6 Feb", t: "Onsite final", d: "9 am to 3 pm on the KUET campus." },
    ],
    prizes: { total: 80, note: "Judged first on the score on a hidden test set, then on approach and presentation." },
    faqs: [
      { q: "Who can take part?", a: "University students from across Bangladesh, in teams of three." },
      { q: "Where does the preliminary happen?", a: "Online, on a leaderboard platform, from 13 to 22 January 2027. [LINK TO THE COMPETITION PAGE]" },
      { q: "Who goes to the final?", a: "The top 30 teams of the preliminary, announced on 24 January." },
      { q: "Is there a registration fee?", a: "BDT 1,000 per team, paid at the preliminary. [PAYMENT METHOD]" },
      { q: "How is the final judged?", a: "First on your score on a hidden test set, then on your approach and presentation." },
    ],
    registerHref: "#", // [REGISTRATION FORM URL]
    rulebookHref: "#", // [RULEBOOK PDF URL]
  },
  iupc: {
    slug: "iupc",
    description: "The Inter-University Programming Contest at BitFest 4.0: teams of three with a coach, ICPC rules, a five-hour main contest at KUET on 6 February.",
    lead: "The flagship of BitFest. Teams of three solve algorithmic problems on an ICPC-style judge: a mock contest on Friday, then the five-hour main contest on Saturday, 6 February.",
    about: "Three-member teams from universities across Bangladesh, each with a coach, solve algorithmic problems on an ICPC-style judge. A mock contest at 3 pm on Friday, 5 February lets every team try the setup; the five-hour main contest runs on Saturday, 6 February. Teams rank by problems solved, then by total penalty time.",
    points: [
      { t: "Read", d: "Work through the problem set as a team of three." },
      { t: "Code", d: "Five hours to turn ideas into accepted solutions." },
      { t: "Submit", d: "Solved problems, then penalty time, set the ranking." },
    ],
    facts: [
      { k: "Main contest", v: "Sat 6 Feb 2027" },
      { k: "Team size", v: "3 + coach" },
      { k: "Registration", v: "BDT 5,500 per team" },
      { k: "Onsite teams", v: "150" },
    ],
    timeline: [
      { when: "30 Nov", t: "Registration opens", d: "Register a team of three and its coach online." },
      { when: "12 Jan", t: "Registration closes", d: "The team list is locked." },
      { when: "5 Feb", t: "Mock contest", d: "3 pm on the KUET campus: try the judge and the machines." },
      { when: "6 Feb", t: "Main contest", d: "Five hours on an ICPC-style judge." },
      { when: "6 Feb", t: "Prize ceremony", d: "At the festival's closing, before CSE Night." },
    ],
    prizes: { total: 175, note: "Ranked on problems solved, then total penalty time, under ICPC rules." },
    faqs: [
      { q: "Who can take part?", a: "Teams of three university students from across Bangladesh, each with a coach." },
      { q: "Is there a registration fee?", a: "BDT 5,500 per team. [PAYMENT METHOD]" },
      { q: "When is the contest?", a: "A mock contest at 3 pm on Friday, 5 February, then the five-hour main contest on Saturday, 6 February." },
      { q: "How are teams ranked?", a: "By problems solved, then by total penalty time, under ICPC rules." },
      { q: "Which languages can we use?", a: "[ALLOWED LANGUAGES AND JUDGE DETAILS]" },
    ],
    registerHref: "#", // [REGISTRATION FORM URL]
    rulebookHref: "#", // [RULEBOOK PDF URL]
  },
  "ai-hackathon": {
    slug: "ai-hackathon",
    description: "The AI Hackathon at BitFest 4.0: a free online preliminary, then 60 teams build working AI products at KUET on 5 February.",
    lead: "Build a working AI product in a day. A free online preliminary picks 60 teams from 150+ for the onsite final on Friday, 5 February.",
    about: "Teams of three build working AI products for real problems, from applied machine learning to generative-AI tools. The online preliminary runs from 13 to 22 January and is free to enter; the top 60 of 150+ teams come to KUET for the onsite final on Friday, 5 February, from 10 am to 7 pm, with a prayer break from 1 to 2 pm.",
    points: [
      { t: "Frame", d: "Pick a real problem worth solving." },
      { t: "Build", d: "A day on campus to make it work." },
      { t: "Demo", d: "Show it working, then pitch it to the judges." },
    ],
    facts: [
      { k: "Final", v: "Fri 5 Feb 2027" },
      { k: "Team size", v: "3 members" },
      { k: "Registration", v: "Free prelim · BDT 2,500 onsite" },
      { k: "Onsite teams", v: "Top 60 of 150+" },
    ],
    timeline: [
      { when: "30 Nov", t: "Registration opens", d: "Register a team of three online." },
      { when: "12 Jan", t: "Registration closes", d: "The team list is locked." },
      { when: "13–22 Jan", t: "Online preliminary", d: "Free to enter." },
      { when: "24 Jan", t: "Finalists announced", d: "The top 60 teams are invited to KUET; BDT 2,500 per selected team." },
      { when: "5 Feb", t: "Onsite final", d: "10 am to 7 pm, with a prayer break from 1 to 2 pm." },
    ],
    prizes: { total: 100, note: "Judged on problem fit, technical depth, a working demo and the pitch." },
    faqs: [
      { q: "Who can take part?", a: "University students from across Bangladesh, in teams of three." },
      { q: "Is there a registration fee?", a: "The online preliminary is free. Teams selected for the final pay BDT 2,500. [PAYMENT METHOD]" },
      { q: "What happens in the preliminary?", a: "[PRELIMINARY FORMAT]" },
      { q: "How long is the final?", a: "From 10 am to 7 pm on Friday, 5 February, with a prayer break from 1 to 2 pm." },
      { q: "How is it judged?", a: "On problem fit, technical depth, a working demo and the pitch." },
    ],
    registerHref: "#", // [REGISTRATION FORM URL]
    rulebookHref: "#", // [RULEBOOK PDF URL]
  },
  "3mt": {
    slug: "3mt",
    description: "3 Minute Thesis at BitFest 4.0: teams of two present a research project in three minutes and one slide at KUET on 6 February.",
    lead: "One research project, three minutes, one slide. Teams of two explain their work and why it matters to a non-specialist audience on Saturday, 6 February.",
    about: "Research communication in three minutes and one slide. Teams of two present a research project and why it matters, judged on clarity, depth and engagement with a non-specialist audience. Presentations run on Saturday, 6 February at KUET.",
    points: [
      { t: "Distil", d: "Your research, down to what matters." },
      { t: "Design", d: "One slide to carry it." },
      { t: "Deliver", d: "Three minutes for a non-specialist audience." },
    ],
    facts: [
      { k: "Presentations", v: "Sat 6 Feb 2027" },
      { k: "Team size", v: "2 members" },
      { k: "Registration", v: "BDT 1,000 per team" },
      { k: "Onsite teams", v: "30" },
    ],
    timeline: [
      { when: "30 Nov", t: "Registration opens", d: "Register a team of two online." },
      { when: "12 Jan", t: "Registration closes", d: "The team list is locked." },
      { when: "6 Feb", t: "Presentations", d: "Three minutes and one slide per team." },
      { when: "6 Feb", t: "Prize ceremony", d: "At the festival's closing, before CSE Night." },
    ],
    prizes: { total: 35, note: "Judged on clarity, engagement and impact within three minutes." },
    faqs: [
      { q: "Who can take part?", a: "University students from across Bangladesh, in teams of two." },
      { q: "Is there a registration fee?", a: "BDT 1,000 per team. [PAYMENT METHOD]" },
      { q: "What research can we present?", a: "[ELIGIBLE RESEARCH]" },
      { q: "What happens at three minutes?", a: "[TIME RULE]" },
      { q: "How is it judged?", a: "On clarity, engagement and impact within three minutes." },
    ],
    registerHref: "#", // [REGISTRATION FORM URL]
    rulebookHref: "#", // [RULEBOOK PDF URL]
  },
  "project-showcase": {
    slug: "project-showcase",
    description: "Project Showcase at BitFest 4.0: teams of up to three demo working software and hardware to judges and visitors at KUET on 5 February.",
    lead: "An exhibition of working software and hardware. Teams of up to three demo their projects to judges and visitors on Friday, 5 February.",
    about: "An exhibition of working software and hardware projects. Teams of up to three set up a stall, demo to judges and visitors, and are scored on innovation, technical depth, practicality and presentation. The exhibition opens at 10 am on Friday, 5 February, and judging ends at 5 pm.",
    points: [
      { t: "Build", d: "Bring a project that works." },
      { t: "Exhibit", d: "Demo it at your stall to judges and visitors." },
      { t: "Explain", d: "Show why it matters and how it holds up." },
    ],
    facts: [
      { k: "Exhibition", v: "Fri 5 Feb 2027" },
      { k: "Team size", v: "Up to 3 members" },
      { k: "Registration", v: "BDT 1,500 per team" },
      { k: "Onsite teams", v: "35" },
    ],
    timeline: [
      { when: "30 Nov", t: "Registration opens", d: "Register your team and project online." },
      { when: "12 Jan", t: "Registration closes", d: "The team list is locked." },
      { when: "5 Feb", t: "Exhibition opens", d: "Stalls open to judges and visitors at 10 am." },
      { when: "5 Feb", t: "Judging ends", d: "Scores are in by 5 pm." },
      { when: "6 Feb", t: "Prize ceremony", d: "At the festival's closing, before CSE Night." },
    ],
    prizes: { total: 45, note: "Judged on innovation, technical complexity, practicality and presentation." },
    faqs: [
      { q: "Who can take part?", a: "University students from across Bangladesh, in teams of up to three." },
      { q: "Is there a registration fee?", a: "BDT 1,500 per team. [PAYMENT METHOD]" },
      { q: "Software or hardware?", a: "Either: any working software or hardware project." },
      { q: "What does a stall come with?", a: "A display board and power. [STALL SIZE]" },
      { q: "How is it judged?", a: "On innovation, technical complexity, practicality and presentation." },
    ],
    registerHref: "#", // [REGISTRATION FORM URL]
    rulebookHref: "#", // [RULEBOOK PDF URL]
  },
  lfr: {
    slug: "lfr",
    description: "Line Following Robot at BitFest 4.0: autonomous robots race a track of junctions, gaps and curves at KUET on 5 February.",
    lead: "Autonomous robots race a complex track of junctions, gaps and curves. The fastest clean run wins, on Friday, 5 February.",
    about: "Teams of three build autonomous robots that follow a line around a complex track with junctions, gaps and curves. It tests sensor calibration, control algorithms and build quality. Runs take place on Friday, 5 February, with the finals done by 5 pm; the fastest valid run wins.",
    points: [
      { t: "Calibrate", d: "Sensors that read the line in any light." },
      { t: "Tune", d: "Control that holds the curves and finds the junctions." },
      { t: "Race", d: "The fastest clean run takes it." },
    ],
    facts: [
      { k: "Final", v: "Fri 5 Feb 2027" },
      { k: "Team size", v: "3 members" },
      { k: "Registration", v: "BDT 1,500 per team" },
      { k: "Onsite teams", v: "30" },
    ],
    timeline: [
      { when: "30 Nov", t: "Registration opens", d: "Register a team of three online." },
      { when: "12 Jan", t: "Registration closes", d: "The team list is locked." },
      { when: "5 Feb", t: "Timed runs", d: "Every robot runs the track from the morning." },
      { when: "5 Feb", t: "Finals", d: "The fastest robots run again, done by 5 pm." },
      { when: "6 Feb", t: "Prize ceremony", d: "At the festival's closing, before CSE Night." },
    ],
    prizes: { total: 55, note: "Ranked on the fastest valid run and track completion." },
    faqs: [
      { q: "Who can take part?", a: "University students from across Bangladesh, in teams of three." },
      { q: "Is there a registration fee?", a: "BDT 1,500 per team. [PAYMENT METHOD]" },
      { q: "What is the track like?", a: "Junctions, gaps and curves. [TRACK SPECIFICATION]" },
      { q: "Does the robot have to be autonomous?", a: "Yes: it follows the line on its own. [ROBOT RULES]" },
      { q: "How is it decided?", a: "On the fastest valid run and track completion." },
    ],
    registerHref: "#", // [REGISTRATION FORM URL]
    rulebookHref: "#", // [RULEBOOK PDF URL]
  },
  ctf: {
    slug: "ctf",
    description: "Capture The Flag at BitFest 4.0: a jeopardy-style cybersecurity contest for teams of four, live scoreboard, at KUET on 6 February.",
    lead: "A jeopardy-style cybersecurity contest. Teams of four capture flags in web, crypto, forensics, reversing and pwn to climb a live scoreboard on Saturday, 6 February.",
    about: "Teams of four solve jeopardy-style challenges across web exploitation, cryptography, forensics, reverse engineering and binary exploitation. Each captured flag scores points on a live scoreboard, and ties are broken by time. The contest runs on Saturday, 6 February at KUET.",
    points: [
      { t: "Find", d: "Five categories of hidden flags." },
      { t: "Exploit", d: "Break the web app, the cipher, the binary." },
      { t: "Capture", d: "Every flag climbs the live scoreboard." },
    ],
    facts: [
      { k: "Contest", v: "Sat 6 Feb 2027" },
      { k: "Team size", v: "4 members" },
      { k: "Registration", v: "BDT 1,000 per team" },
      { k: "Onsite teams", v: "40" },
    ],
    timeline: [
      { when: "30 Nov", t: "Registration opens", d: "Register a team of four online." },
      { when: "12 Jan", t: "Registration closes", d: "The team list is locked." },
      { when: "6 Feb", t: "Contest", d: "Challenges open on the live scoreboard." },
      { when: "6 Feb", t: "Prize ceremony", d: "At the festival's closing, before CSE Night." },
    ],
    prizes: { total: 70, note: "Points from captured flags; ties broken by time." },
    faqs: [
      { q: "Who can take part?", a: "University students from across Bangladesh, in teams of four." },
      { q: "Is there a registration fee?", a: "BDT 1,000 per team. [PAYMENT METHOD]" },
      { q: "What are the categories?", a: "Web exploitation, cryptography, forensics, reverse engineering and binary exploitation." },
      { q: "What should we bring?", a: "[LAPTOPS, TOOLS AND NETWORK RULES]" },
      { q: "How are ties broken?", a: "By time: the team that reached the score first ranks higher." },
    ],
    registerHref: "#", // [REGISTRATION FORM URL]
    rulebookHref: "#", // [RULEBOOK PDF URL]
  },
  "it-case": {
    slug: "it-case",
    description: "The IT Business Case Competition at BitFest 4.0: a written online round, then 20 teams defend their strategy before a jury at KUET on 6 February.",
    lead: "Teams act as consultants on a real business-technology problem: analyse the case, build the numbers, then defend a strategy before a jury on Saturday, 6 February.",
    about: "Teams of three act as consultants on a real business-technology problem: they analyse the case, build the numbers and propose a strategy. A written online round from 13 to 22 January selects 20 teams, who present and defend their solution before a jury on Saturday, 6 February.",
    points: [
      { t: "Analyse", d: "Find what the case is really about." },
      { t: "Model", d: "Build the numbers behind your strategy." },
      { t: "Defend", d: "Present it, then hold it up under the jury's questions." },
    ],
    facts: [
      { k: "Final", v: "Sat 6 Feb 2027" },
      { k: "Team size", v: "3 members" },
      { k: "Registration", v: "BDT 1,000 per team" },
      { k: "Onsite teams", v: "Top 20" },
    ],
    timeline: [
      { when: "30 Nov", t: "Registration opens", d: "Register a team of three online." },
      { when: "12 Jan", t: "Registration closes", d: "The team list is locked." },
      { when: "13–22 Jan", t: "Written round", d: "An online round: the case, analysed in writing." },
      { when: "24 Jan", t: "Finalists announced", d: "The top 20 teams are invited to KUET." },
      { when: "6 Feb", t: "Case round and final", d: "Present and defend your solution before the jury." },
    ],
    prizes: { total: 50, note: "Judged on analysis, feasibility, financial reasoning and the final defence." },
    faqs: [
      { q: "Who can take part?", a: "University students from across Bangladesh, in teams of three." },
      { q: "Is there a registration fee?", a: "BDT 1,000 per team. [PAYMENT METHOD]" },
      { q: "What is the written round?", a: "An online round from 13 to 22 January: a case to analyse in writing. [FORMAT AND LENGTH]" },
      { q: "Who goes to the final?", a: "The top 20 teams of the written round, announced on 24 January." },
      { q: "How is the final judged?", a: "On analysis, feasibility, financial reasoning and the final defence." },
    ],
    registerHref: "#", // [REGISTRATION FORM URL]
    rulebookHref: "#", // [RULEBOOK PDF URL]
  },
  gaming: {
    slug: "gaming",
    description: "Gaming at BitFest 4.0: Valorant, FIFA and Clash Royale, with group stages and finals on the festival screen at KUET on 5 February.",
    lead: "Esports in three titles: Valorant, FIFA and Clash Royale. Group stages and finals run on Friday, 5 February, from 10 am to 5 pm, on the festival screen.",
    about: "BitFest's esports competition runs three titles: Valorant (16 teams of five), FIFA (32 players) and Clash Royale (32 players). Group stages and finals take place on Friday, 5 February, from 10 am to 5 pm, shown on the festival screen.",
    points: [
      { t: "Groups", d: "Every entry plays a group stage." },
      { t: "Knockouts", d: "The best go through to the bracket." },
      { t: "Finals", d: "Played out on the festival screen." },
    ],
    facts: [
      { k: "Finals", v: "Fri 5 Feb 2027" },
      { k: "Titles", v: "Valorant · FIFA · Clash Royale" },
      { k: "Registration", v: "From BDT 300 per player" },
      { k: "Entries", v: "80" },
    ],
    timeline: [
      { when: "30 Nov", t: "Registration opens", d: "Register for one of the three titles online." },
      { when: "12 Jan", t: "Registration closes", d: "The team list is locked." },
      { when: "5 Feb", t: "Group stages", d: "All three titles, from 10 am." },
      { when: "5 Feb", t: "Finals", d: "On the festival screen, done by 5 pm." },
      { when: "6 Feb", t: "Prize ceremony", d: "At the festival's closing, before CSE Night." },
    ],
    prizes: { total: 40, note: "Decided by match results under each title's tournament rules." },
    faqs: [
      { q: "Which games?", a: "Valorant (16 teams of five), FIFA (32 players) and Clash Royale (32 players)." },
      { q: "Is there a registration fee?", a: "Valorant BDT 1,500 per team; FIFA BDT 400 and Clash Royale BDT 300 per player. [PAYMENT METHOD]" },
      { q: "Do we bring our own devices?", a: "Gaming PCs, consoles and the network are provided. [WHAT TO BRING]" },
      { q: "Can I enter more than one title?", a: "[ANSWER]" },
      { q: "How are matches decided?", a: "By results under each title's tournament rules." },
    ],
    registerHref: "#", // [REGISTRATION FORM URL]
    rulebookHref: "#", // [RULEBOOK PDF URL]
  },
};

/** The register button: the form once its URL is set; until then it says when registration opens and
    scrolls to the contest's timeline, so the button never leads nowhere. */
export const registerCta = (href: string) =>
  href && href !== "#" ? { href, label: "Register your team", short: "Register" } : { href: "#timeline", label: "Registration opens 30 Nov", short: "Register" };
/** The rulebook button only shows once there is a rulebook to open. */
export const hasRulebook = (href: string) => Boolean(href) && href !== "#";
