import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
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
        <title>FightClub Galați — Sala de Fitness #1 din Galați</title>
        <meta
          name="description"
          content="Antrenează-te la FightClub Galați. Box, CrossFit, Yoga, MMA și mai mult. 500+ membri, 12 traineri certificați. Strada Saturn 34, Galați."
        />
      </Helmet>

      <HeroSection />
      <StatsSection />
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
