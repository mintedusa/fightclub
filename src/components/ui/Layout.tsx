import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Navbar from './Navbar';
import Footer from './Footer';

type LenisInstance = InstanceType<typeof Lenis>;

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    const lenis = (window as Window & { __lenis?: LenisInstance }).__lenis;
    lenis?.scrollTo(0, { immediate: true });
    // Recalculează pozițiile ScrollTrigger după ce noul DOM e randat
    const id = setTimeout(() => ScrollTrigger.refresh(), 350);
    return () => clearTimeout(id);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <AnimatePresence mode="sync">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <Footer />
    </>
  );
}
