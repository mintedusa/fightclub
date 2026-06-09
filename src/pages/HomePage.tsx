import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/sections/HeroSection';
import AppBannerSection from '../components/sections/AppBannerSection';
import ClassesSection from '../components/sections/ClassesSection';
import ScheduleSection from '../components/sections/ScheduleSection';
import TrainersSection from '../components/sections/TrainersSection';
import PricingSection from '../components/sections/PricingSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import GallerySection from '../components/sections/GallerySection';
import ContactSection from '../components/sections/ContactSection';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>FightClub Galați — Sală de Fitness & Aerobic | Strada Saturn 34</title>
        <meta name="description" content="Sală de fitness și aerobic în Galați. Clase de grup: Mortal Kombat, Body Pump, Pilates, Tabata, SuperFit. Abonamente de la 40 lei. Strada Saturn 34." />
        <link rel="canonical" href="https://fightclubgalati.ro/" />
        <meta property="og:title" content="FightClub Galați — Sală de Fitness & Aerobic" />
        <meta property="og:description" content="Sală de fitness și aerobic în Galați. Clase de grup, instructori certificați, abonamente flexibile. Înscrie-te azi!" />
        <meta property="og:url" content="https://fightclubgalati.ro/" />
        <meta property="og:image" content="https://fightclubgalati.ro/hero-poster.jpg" />
      </Helmet>

      <HeroSection />
      <AppBannerSection />
      <ClassesSection />
      <ScheduleSection />
      <TrainersSection />
      <PricingSection />
      <TestimonialsSection />
      <GallerySection />
      <ContactSection />
    </>
  );
}
