import { Helmet } from 'react-helmet-async';
import ScheduleGrid from '../components/ui/ScheduleGrid';

export default function SchedulePage() {
  return (
    <>
      <Helmet>
        <title>Orar Clase Fitness Galați 2026 | FightClub Galați</title>
        <meta name="description" content="Orarul săptămânal al claselor de fitness din Galați. Luni–Sâmbătă, 08:00–21:00. Mortal Kombat, Body Pump, Pilates, Tabata, Bosu și mai mult." />
        <link rel="canonical" href="https://fightclubgalati.ro/orar" />
        <meta property="og:title" content="Orar Clase Fitness | FightClub Galați" />
        <meta property="og:description" content="Program complet Luni–Sâmbătă. Clase de aerobic și fitness pentru toate nivelele." />
        <meta property="og:url" content="https://fightclubgalati.ro/orar" />
        <meta property="og:image" content="https://fightclubgalati.ro/hero-poster.jpg" />
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
