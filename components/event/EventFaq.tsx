import SectionHead from "@/components/ui/SectionHead";
import FaqBrowser from "@/components/ui/FaqBrowser";
import { contestFaqs, GENERAL } from "@/lib/faqs";
import { fest, SHOW_PRIZES } from "@/lib/fest";

/* 03 · Questions: the landing page's centred, searchable list, opening on this contest's own
   questions with the general ones a chip away. */
export default function EventFaq({ name, faqs }: { name: string; faqs: { q: string; a: string }[] }) {
  return (
    <section id="faq" className="relative scroll-mt-20 py-20 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-14">
        <div className="mx-auto flex max-w-[880px] flex-col gap-12 md:gap-14">
          <SectionHead n={SHOW_PRIZES ? "03" : "02"} eyebrow="Questions" align="center" title="Asked before you register" sub={`Anything else? Write to ${fest.email}.`} />
          <FaqBrowser items={contestFaqs(name, faqs)} topics={[name, GENERAL]} all={false} />
        </div>
      </div>
    </section>
  );
}
