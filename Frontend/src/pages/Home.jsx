import { Hero } from "../components/Hero";
import { Marquee } from "../components/Marquee";
import { StackingShowcase } from "../components/StackingShowcase";
import { Approach } from "../components/Approach";
import { Portfolio } from "../components/Portfolio";
import { Statement } from "../components/Statement";
import { Services } from "../components/Services";
import { Capabilities } from "../components/Capabilities";
import { CTA } from "../components/CTA";

export function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <StackingShowcase />
      <Approach />
      <Portfolio />
      <Statement />
      <Services />
      <Capabilities />
      <CTA />
    </>
  );
}
