import type { Metadata } from "next";
import HomePage from "@/components/redesign/HomePage";
import HeroPinout from "@/components/redesign/heroes/HeroPinout";
import { festDescription } from "@/lib/fest";

/* The redesign, which is now also the landing page (/). Kept at this address so links shared
   while it was being built still work. Out of search results; / is the canonical page. */
export const metadata: Metadata = {
  title: "BitFest 4.0 · 4th KUET CSE Innovation Festival",
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
