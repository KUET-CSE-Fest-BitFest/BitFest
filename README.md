# Bitfest2027

The website for BitFest 2027, the 3rd KUET CSE National Fest (29–30 January 2027, KUET campus, Khulna).

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · GSAP ScrollTrigger · Lenis

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Pages

- `/`: the home page: chip hero, key dates, programme, partners, FAQ, last edition's photos.
- `/r4`: the alternative home hero (Up close), kept as a second version.
- `/events/<slug>`: one page per contest (`iupc`, `ai-hackathon`, `datathon`, `3mt`, `project-showcase`, `lfr`, `soccer-bot`, `ctf`, `it-case`, `gaming`), each with its own live hero.

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

## Deploy (cPanel)

The site is a static export (`output: "export"` → `out/`) hosted on the BdREN cPanel account `csefestkuet`,
live at https://csefest.kuet.ac.bd.

1. Push to `main`. The **Build for cPanel** workflow (`.github/workflows/cpanel-build.yml`) builds the site and
   commits the result to the `cpanel` branch (about 2 minutes). Never edit `cpanel` by hand.
2. In cPanel → Git Version Control → `BitFest` → Manage → Pull or Deploy: **Update from Remote**, then
   **Deploy HEAD Commit**. `.cpanel.yml` (from `deploy/cpanel.yml`) copies the build into `public_html`.

Server rules (clean URLs, 404 page, caching, compression) are in `public/.htaccess`, with longer cache times
in `public/past/.htaccess`, `public/og/.htaccess` and the `_next/static/.htaccess` the workflow writes.
SEO lives in `app/layout.tsx` (site-wide metadata, `metadataBase`), `app/robots.ts`, `app/sitemap.ts`, the
JSON-LD in `app/page.tsx`, and each contest's `generateMetadata`. Set `NEXT_PUBLIC_SITE_URL` to change the domain.
