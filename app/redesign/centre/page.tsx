import type { Metadata } from "next";
import HomePage from "@/components/redesign/HomePage";
import HeroCentre from "@/components/redesign/heroes/HeroCentre";
import { festDescription } from "@/lib/fest";

/* The redesign with the "Centre stage" hero (one wide lit panel, everything centred, a moving
   contest strip) in place of the chip. Kept as an option beside /redesign; out of search results. */
export const metadata: Metadata = {
  title: "BitFest 4.0 · 4th KUET CSE National Fest",
  description: festDescription,
  robots: { index: false, follow: false },
};

export default function RedesignCentre() {
  return (
    <div className="rd-theme contents">
      <HomePage hero={<HeroCentre />} />
    </div>
  );
}
