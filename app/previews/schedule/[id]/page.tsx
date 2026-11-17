import { notFound } from "next/navigation";
import HomeNav from "@/components/home/HomeNav";
import Schedule from "@/components/home/Schedule";
import ScheduleCalendar from "@/components/home/schedule/ScheduleCalendar";
import ScheduleRoad from "@/components/home/schedule/ScheduleRoad";
import ScheduleHalves from "@/components/home/schedule/ScheduleHalves";
import ScheduleCountdown from "@/components/home/schedule/ScheduleCountdown";
import ScheduleTraces from "@/components/home/schedule/ScheduleTraces";
import SchedulePins from "@/components/home/schedule/SchedulePins";
import ScheduleDie from "@/components/home/schedule/ScheduleDie";

// Schedule section options. Remove this route once one is picked.
const VARIANTS = { sa: ScheduleTraces, sb: SchedulePins, sc: ScheduleDie, t0: Schedule, t1: ScheduleCalendar, t2: ScheduleRoad, t3: ScheduleHalves, t4: ScheduleCountdown } as const;
const NAMES: Record<string, string> = { sa: "Roads to the chip", sb: "Pins and lid", sc: "The die", t0: "Current", t1: "Calendar", t2: "Your contest", t3: "Two halves", t4: "Countdown" };

export const metadata = { title: "Schedule options — BitFest 2027", robots: { index: false } };

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((id) => ({ id }));
}

export default async function SchedulePreview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ shot?: string }> }) {
  const { id } = await params;
  const shot = (await searchParams).shot !== undefined;
  const V = VARIANTS[id as keyof typeof VARIANTS];
  if (!V) notFound();
  return (
    <>
      <HomeNav />
      <main className="pt-10">
        <V />
        <div className="h-[50vh]" />
      </main>
      {!shot && <nav aria-label="Schedule options" className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 border border-line-2 bg-bg/95 p-1 text-sm">
        {Object.keys(VARIANTS).map((k) => (
          <a key={k} href={`/previews/schedule/${k}`} className={`px-3 py-2 font-semibold transition ${k === id ? "bg-orange text-[#120802]" : "text-muted hover:text-ink"}`}>
            {k.toUpperCase()} {NAMES[k]}
          </a>
        ))}
      </nav>}
    </>
  );
}
