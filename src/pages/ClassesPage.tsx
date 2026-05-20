import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import ClassCard from '../components/ui/ClassCard';
import { classes } from '../data/classes';
import type { GymClass } from '../types';

type Filter = 'All' | GymClass['level'];

const filters: Filter[] = [
  'All',
  'Începător',
  'Intermediar',
  'Avansat',
  'Toate nivelele',
];

export default function ClassesPage() {
  const [active, setActive] = useState<Filter>('All');

  const filtered = classes.filter(
    (c) =>
      active === 'All' ||
      c.level === active ||
      (active !== 'Toate nivelele' && c.level === 'Toate nivelele'),
  );

  return (
    <>
      <Helmet>
        <title>Clase & Programe — FightClub Galați</title>
        <meta
          name="description"
          content="Descoperă toate clasele noastre de fitness din Galați. Box Thai, Power Step, Yoga, Spinning, MMA, Kickbox."
        />
      </Helmet>

      <div className="pt-32 pb-12 bg-surface text-center">
        <span className="text-gold text-sm font-bold uppercase tracking-widest">
          Programele noastre
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white mt-2">
          Clase & <span className="text-gold">Programe</span>
        </h1>
        <p className="text-muted mt-4 max-w-lg mx-auto text-sm">
          30+ clase săptămânale pentru orice nivel și obiectiv.
        </p>
      </div>

      <div className="bg-surface pb-8 flex flex-wrap justify-center gap-3 px-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${
              active === f
                ? 'bg-gold text-dark border-gold'
                : 'border-white/20 text-muted hover:border-gold hover:text-gold'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((cls, i) => (
                <motion.div
                  key={cls.id}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <ClassCard gymClass={cls} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
}
