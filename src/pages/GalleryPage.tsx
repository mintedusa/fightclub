import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const BASE = import.meta.env.BASE_URL;

const videos = [
  { id: 1, src: `${BASE}gallery/gallery-1.mp4`, title: 'Antrenament FightClub' },
  { id: 2, src: `${BASE}gallery/gallery-2.mp4`, title: 'Clase de Grup' },
  { id: 3, src: `${BASE}gallery/gallery-3.mp4`, title: 'Antrenament Intensiv' },
  { id: 4, src: `${BASE}gallery/gallery-4.mp4`, title: 'Sesiune de Fitness' },
  { id: 5, src: `${BASE}gallery/gallery-5.mp4`, title: 'Sala Nouă de Aerobic' },
  { id: 6, src: `${BASE}gallery/gallery-6.mp4`, title: 'Sala de Forță' },
];

function VideoCard({ video, onClick }: { video: typeof videos[0]; onClick: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative rounded-xl overflow-hidden bg-surface cursor-pointer group aspect-[9/16]"
      onClick={onClick}
      onMouseEnter={() => ref.current?.play()}
      onMouseLeave={() => { if (ref.current) { ref.current.pause(); ref.current.currentTime = 0; } }}
    >
      <video
        ref={ref}
        src={video.src}
        muted
        playsInline
        loop
        preload="metadata"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center">
          <Play className="w-6 h-6 text-dark fill-dark ml-0.5" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-sm font-semibold">{video.title}</p>
      </div>
    </motion.div>
  );
}

function Lightbox({ video, onClose }: { video: typeof videos[0]; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

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

export default function GalleryPage() {
  const [active, setActive] = useState<typeof videos[0] | null>(null);

  return (
    <>
      <Helmet>
        <title>Galerie Video — FightClub Galați</title>
        <meta name="description" content="Urmărește videoclipuri din sala FightClub Galați — clase de grup, aerobic, sala de forță și antrenamente cu instructori dedicați." />
      </Helmet>

      <main className="min-h-screen bg-dark pt-40 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-12">
            <span className="text-gold text-sm font-bold uppercase tracking-widest">FightClub Galați</span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mt-2">
              Galerie <span className="text-gold">Video</span>
            </h1>
            <p className="text-muted text-sm mt-3">Click pe un video pentru a-l viziona</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} onClick={() => setActive(v)} />
            ))}
          </div>

        </div>
      </main>

      {active && <Lightbox video={active} onClose={() => setActive(null)} />}
    </>
  );
}
