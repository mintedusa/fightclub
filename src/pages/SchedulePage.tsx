import { Helmet } from 'react-helmet-async';
import ScheduleGrid from '../components/ui/ScheduleGrid';

export default function SchedulePage() {
  return (
    <>
      <Helmet>
        <title>Orar Clase — FightClub Galați</title>
        <meta
          name="description"
          content="Programul complet al claselor de fitness din Galați. Box Thai, CrossFit, Yoga, Spinning, MMA, Kickbox."
        />
      </Helmet>

      <div className="pt-24 pb-20 bg-dark min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-white mb-4">
              Orar <span className="text-gold">Săptămânal</span>
            </h1>
            <p className="text-muted text-lg">
              Toate clasele noastre, organizate pe zile și ore
            </p>
          </div>

          <ScheduleGrid />
        </div>
      </div>
    </>
  );
}
