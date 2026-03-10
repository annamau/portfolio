import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Growth from "@/components/Growth";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { GlobalSmoke } from "@/components/GlobalSmoke";

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
