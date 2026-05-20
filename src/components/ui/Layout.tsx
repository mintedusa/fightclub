import { Outlet, useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Navbar from './Navbar';
import Footer from './Footer';

type LenisInstance = InstanceType<typeof Lenis>;

export default function Layout() {
  const location = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const lenis = (window as Window & { __lenis?: LenisInstance }).__lenis;
    lenis?.scrollTo(0, { immediate: true });
    const id = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => clearTimeout(id);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
