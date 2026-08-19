import { Outlet, useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';

type LenisInstance = InstanceType<typeof Lenis>;

export default function Layout() {
  const location = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const lenis = (window as Window & { __lenis?: LenisInstance }).__lenis;
    lenis?.scrollTo(0, { immediate: true });
    // Imported lazily: only the hero parallax registers a ScrollTrigger, so
    // pulling GSAP in eagerly here would put it on the critical path.
    const id = setTimeout(() => {
      import('gsap/ScrollTrigger').then(({ default: ScrollTrigger }) => {
        ScrollTrigger.refresh();
      });
    }, 100);
    return () => clearTimeout(id);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <BottomNav />
    </>
  );
}
