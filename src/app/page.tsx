import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";

const GlobalSmoke = dynamic(() => import("@/components/GlobalSmoke").then(m => m.GlobalSmoke));
const Projects = dynamic(() => import("@/components/Projects"));
const Growth = dynamic(() => import("@/components/Growth"));
const About = dynamic(() => import("@/components/About"));
const Experience = dynamic(() => import("@/components/Experience"));
const Contact = dynamic(() => import("@/components/Contact"));
const Footer = dynamic(() => import("@/components/Footer"));

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
