import { motion } from 'framer-motion';
import { Clock, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { GymClass } from '../../types';

const levelColors: Record<GymClass['level'], string> = {
  Începător:      'bg-green-600 text-white',
  Intermediar:    'bg-yellow-500 text-white',
  Avansat:        'bg-red-600 text-white',
  'Toate nivelele': 'bg-blue-600 text-white',
};

interface ClassCardProps {
  gymClass: GymClass;
  index: number;
}

export default function ClassCard({ gymClass, index }: ClassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="bg-surface-2 rounded-xl overflow-hidden group"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={gymClass.image}
          alt={gymClass.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${
            levelColors[gymClass.level]
          }`}
        >
          {gymClass.level}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-white font-bold text-lg mb-2">{gymClass.title}</h3>
        <p className="text-muted text-sm mb-4 line-clamp-2">{gymClass.description}</p>

        <div className="flex items-center gap-4 text-muted text-xs mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {gymClass.schedule}
          </span>
          <span className="flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5" />
            {gymClass.category}
          </span>
        </div>

        <Link
          to="/clase"
          className="inline-block text-gold text-sm font-semibold border border-gold/40 hover:border-gold hover:bg-gold/10 px-4 py-1.5 rounded transition-colors"
        >
          Detalii
        </Link>
      </div>
    </motion.div>
  );
}
