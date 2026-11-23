import type { ReactNode } from "react";
import HomeNav from "@/components/redesign/HomeNav";
import HomeFooter from "@/components/redesign/HomeFooter";
import EventAbout from "@/components/event/EventAbout";
import EventPrizes from "@/components/event/EventPrizes";
import EventFaq from "@/components/event/EventFaq";
import EventCta from "@/components/event/EventCta";
import { registerCta, type EventPage } from "@/lib/eventPages";

/* Every contest page, in the landing page's slate blue and green (.rd-theme): the landing nav, the
   contest's own hero, About with the timeline, prize money, questions and the closing call, then the
   footer revealed underneath. */
export default function EventPageLayout({ page, name, hero }: { page: EventPage; name: string; hero: ReactNode }) {
  return (
    <div className="rd-theme contents">
      <HomeNav
        sub={name}
        cta={{ href: registerCta(page.registerHref).href, label: "Register" }}
        links={[
          { href: "#about", label: "About" },
          { href: "#timeline", label: "Timeline" },
          { href: "#prizes", label: "Prizes" },
          { href: "#faq", label: "FAQ" },
        ]}
      />
      <main className="rd-main relative z-10 bg-bg">
        {/* The hero; contest links on the home page open these pages. */}
        <div id="hero">{hero}</div>
        <EventAbout page={page} />
        <EventPrizes page={page} />
        <EventFaq name={name} faqs={page.faqs} />
        <section className="relative pb-24 pt-4 md:pb-32">
          <div className="mx-auto max-w-[1440px] px-6 md:px-14">
            <EventCta page={page} />
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}
