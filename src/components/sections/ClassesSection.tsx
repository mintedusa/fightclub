import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import ClassCard from '../ui/ClassCard';
import { classes } from '../../data/classes';

export default function ClassesSection() {
  const titleRef = useScrollAnimation<HTMLDivElement>();

  return (
    <section id="clase" className="py-20 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-12">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Programele noastre
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Clase & <span className="text-gold">Programe</span>
          </h2>
          <p className="text-muted mt-4 max-w-xl mx-auto">
            Alege din 30+ clase săptămânale conduse de traineri certificați,
            potrivite pentru orice nivel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, i) => (
            <ClassCard key={cls.id} gymClass={cls} index={i} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/clase"
            className="inline-block bg-gold text-dark font-bold px-8 py-3 rounded hover:bg-gold-dark transition-colors"
          >
            Vezi Toate Clasele
          </Link>
        </div>
      </div>
    </section>
  );
}
