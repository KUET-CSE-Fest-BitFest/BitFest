import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import HeroPinout from "@/components/home/heroes/HeroPinout";
import { events } from "@/lib/fest";

const SITE = "https://kuetbitfest2027.com";
const kuet = {
  "@type": "Place",
  name: "Khulna University of Engineering & Technology (KUET)",
  address: { "@type": "PostalAddress", addressLocality: "Khulna", postalCode: "9203", addressCountry: "BD" },
};
const organizer = { "@type": "Organization", name: "Department of CSE, KUET", url: SITE };

// Structured data so search engines can show the fest (and each contest) as events.
const festJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "BitFest 2027 — 3rd KUET CSE National Fest",
  description:
    "Ten national competitions in programming, AI, data science, research, robotics, cybersecurity, business and esports at KUET, Khulna.",
  startDate: "2027-01-29",
  endDate: "2027-01-30",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: kuet,
  image: [`${SITE}/og/home.jpg`],
  url: SITE,
  organizer,
  subEvent: events.map((e) => ({
    "@type": "Event",
    name: e.name,
    description: e.line,
    startDate: e.day.startsWith("29") ? "2027-01-29" : "2027-01-30",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: kuet,
    image: [`${SITE}/og/${e.slug}.jpg`],
    url: `${SITE}/events/${e.slug}`,
    organizer,
  })),
};

export const metadata: Metadata = {
  title: "BitFest 2027 — 3rd KUET CSE National Fest",
  description:
    "Ten national competitions in programming, AI, data science, research, robotics, cybersecurity, business and esports. 29–30 January 2027 at KUET, Khulna. 700K BDT in prizes.",
  alternates: { canonical: "/" },
};

// Version R2 · Pinout, lit. The other version (R4 · Up close) is at /r4.
export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(festJsonLd) }} />
      <HomePage hero={<HeroPinout glow="orbit" seat="board" lid="live" />} />
    </>
  );
}
