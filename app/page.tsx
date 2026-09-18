import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Achievements from "@/components/Achievements";
import Certifications from "@/components/Certifications";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Projects />
        <About />
        <Skills />
        <Experience />
        <Education />
        <Achievements />
        <Certifications />
        <Services />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
