import Hero from '../components/portfolio/Hero';
import About from '../components/portfolio/About';
import Skills from '../components/portfolio/Skills';
import Experience from '../components/portfolio/Experience';
import Education from '../components/portfolio/Education';
import Projects from '../components/portfolio/Projects';
import Achievements from '../components/portfolio/Achievements';
import Blog from '../components/portfolio/Blog';
import Contact from '../components/portfolio/Contact';

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Education />
      <Projects />
      <Achievements />
      <Blog />
      <Contact />
    </>
  );
}
