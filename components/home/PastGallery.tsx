import { pastPhotos } from "@/lib/pastPhotos";
import SectionHead from "./SectionHead";

/* 03 · BitFest 2025 in pictures. Two rows of photographs in the site's lit frames drift in opposite
   directions, pause under the pointer and fade out at both edges. Plain CSS (transform only), each
   picture a small pre-sized WebP that loads lazily. Under reduced motion the rows sit still and
   scroll sideways by hand. */

function Row({ photos, reverse }: { photos: typeof pastPhotos; reverse?: boolean }) {
  // Two copies of the row, so the drift loops without a seam.
  return (
    <div className="gallery-row relative overflow-hidden">
      <div className={`gallery-track flex w-max gap-3 md:gap-4 ${reverse ? "is-reverse" : ""}`} style={{ ["--gallery-dur" as string]: `${photos.length * 7}s` }}>
        {[0, 1].map((copy) =>
          photos.map((p, i) => (
            <figure key={`${copy}-${p.src}`} aria-hidden={copy === 1} className="gallery-frame relative h-[180px] shrink-0 overflow-hidden rounded-[14px] md:h-[250px] md:rounded-[18px]" style={{ aspectRatio: `${p.w} / ${p.h}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                srcSet={`${p.small} ${p.smallW}w, ${p.src} ${p.w}w`}
                sizes="(max-width: 767px) 240px, 340px"
                width={p.w}
                height={p.h}
                alt={copy === 1 ? "" : p.alt}
                loading={i < 3 && copy === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover"
              />
            </figure>
          )),
        )}
      </div>
    </div>
  );
}

export default function PastGallery() {
  const half = Math.ceil(pastPhotos.length / 2);
  return (
    <section id="gallery" aria-labelledby="gallery-h" className="relative scroll-mt-20 overflow-hidden py-28 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-14">
        <div id="gallery-h">
          <SectionHead n="03" label="BitFest 2025" title="From the last edition" sub="Prize night at BitFest 2025, which drew 4,000 participants from 100 universities and 7,000 visitors to KUET." />
        </div>
      </div>
      <div className="mt-14 flex flex-col gap-3 md:gap-4">
        <Row photos={pastPhotos.slice(0, half)} />
        <Row photos={pastPhotos.slice(half)} reverse />
      </div>
    </section>
  );
}
