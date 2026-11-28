import EventHero from "@/components/event/EventHero";
import { eventPages } from "@/lib/eventPages";

/* The contest hero without a live scene: the shared ground, title, lead and buttons. Used by the
   contests added from the final proposal (AI-Driven Solutions, Imagine the Future with AI, ICT
   Olympiad) until each gets its own scene. */
export function plainHero(slug: string) {
  const page = eventPages[slug];
  function PlainHero() {
    return <EventHero slug={slug} lead={page.lead} registerHref={page.registerHref} rulebookHref={page.rulebookHref} scene={null} />;
  }
  PlainHero.displayName = `PlainHero(${slug})`;
  return PlainHero;
}
