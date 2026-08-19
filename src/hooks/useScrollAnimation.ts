import { useLayoutEffect, useRef } from 'react';

interface ScrollAnimationOptions {
  y?: number;
  duration?: number;
}

const EASE = 'cubic-bezier(0.33, 1, 0.68, 1)';

/**
 * Fade + rise a section into view on first scroll past it.
 *
 * Uses IntersectionObserver + CSS transitions rather than a JS animation
 * library: opacity/transform transitions run on the compositor, so the
 * main thread stays free during scroll.
 */
export function useScrollAnimation<T extends HTMLElement = HTMLElement>(
  options?: ScrollAnimationOptions,
) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const y = options?.y ?? 40;
    const duration = options?.duration ?? 0.7;

    // Written before paint so the section never flashes in at full opacity.
    el.style.opacity = '0';
    el.style.transform = `translateY(${y}px)`;
    el.style.willChange = 'opacity, transform';

    let doneTimer: number;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        el.style.transition = `opacity ${duration}s ${EASE}, transform ${duration}s ${EASE}`;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        // Drop the compositor-layer hint once the transition has finished.
        doneTimer = window.setTimeout(() => {
          el.style.willChange = '';
          el.style.transition = '';
        }, duration * 1000 + 100);
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      clearTimeout(doneTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}
