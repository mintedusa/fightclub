import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, BarChart2, RotateCcw } from 'lucide-react';
import type { GymClass } from '../../types';

const levelColors: Record<GymClass['level'], string> = {
  Începător:        'bg-green-600 text-white',
  Intermediar:      'bg-yellow-500 text-white',
  Avansat:          'bg-red-600 text-white',
  'Toate nivelele': 'bg-blue-600 text-white',
};

const levelBorder: Record<GymClass['level'], string> = {
  Începător:        'border-green-600/60',
  Intermediar:      'border-yellow-500/60',
  Avansat:          'border-red-600/60',
  'Toate nivelele': 'border-blue-600/60',
};

interface ClassCardProps {
  gymClass: GymClass;
  index: number;
}

export default function ClassCard({ gymClass, index }: ClassCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative h-[340px] cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={() => setFlipped((v) => !v)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden bg-surface-2"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="relative h-[55%] overflow-hidden">
            <img
              src={gymClass.image}
              alt={gymClass.title}
              className="w-full h-full object-cover"
            />
            <span
              className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${levelColors[gymClass.level]}`}
            >
              {gymClass.level}
            </span>
          </div>

          <div className="p-4 h-[45%] flex flex-col justify-between">
            <div>
              <h3 className="text-white font-bold text-base leading-tight mb-1">
                {gymClass.title}
              </h3>
              <p className="text-muted text-xs line-clamp-2">{gymClass.description}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-muted text-xs">
                <span className="flex items-center gap-1">
                  <BarChart2 className="w-3 h-3" />
                  {gymClass.category}
                </span>
              </div>
              <span className="text-gold/60 text-[10px] flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> detalii
              </span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 rounded-xl p-5 flex flex-col justify-between bg-surface-2 border-2 ${levelBorder[gymClass.level]}`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-white font-bold text-lg leading-tight">{gymClass.title}</h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ml-2 ${levelColors[gymClass.level]}`}>
                {gymClass.level}
              </span>
            </div>
            <p className="text-muted text-sm leading-relaxed">{gymClass.description}</p>
          </div>

          <div className="space-y-2 mt-3">
            <div className="flex items-center gap-2 text-muted text-xs">
              <Clock className="w-3.5 h-3.5 text-gold/70 shrink-0" />
              <span>{gymClass.schedule}</span>
            </div>
            <div className="flex items-center gap-2 text-muted text-xs">
              <BarChart2 className="w-3.5 h-3.5 text-gold/70 shrink-0" />
              <span>{gymClass.category}</span>
            </div>
            <p className="text-gold/50 text-[10px] text-right pt-1 flex items-center justify-end gap-1">
              <RotateCcw className="w-3 h-3" /> click pentru înapoi
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
