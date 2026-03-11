import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import {
  GlobalSmoke,
  Projects,
  Growth,
  About,
  Experience,
  Contact,
  Footer,
} from "@/components/DynamicSections";

export default function Home() {
  return (
    <>
      <GlobalSmoke />
      <Nav />
      <main>
        <Hero />
        <Projects />
        <Growth />
        <About />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
