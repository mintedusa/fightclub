import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import StarRating from '../ui/StarRating';
import { testimonials } from '../../data/testimonials';

export default function TestimonialsSection() {
  const titleRef = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-12">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Ce spun membrii
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Testimoniale
          </h2>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          loop
          pagination={{ clickable: true }}
          spaceBetween={24}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-12"
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.id}>
              <div className="bg-surface-2 rounded-xl p-6 h-full flex flex-col gap-4">
                <StarRating rating={t.rating} />
                <p className="text-muted text-sm leading-relaxed flex-1">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-muted text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
