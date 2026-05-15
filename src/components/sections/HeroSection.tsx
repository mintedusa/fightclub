// src/components/sections/HeroSection.tsx
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import TextPlugin from 'gsap/TextPlugin';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

// Tell TypeScript about GSAP TextPlugin's 'text' tween property
declare module 'gsap' {
  interface TweenVars {
    text?: string | { value: string };
  }
}

gsap.registerPlugin(TextPlugin, ScrollTrigger);

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80';

export default function HeroSection() {
  const { scrollTo } = useSmoothScroll();
  const bgRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroVideoUrl = import.meta.env.VITE_HERO_VIDEO_URL as string | undefined;
    void heroVideoUrl;

    const tl = gsap.timeline({ delay: 0.5 });
    tl.to(line1Ref.current, { duration: 1.2, text: 'Forjează-ți', ease: 'none' })
      .to(line2Ref.current, { duration: 1, text: 'Limitele', ease: 'none', delay: 0.2 })
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.2',
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.3',
      );

    gsap.to(bgRef.current, {
      y: -150,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const heroVideoUrl = import.meta.env.VITE_HERO_VIDEO_URL as string | undefined;

  return (
    <section
      id="hero"
      className="relative h-screen min-h-[600px] flex items-center overflow-hidden"
    >
      <div ref={bgRef} className="absolute inset-0 scale-110">
        {heroVideoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster={FALLBACK_IMG}
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <img
            src={FALLBACK_IMG}
            alt="FightClub Galați"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-5xl sm:text-7xl font-black leading-tight mb-4">
          <span ref={line1Ref} className="block text-white min-h-[1.2em]" />
          <span ref={line2Ref} className="block text-gold min-h-[1.2em]" />
        </h1>

        <p
          ref={subtitleRef}
          className="text-white/80 text-lg sm:text-xl mb-8 max-w-xl opacity-0"
        >
          Sala de fitness #1 din Galați — Box, CrossFit, Yoga, MMA și mai mult.
          Alătură-te celor 500+ membri care și-au transformat viața.
        </p>

        <div ref={ctaRef} className="flex flex-wrap gap-4 opacity-0">
          <motion.button
            onClick={() => scrollTo('#clase')}
            className="bg-gold text-dark font-bold px-8 py-3 rounded text-base hover:bg-gold-dark transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Începe Acum
          </motion.button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/clase"
              className="inline-block border-2 border-white text-white font-bold px-8 py-3 rounded text-base hover:border-gold hover:text-gold transition-colors"
            >
              Vezi Clase
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <ChevronDown className="text-gold w-8 h-8" />
      </motion.div>
    </section>
  );
}
