import type { Metadata } from "next";
import HomePage from "@/components/redesign/HomePage";
import HeroPinout from "@/components/redesign/heroes/HeroPinout";
import { festDescription } from "@/lib/fest";

/* The landing page redesign. It starts as an exact copy of the home page (/), built from its own
   components in components/redesign, so changes here never touch the live landing page. Content
   (dates, contests, questions, photos) stays shared through lib/. Kept out of search results. */
export const metadata: Metadata = {
  title: "BitFest 4.0 · 4th KUET CSE National Fest",
  description: festDescription,
  robots: { index: false, follow: false },
};

export default function Redesign() {
  // .rd-theme switches on the redesign's colours (app/globals.css, "Redesign theme"); it adds no box.
  return (
    <div className="rd-theme contents">
      <HomePage hero={<HeroPinout glow="orbit" seat="board" lid="live" />} />
    </div>
  );
}
