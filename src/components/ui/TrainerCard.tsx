import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook } from 'lucide-react';
import type { Trainer } from '../../types';

interface TrainerCardProps {
  trainer: Trainer;
  index: number;
}

export default function TrainerCard({ trainer, index }: TrainerCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative h-80 cursor-pointer"
      style={{ perspective: 1000 }}
      onHoverStart={() => setFlipped(true)}
      onHoverEnd={() => setFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src={trainer.avatar}
            alt={trainer.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-white font-bold text-lg">{trainer.name}</h3>
            <p className="text-gold text-sm font-medium">{trainer.specialty}</p>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-surface-2 rounded-xl p-6 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div>
            <h3 className="text-white font-bold text-lg mb-1">{trainer.name}</h3>
            <p className="text-gold text-sm font-medium mb-3">{trainer.specialty}</p>
            <p className="text-muted text-sm leading-relaxed">{trainer.bio}</p>
          </div>
          <div>
            <div className="flex flex-wrap gap-1 mb-4">
              {trainer.certifications.map((cert) => (
                <span
                  key={cert}
                  className="text-xs bg-gold/10 text-gold border border-gold/30 px-2 py-0.5 rounded-full"
                >
                  {cert}
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              {trainer.socials.instagram && (
                <a
                  href={trainer.socials.instagram}
                  className="text-muted hover:text-gold transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {trainer.socials.facebook && (
                <a
                  href={trainer.socials.facebook}
                  className="text-muted hover:text-gold transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
