import { Helmet } from 'react-helmet-async';
import TrainerCard from '../components/ui/TrainerCard';
import { trainers } from '../data/trainers';

export default function TrainersPage() {
  return (
    <>
      <Helmet>
        <title>Traineri Fitness Certificați Galați | FightClub Galați</title>
        <meta name="description" content="Cunoaște echipa de instructori certificați FightClub Galați. Experți în fitness, aerobic și antrenament personal dedicați rezultatelor tale." />
        <link rel="canonical" href="https://fightclubgalati.ro/traineri" />
        <meta property="og:title" content="Traineri Fitness Certificați | FightClub Galați" />
        <meta property="og:description" content="Instructori dedicați, certificați, cu experiență în fitness și aerobic. Vino să ne cunoști!" />
        <meta property="og:url" content="https://fightclubgalati.ro/traineri" />
        <meta property="og:image" content="https://fightclubgalati.ro/hero-poster.jpg" />
      </Helmet>

      <div className="pt-32 pb-12 bg-surface text-center">
        <span className="text-gold text-sm font-bold uppercase tracking-widest">
          Echipa noastră
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white mt-2">
          Trainerii <span className="text-gold">Noștri</span>
        </h1>
        <p className="text-muted mt-4 max-w-lg mx-auto text-sm">
          Profesioniști certificați dedicați transformării tale. Treci cu
          mouse-ul pentru detalii.
        </p>
      </div>

      <div className="bg-dark py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((trainer, i) => (
              <TrainerCard key={trainer.id} trainer={trainer} index={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
