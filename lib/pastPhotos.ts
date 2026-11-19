// Photos from BitFest 2025's prize night (from the organizers' shared Drive folder), cropped to 4:3 and
// saved as WebP at three sizes (400, 680 and 1440 wide) for the home page gallery.
export const pastPhotos = [
  { src: "/past/bitfest-2025-01.webp", large: "/past/bitfest-2025-01-lg.webp", small: "/past/bitfest-2025-01-sm.webp", w: 680, h: 510, smallW: 400, alt: "The prize table on stage at BitFest 2025" },
  { src: "/past/bitfest-2025-02.webp", large: "/past/bitfest-2025-02-lg.webp", small: "/past/bitfest-2025-02-sm.webp", w: 680, h: 510, smallW: 400, alt: "A prize presented on stage at BitFest 2025" },
  { src: "/past/bitfest-2025-03.webp", large: "/past/bitfest-2025-03-lg.webp", small: "/past/bitfest-2025-03-sm.webp", w: 680, h: 510, smallW: 400, alt: "A prize presented on stage at BitFest 2025" },
  { src: "/past/bitfest-2025-04.webp", large: "/past/bitfest-2025-04-lg.webp", small: "/past/bitfest-2025-04-sm.webp", w: 680, h: 510, smallW: 400, alt: "A prize presented on stage at BitFest 2025" },
  { src: "/past/bitfest-2025-05.webp", large: "/past/bitfest-2025-05-lg.webp", small: "/past/bitfest-2025-05-sm.webp", w: 680, h: 510, smallW: 400, alt: "A prize presented on stage at BitFest 2025" },
  { src: "/past/bitfest-2025-06.webp", large: "/past/bitfest-2025-06-lg.webp", small: "/past/bitfest-2025-06-sm.webp", w: 680, h: 510, smallW: 400, alt: "A prize presented on stage at BitFest 2025" },
  { src: "/past/bitfest-2025-07.webp", large: "/past/bitfest-2025-07-lg.webp", small: "/past/bitfest-2025-07-sm.webp", w: 680, h: 510, smallW: 400, alt: "A prize presented on stage at BitFest 2025" },
  { src: "/past/bitfest-2025-08.webp", large: "/past/bitfest-2025-08-lg.webp", small: "/past/bitfest-2025-08-sm.webp", w: 680, h: 510, smallW: 400, alt: "A prize presented on stage at BitFest 2025" },
  { src: "/past/bitfest-2025-09.webp", large: "/past/bitfest-2025-09-lg.webp", small: "/past/bitfest-2025-09-sm.webp", w: 680, h: 510, smallW: 400, alt: "A prize presented on stage at BitFest 2025" },
  { src: "/past/bitfest-2025-10.webp", large: "/past/bitfest-2025-10-lg.webp", small: "/past/bitfest-2025-10-sm.webp", w: 680, h: 510, smallW: 400, alt: "A prize presented on stage at BitFest 2025" },
  { src: "/past/bitfest-2025-11.webp", large: "/past/bitfest-2025-11-lg.webp", small: "/past/bitfest-2025-11-sm.webp", w: 680, h: 510, smallW: 400, alt: "A winning team on stage at BitFest 2025 prize night" },
  { src: "/past/bitfest-2025-12.webp", large: "/past/bitfest-2025-12-lg.webp", small: "/past/bitfest-2025-12-sm.webp", w: 680, h: 510, smallW: 400, alt: "A prize presented on stage at BitFest 2025" },
  { src: "/past/bitfest-2025-13.webp", large: "/past/bitfest-2025-13-lg.webp", small: "/past/bitfest-2025-13-sm.webp", w: 680, h: 510, smallW: 400, alt: "A prize presented on stage at BitFest 2025" },
  { src: "/past/bitfest-2025-14.webp", large: "/past/bitfest-2025-14-lg.webp", small: "/past/bitfest-2025-14-sm.webp", w: 680, h: 510, smallW: 400, alt: "A prize cheque handed over under the BitFest 2025 banner" },
  { src: "/past/bitfest-2025-15.webp", large: "/past/bitfest-2025-15-lg.webp", small: "/past/bitfest-2025-15-sm.webp", w: 680, h: 510, smallW: 400, alt: "A winning team receives its cheque at BitFest 2025" },
  { src: "/past/bitfest-2025-16.webp", large: "/past/bitfest-2025-16-lg.webp", small: "/past/bitfest-2025-16-sm.webp", w: 680, h: 510, smallW: 400, alt: "A prize presented on stage at BitFest 2025" },
];

// The teams at BitFest 2025: group photos at the fest wall and teams at work on the contest floor
// (from the organizers' shared Drive folder), cropped to 3:2 and saved as WebP at 640, 1080 and 1600
// wide. They lead the gallery in its slider.
const TEAM_CAPTIONS = [
  "Teams together at the fest wall on prize night",
  "Three to a computer on the contest floor",
  "A team at the fest wall",
  "The contest hall, mid-round",
  "The whole room at the fest wall",
  "A team works a problem on paper",
  "Teammates at the fest wall",
  "Talking a solution through",
  "Under the lights on prize night",
  "A team at its computer",
  "Another team at the fest wall",
  "The contest floor from the back",
  "Heads down on a problem set",
  "One more for the album",
];
export const teamPhotos = TEAM_CAPTIONS.map((caption, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { sm: `/past/teams-${n}-sm.webp`, md: `/past/teams-${n}-md.webp`, lg: `/past/teams-${n}-lg.webp`, caption };
});
