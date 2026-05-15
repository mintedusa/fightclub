import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import ScheduleGrid from '../ui/ScheduleGrid';

export default function ScheduleSection() {
  const ref = useScrollAnimation<HTMLElement>();

  return (
    <section ref={ref} className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-4">
            Orar <span className="text-gold">Clase</span>
          </h2>
          <p className="text-muted text-lg">
            Programul săptămânal al tuturor claselor noastre
          </p>
        </div>

        <ScheduleGrid />

        <div className="text-center mt-10">
          <Link
            to="/orar"
            className="inline-block border-2 border-gold text-gold font-bold px-6 py-3 rounded hover:bg-gold hover:text-dark transition-colors"
          >
            Vezi orar complet →
          </Link>
        </div>
      </div>
    </section>
  );
}
