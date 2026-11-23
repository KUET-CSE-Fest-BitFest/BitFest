import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import HeroPinout from "@/components/home/heroes/HeroPinout";
import { festDescription } from "@/lib/fest";

/* Backup: the first landing page (orange on dark), as it was before the redesign became the home
   page. Built from components/home; kept out of search results. */
export const metadata: Metadata = {
  title: "BitFest 4.0 · 4th KUET CSE National Fest",
  description: festDescription,
  robots: { index: false, follow: false },
};

export default function Classic() {
  return <HomePage hero={<HeroPinout glow="orbit" seat="board" lid="live" />} />;
}
