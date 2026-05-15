import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import './index.css';
import App from './App.tsx';
import { initTheme } from './store/useThemeStore.ts';

gsap.registerPlugin(ScrollTrigger);
initTheme();

const lenis = new Lenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

(window as Window & { __lenis?: typeof lenis }).__lenis = lenis;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
