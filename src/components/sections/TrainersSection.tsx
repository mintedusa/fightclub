import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import TrainerCard from '../ui/TrainerCard';
import { trainers } from '../../data/trainers';

export default function TrainersSection() {
  const titleRef = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-12">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Echipa noastră
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Trainerii <span className="text-gold">Noștri</span>
          </h2>
          <p className="text-muted mt-4 max-w-xl mx-auto">
            Profesioniști certificați dedicați transformării tale. Treci cu
            mouse-ul peste un card pentru detalii.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trainers.map((trainer, i) => (
            <TrainerCard key={trainer.id} trainer={trainer} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
