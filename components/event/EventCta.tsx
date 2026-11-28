import { TextLink } from "@/components/ui/Button";
import type { EventPage } from "@/lib/eventPages";
import RegisterButton from "./RegisterButton";

/* A contest page's closing call, at the top of the footer lid. */
export default function EventCta({ page }: { page: EventPage }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="flex flex-col gap-5">
        <p className="text-[15px] font-medium text-muted">Ready?</p>
        <h2 className="max-w-[760px] text-[clamp(40px,5.2vw,76px)] font-semibold leading-[0.98] tracking-[-0.04em]">Bring your team to KUET</h2>
      </div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <RegisterButton href={page.registerHref} />
        <TextLink href="/#schedule">All competitions</TextLink>
      </div>
    </div>
  );
}
