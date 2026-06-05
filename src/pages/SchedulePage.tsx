import { Helmet } from 'react-helmet-async';
import ScheduleGrid from '../components/ui/ScheduleGrid';

export default function SchedulePage() {
  return (
    <>
      <Helmet>
        <title>Orar Clase — FightClub Galați</title>
        <meta
          name="description"
          content="Programul complet al claselor de fitness din Galați. Mortal Kombat, Bosu, SuperFit, Pilates, Tabata, Body Pump și mai mult."
        />
      </Helmet>

      <div className="pt-32 pb-12 bg-surface text-center">
        <span className="text-gold text-sm font-bold uppercase tracking-widest">
          Program
        </span>
        <h1 className="text-5xl font-black text-white mt-2 mb-4">
          Orar <span className="text-gold">Săptămânal</span>
        </h1>
        <p className="text-muted text-lg">
          Toate clasele noastre, organizate pe zile și ore
        </p>
      </div>

      <div className="py-16 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScheduleGrid />
        </div>
      </div>
    </>
  );
}
