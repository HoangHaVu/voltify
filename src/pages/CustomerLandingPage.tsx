import SEO from '../components/seo/SEO';
import Header from '../sections/Header';
import Hero from '../sections/Hero';
import Partners from '../sections/Partners';
import ExcellentServices from '../sections/ExcellentServices';
import OurServices from '../sections/OurServices';
import USP from '../sections/USP';
import FurtherServices from '../sections/FurtherServices';
import Team from '../sections/Team';
import ExploreSection from '../sections/ExploreSection';
import Marquee from '../sections/Marquee';
import About from '../sections/About';
import PartnersGrid from '../sections/PartnersGrid';
import News from '../sections/News';
import FAQ from '../sections/FAQ';
import Footer from '../sections/Footer';

export default function Home() {
  return (
    <>
      <SEO
        title="Solar-Konfigurator"
        description="Berechnen Sie die Wirtschaftlichkeit Ihrer Photovoltaik-Anlage in wenigen Minuten. Inkl. Foerderungen, ROI-Analyse und persoenlichem Angebot."
        canonical="/demo"
        og={{ type: 'website' }}
      />
      <main className="min-h-screen">
        <Header />
        <Hero />
        <Partners />
        <ExcellentServices />
        <OurServices />
        <USP />
        <FurtherServices />
        <Marquee />
        <ExploreSection />
        <About />
        <Team />
        <PartnersGrid />
        <News />
        <FAQ />
        <Footer />
      </main>
    </>
  );
}
