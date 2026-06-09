import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import ClassCard from '../ui/ClassCard';
import { classes } from '../../data/classes';

const INITIAL = 4;
const initial = classes.slice(0, INITIAL);
const rest = classes.slice(INITIAL);

export default function ClassesSection() {
  const titleRef = useScrollAnimation<HTMLDivElement>();
  const [showAll, setShowAll] = useState(false);

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
            Alege din clasele săptămânale conduse de instructori dedicați,
            potrivite pentru orice nivel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {initial.map((cls, i) => (
            <ClassCard key={cls.id} gymClass={cls} index={i} />
          ))}

          <AnimatePresence>
            {showAll && rest.map((cls, i) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
              >
                <ClassCard gymClass={cls} index={INITIAL + i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="text-center mt-10 flex flex-wrap justify-center gap-4">
          {!showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="bg-gold text-dark font-bold px-8 py-3 rounded hover:bg-gold-dark transition-colors"
            >
              Mai multe clase
            </button>
          )}
          <Link
            to="/clase"
            className={`inline-block font-bold px-8 py-3 rounded transition-colors ${
              showAll
                ? 'bg-gold text-dark hover:bg-gold-dark'
                : 'border-2 border-gold text-gold hover:bg-gold hover:text-dark'
            }`}
          >
            Vezi toate clasele
          </Link>
        </div>
      </div>
    </section>
  );
}
