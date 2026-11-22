import type { ReactNode } from "react";
import HomeNav from "./HomeNav";
import ContestCards from "./schedule/ContestCards";
import PastGallery from "./gallery/Gallery";
import Partners from "./Partners";
import Faq from "./Faq";
import FinalCall from "./FinalCall";
import HomeFooter from "./HomeFooter";

/** The homepage below the hero is the same in every version; only the hero changes. */
export default function HomePage({ hero }: { hero: ReactNode }) {
  return (
    <>
      <HomeNav />
      {/* The page sits above the footer, which it reveals as it scrolls away (see HomeFooter). */}
      <main className="relative z-10 bg-bg">
        {hero}
        <ContestCards />
        <PastGallery />
        <Partners />
        <Faq />
        <section className="relative py-24 md:py-32">
          <div className="mx-auto max-w-[1440px] px-6 md:px-14">
            <FinalCall />
          </div>
        </section>
      </main>
      <HomeFooter />
    </>
  );
}
