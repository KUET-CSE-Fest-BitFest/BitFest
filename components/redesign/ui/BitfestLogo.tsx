import Image from "next/image";
import logo from "./bitfest-logo-green.webp";

/* The BitFest 2027 logo (the supplied artwork) recoloured to the redesign: the orange is the theme
   green, the white disc behind the circuit is see-through, and the lettering is light ink. */
export default function BitfestLogo({ className = "h-[40px] w-auto sm:h-[48px]" }: { className?: string }) {
  return <Image src={logo} alt="BitFest 2027" priority className={className} />;
}
