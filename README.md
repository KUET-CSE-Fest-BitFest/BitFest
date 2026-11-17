# Bitfest2027

The website for BitFest 2027, the 3rd KUET CSE National Fest (29–30 January 2027, KUET campus, Khulna).

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · GSAP ScrollTrigger · Lenis

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Pages

- `/` — the home page: chip hero, key dates, programme, partners, FAQ, last edition's photos.
- `/r4` — the alternative home hero (Up close), kept as a second version.
- `/events/<slug>` — one page per contest (`iupc`, `ai-hackathon`, `datathon`, `3mt`, `project-showcase`, `lfr`, `soccer-bot`, `ctf`, `it-case`, `gaming`), each with its own live hero.

## Where things live

| Path | What it is |
| --- | --- |
| `lib/fest.ts` | Fest facts, the ten contests (team size, fee, prize, club), the roadmap and past partners |
| `lib/eventPages.ts` | Each contest page's copy: about, facts, timeline, prizes, FAQ. Anything in `[BRACKETS]` is still a placeholder |
| `app/events/[slug]/page.tsx` | The contest route; maps each contest to its hero |
| `components/home/*` | Home page sections, nav and footer |
| `components/event/*` | The shared contest page: hero frame, about + timeline, prizes, FAQ, hero panel |
| `components/contests/*`, `components/soccer/Hero.tsx`, `components/datathon/Hero.tsx` | The contest heroes |
| `app/globals.css` | Colour tokens and the lit-lid, signal and hero styles |
| `public/og/*.jpg` | Social preview cards (1200×630): `home.jpg` and one per contest slug |

Content comes from the BitFest 2027 sponsorship proposal (Department of CSE, KUET).
