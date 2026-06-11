import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const BASE = import.meta.env.BASE_URL;

const videos = [
  { id: 1, src: `${BASE}gallery/gallery-1.mp4`, poster: `${BASE}gallery/gallery-1-poster.jpg`, title: 'Antrenament FightClub' },
  { id: 2, src: `${BASE}gallery/gallery-2.mp4`, poster: `${BASE}gallery/gallery-2-poster.jpg`, title: 'Clase de Grup' },
  { id: 3, src: `${BASE}gallery/gallery-3.mp4`, poster: `${BASE}gallery/gallery-3-poster.jpg`, title: 'Antrenament Intensiv' },
  { id: 4, src: `${BASE}gallery/gallery-4.mp4`, poster: `${BASE}gallery/gallery-4-poster.jpg`, title: 'Sesiune de Fitness' },
  { id: 5, src: `${BASE}gallery/gallery-5.mp4`, poster: `${BASE}gallery/gallery-5-poster.jpg`, title: 'Sala Nouă de Aerobic' },
  { id: 6, src: `${BASE}gallery/gallery-6.mp4`, poster: `${BASE}gallery/gallery-6-poster.jpg`, title: 'Sala de Forță' },
  { id: 7, src: `${BASE}gallery/gallery-7.mp4`, poster: `${BASE}gallery/gallery-7-poster.jpg`, title: 'Antrenament' },
];

function VideoTile({
  video,
  onClick,
}: {
  video: (typeof videos)[0];
  onClick: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl break-inside-avoid group cursor-pointer mb-4"
      onClick={onClick}
      onMouseEnter={() => ref.current?.play()}
      onMouseLeave={() => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      }}
    >
      <video
        ref={ref}
        src={video.src}
        poster={video.poster}
        muted
        playsInline
        loop
        preload="none"
        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center">
          <Play className="w-5 h-5 text-dark fill-dark ml-0.5" />
        </div>
      </div>
    </motion.div>
  );
}

function Lightbox({
  video,
  onClose,
}: {
  video: (typeof videos)[0];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="relative max-h-[90vh] max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <video
            src={video.src}
            autoPlay
            controls
            playsInline
            className="w-full rounded-xl"
            style={{ maxHeight: '85vh' }}
          />
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gold flex items-center justify-center"
          >
            <X className="w-4 h-4 text-dark" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function GallerySection() {
  const titleRef = useScrollAnimation<HTMLDivElement>();
  const [active, setActive] = useState<(typeof videos)[0] | null>(null);

  return (
    <section className="py-20 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-12">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Atmosferă
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Galerie <span className="text-gold">Video</span>
          </h2>
          <p className="text-muted text-sm mt-3">Hover pentru preview · Click pentru a viziona</p>
        </div>

        <div className="columns-2 lg:columns-3 gap-4">
          {videos.map((v) => (
            <VideoTile key={v.id} video={v} onClick={() => setActive(v)} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/galerie"
            className="inline-block border border-gold/50 text-gold text-sm font-semibold px-6 py-2.5 rounded hover:bg-gold/10 transition-colors"
          >
            Vezi galeria completă →
          </Link>
        </div>
      </div>

      {active && <Lightbox video={active} onClose={() => setActive(null)} />}
    </section>
  );
}
