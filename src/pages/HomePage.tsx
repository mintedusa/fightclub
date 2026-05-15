// src/pages/HomePage.tsx
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import ClassesSection from '../components/sections/ClassesSection';
import TrainersSection from '../components/sections/TrainersSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ClassesSection />
      <TrainersSection />
    </>
  );
}
