import type { HTMLAttributes, ReactNode } from "react";
import { CONTEST_PAGES_LIVE, eventHref, isExternal, type FestEvent } from "@/lib/fest";

/** A contest's name as a link to its page. While the pages are not public (CONTEST_PAGES_LIVE is
    false) it renders the same element with the same classes and hover, but goes nowhere. */
export default function ContestLink({ e, className, children, ...rest }: { e: FestEvent; className?: string; children: ReactNode } & HTMLAttributes<HTMLElement>) {
  if (!CONTEST_PAGES_LIVE) {
    return <span className={className} {...rest}>{children}</span>;
  }
  return (
    <a href={eventHref(e)} {...(isExternal(e) ? { target: "_blank", rel: "noreferrer" } : {})} className={className} {...rest}>
      {children}
    </a>
  );
}
