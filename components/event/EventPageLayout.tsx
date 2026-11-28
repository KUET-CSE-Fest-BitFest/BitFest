import type { ReactNode } from "react";
import EventSidebar from "@/components/event/EventSidebar";
import HomeFooter from "@/components/redesign/HomeFooter";
import EventAbout from "@/components/event/EventAbout";
import EventPrizes from "@/components/event/EventPrizes";
import EventFaq from "@/components/event/EventFaq";
import EventCta from "@/components/event/EventCta";
import { registerCta, type EventPage } from "@/lib/eventPages";
import { SHOW_PRIZES } from "@/lib/fest";

/* Every contest page, in the landing page's slate blue and green (.rd-theme): the side panel with every
   contest and the home page's links (no top nav), the contest's own hero, About with the timeline, prize money (while SHOW_PRIZES), questions and the closing call, then the
   footer revealed underneath. */
export default function EventPageLayout({ page, name, hero }: { page: EventPage; name: string; hero: ReactNode }) {
  return (
    <div className="rd-theme contents">
      <EventSidebar slug={page.slug} register={{ href: registerCta(page.registerHref).href, label: registerCta(page.registerHref).label }} />
      {/* Wide screens: the page sits to the right of the side panel. */}
      <div className="lg:pl-[304px]">
      <main className="rd-main relative z-10 bg-bg">
        {/* The hero; contest links on the home page open these pages. */}
        <div id="hero">{hero}</div>
        <EventAbout page={page} />
        {/* Prize money is hidden for now (SHOW_PRIZES in lib/fest). */}
        {SHOW_PRIZES && <EventPrizes page={page} />}
        <EventFaq name={name} faqs={page.faqs} />
        <section className="relative pb-24 pt-4 md:pb-32">
          <div className="mx-auto max-w-[1440px] px-6 md:px-14">
            <EventCta page={page} />
          </div>
        </section>
      </main>
      <HomeFooter />
      </div>
    </div>
  );
}
