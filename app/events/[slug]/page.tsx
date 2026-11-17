import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventPageLayout from "@/components/event/EventPageLayout";
import { events, fest } from "@/lib/fest";
import { eventPages } from "@/lib/eventPages";
import IupcHero from "@/components/contests/IupcHero";
import AiHackathonHero from "@/components/contests/AiHackathonHero";
import DatathonHero from "@/components/datathon/Hero";
import ThesisHero from "@/components/contests/ThesisHero";
import ShowcaseHero from "@/components/contests/ShowcaseHero";
import LfrHero from "@/components/contests/LfrHero";
import SoccerHero from "@/components/soccer/Hero";
import CtfHero from "@/components/contests/CtfHero";
import CaseHero from "@/components/contests/CaseHero";
import GamingHero from "@/components/contests/GamingHero";

// Each contest's own live hero; the rest of the page is shared.
const HEROES: Record<string, ComponentType> = {
  iupc: IupcHero,
  "ai-hackathon": AiHackathonHero,
  datathon: DatathonHero,
  "3mt": ThesisHero,
  "project-showcase": ShowcaseHero,
  lfr: LfrHero,
  "soccer-bot": SoccerHero,
  ctf: CtfHero,
  "it-case": CaseHero,
  gaming: GamingHero,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = events.find((x) => x.slug === slug);
  const page = eventPages[slug];
  if (!e || !page) return {};
  return { title: `${e.name} — ${fest.name} ${fest.year}`, description: page.description };
}

export default async function ContestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = events.find((x) => x.slug === slug);
  const page = eventPages[slug];
  const Hero = HEROES[slug];
  if (!e || !page || !Hero) notFound();
  return <EventPageLayout page={page} name={e.name} hero={<Hero />} />;
}
