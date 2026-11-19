import GalleryHead from "./GalleryHead";
import TeamsSlider from "./TeamsSlider";
import PrizeStrip from "./PrizeStrip";

/* 03 · BitFest 2025 gallery. The teams lead, in a slider (group photos at the fest wall and teams on
   the contest floor); prize night follows as an endless strip of two drifting rows. */
export default function Gallery() {
  return (
    <section id="gallery" aria-labelledby="gallery-h" className="relative scroll-mt-20 py-20 md:py-36">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 md:px-14">
        <GalleryHead />
      </div>
      {/* The slider runs the full width of the page so the neighbours fade out at its edges. */}
      <div className="mx-auto mt-12 max-w-[1680px] md:mt-16">
        <TeamsSlider />
      </div>
      <div className="mx-auto mt-20 max-w-[1440px] px-6 md:mt-28 md:px-14">
        <p className="flex items-center gap-3 text-[15px] font-medium text-muted">
          <span aria-hidden className="h-px w-8 bg-line-2" />
          Prize night
        </p>
      </div>
      <div className="mt-8">
        <PrizeStrip />
      </div>
    </section>
  );
}
