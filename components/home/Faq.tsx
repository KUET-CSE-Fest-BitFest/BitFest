import SectionHead from "@/components/ui/SectionHead";
import FaqBrowser from "@/components/ui/FaqBrowser";
import { allFaqs, allTopics, GENERAL } from "@/lib/faqs";
import { fest } from "@/lib/fest";

/* 05 · Questions: a centred heading over one centred column holding every question on the site,
   searchable and sorted into topics (general, then one per contest). It opens on General. */
export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-h" className="relative scroll-mt-20 py-20 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-14">
        <div className="mx-auto flex max-w-[880px] flex-col gap-12 md:gap-14">
          <div id="faq-h">
            <SectionHead n="05" eyebrow="Questions" align="center" title="Before you register" sub={`${allFaqs.length} answers about BitFest and each contest. Can't find yours? Write to ${fest.email}.`} />
          </div>
          <FaqBrowser items={allFaqs} topics={allTopics} initial={GENERAL} />
        </div>
      </div>
    </section>
  );
}
