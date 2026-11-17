import { Geist, Inter_Tight, Noto_Sans_Bengali, Space_Grotesk, Sora } from "next/font/google";

// Candidate faces for the cleaner BitFest type. Previews use Geist unless the fonts page shows another.
const geist = Geist({ subsets: ["latin"], variable: "--f-geist" });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--f-inter-tight" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--f-space" });
const sora = Sora({ subsets: ["latin"], variable: "--f-sora" });
// Bangla, for the small local touches in the hero variants.
const bangla = Noto_Sans_Bengali({ subsets: ["bengali"], weight: ["500"], variable: "--f-bangla" });

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${geist.variable} ${interTight.variable} ${spaceGrotesk.variable} ${sora.variable} ${bangla.variable}`}
      style={{ fontFamily: "var(--f-geist), ui-sans-serif, system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
