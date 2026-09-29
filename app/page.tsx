import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Range } from "@/components/sections/Range";
import { Featured } from "@/components/sections/Featured";
import { Sourcing } from "@/components/sections/Sourcing";
import { About } from "@/components/sections/About";
import { Quote } from "@/components/sections/Quote";
import { SiteFooter } from "@/components/SiteFooter";

/*
 * The earlier WebGL container stack, manifest table and product rack are
 * still in components/ but out of the page while the layout settles.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Services />
        <Range />
        <Featured />
        <Sourcing />
        <About />
        <Quote />
      </main>
      <SiteFooter />
    </>
  );
}
