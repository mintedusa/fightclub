import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Lenis from '@studio-freight/lenis';
import './index.css';
import App from './App.tsx';
import { initTheme } from './store/useThemeStore.ts';

initTheme();

const lenis = new Lenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

// Driven by a plain rAF loop rather than gsap.ticker, so GSAP stays out of
// the initial bundle — only the hero's parallax needs it, and that loads
// with the homepage chunk.
function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

(window as Window & { __lenis?: typeof lenis }).__lenis = lenis;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
