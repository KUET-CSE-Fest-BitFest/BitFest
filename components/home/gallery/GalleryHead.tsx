import SectionHead from "../SectionHead";

/** The gallery's heading, shared by every layout. */
export default function GalleryHead() {
  return (
    <div id="gallery-h">
      <SectionHead n="03" label="BitFest 2025" title="From the last edition" sub="The teams, the contest floor and prize night at BitFest 2025, which drew 4,000 participants from 100 universities and 7,000 visitors to KUET." />
    </div>
  );
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
