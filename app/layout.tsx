import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "BitFest 2027 — 3rd KUET CSE National Fest",
  description:
    "Ten national competitions in programming, AI, data science, research, robotics, cybersecurity, business and esports. 29–30 January 2027 at KUET, Khulna. 700K BDT in prizes.",
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
