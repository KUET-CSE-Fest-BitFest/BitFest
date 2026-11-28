import Image from "next/image";
import logo from "./kuet-logo.png";

/* KUET's crest (the university's logo, as supplied), shown after the BitFest logo. */
export default function KuetLogo({ className = "h-[40px] w-auto sm:h-[50px]" }: { className?: string }) {
  return <Image src={logo} alt="Khulna University of Engineering & Technology" className={className} />;
}
