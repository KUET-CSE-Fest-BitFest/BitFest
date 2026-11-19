import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import HeroCloseup from "@/components/home/heroes/rebrand/HeroCloseup";
import { festDescription } from "@/lib/fest";

export const metadata: Metadata = {
  title: "BitFest 4.0 — 4th KUET CSE National Fest",
  description: festDescription,
  robots: { index: false },
};

// Version R4 · Up close. Remove this route once a version is picked.
export default function HomeR4() {
  return <HomePage hero={<HeroCloseup />} />;
}
