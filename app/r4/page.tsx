import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import HeroCloseup from "@/components/home/heroes/rebrand/HeroCloseup";

export const metadata: Metadata = {
  title: "BitFest 4.0 — 4th KUET CSE National Fest",
  description:
    "Ten national competitions in programming, AI, data science, research, robotics, cybersecurity, business and esports. 5–6 February 2027 at KUET, Khulna. 700K BDT in prizes.",
  robots: { index: false },
};

// Version R4 · Up close. Remove this route once a version is picked.
export default function HomeR4() {
  return <HomePage hero={<HeroCloseup />} />;
}
