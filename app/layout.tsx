import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

const title = "BitFest 2027 — 3rd KUET CSE National Fest";
const description =
  "Ten national competitions in programming, AI, data science, research, robotics, cybersecurity, business and esports. 29–30 January 2027 at KUET, Khulna. 700K BDT in prizes.";

// Social previews need absolute image URLs. On Vercel this is the production domain (a custom domain
// once one is added); NEXT_PUBLIC_SITE_URL overrides it for any other host.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://bitfest2027.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    type: "website",
    siteName: "BitFest 2027",
    title,
    description,
    url: "/",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630, alt: "BitFest 2027, the 3rd KUET CSE National Fest: ten national contests on 29–30 January 2027 at KUET, Khulna." }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og/home.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#070607",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="grain min-h-screen bg-bg text-ink">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
