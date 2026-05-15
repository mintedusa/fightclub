import { Helmet } from 'react-helmet-async';
import TrainerCard from '../components/ui/TrainerCard';
import { trainers } from '../data/trainers';

export default function TrainersPage() {
  return (
    <>
      <Helmet>
        <title>Trainerii Noștri — FightClub Galați</title>
        <meta
          name="description"
          content="Echipa de traineri certificați FightClub Galați. Alexandru Ionescu, Maria Constantin, Bogdan Radu, Elena Popa."
        />
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
