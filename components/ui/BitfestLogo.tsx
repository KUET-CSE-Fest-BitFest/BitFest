import Image from "next/image";
import logo from "./bitfest-logo.png";

/* The BitFest 2027 logo exactly as supplied (the artwork embedded in the 2027 sponsorship proposal),
   used as-is: the badge, the BITFEST plate and the 2027 ribbon. */
export default function BitfestLogo() {
  return <Image src={logo} alt="BitFest 2027" priority className="h-[46px] w-auto sm:h-[58px]" />;
}
