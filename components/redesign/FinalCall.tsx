import { fest } from "@/lib/fest";
import { Button, TextLink } from "@/components/redesign/ui/Button";
import SectionHead from "./SectionHead";

/* 06 · The closing call. It sits at the top of the footer lid (see HomeFooter), above the wordmark. */

export default function FinalCall() {
  return (
    <div id="register" className="grid scroll-mt-28 gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <SectionHead
        n="05"
        label="Register"
        title="Choose your contest and register"
        sub="Registration opens on 30 November 2026 and closes on 12 January 2027. Fees are per team, and the AI Hackathon preliminary is free to enter."
      />
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <Button href="#schedule">Choose your contest</Button>
        <TextLink href={fest.facebook} external>Follow on Facebook</TextLink>
      </div>
    </div>
  );
}
