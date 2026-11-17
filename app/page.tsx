import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import HeroPinout from "@/components/home/heroes/HeroPinout";

export const metadata: Metadata = {
  title: "BitFest 2027 — 3rd KUET CSE National Fest",
  description:
    "Ten national competitions in programming, AI, data science, research, robotics, cybersecurity, business and esports. 29–30 January 2027 at KUET, Khulna. 700K BDT in prizes.",
};

// Version R2 · Pinout, lit. The other version (R4 · Up close) is at /r4.
export default function Home() {
  return <HomePage hero={<HeroPinout glow="orbit" seat="board" lid="live" />} />;
}
