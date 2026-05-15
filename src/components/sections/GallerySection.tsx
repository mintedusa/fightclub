import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { galleryImages } from '../../data/gallery';

export default function GallerySection() {
  const titleRef = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="py-20 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-12">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Atmosferă
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Galerie <span className="text-gold">Foto</span>
          </h2>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {galleryImages.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.03 }}
              className="relative overflow-hidden rounded-xl break-inside-avoid group"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
