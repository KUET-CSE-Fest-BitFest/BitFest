import GalleryHead from "./GalleryHead";
import TeamsSlider from "./TeamsSlider";

/* 03 · BitFest 2025 gallery. The teams lead, in a slider (group photos at the fest wall and teams on
   the contest floor); prize night runs as a strip along the foot of the hero. */
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
    </section>
  );
}
