import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ScrollAnimationOptions {
  y?: number;
  duration?: number;
  start?: string;
}

export function useScrollAnimation<T extends HTMLElement = HTMLElement>(
  options?: ScrollAnimationOptions,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, y: options?.y ?? 40 });

      let firstCallback = true;
      const io = new IntersectionObserver(
        ([entry]) => {
          const isFirst = firstCallback;
          firstCallback = false;
          if (!entry.isIntersecting) return;
          io.disconnect();
          gsap.to(el, {
            opacity: 1, y: 0,
            duration: options?.duration ?? (isFirst ? 0.6 : 0.8),
            ease: 'power2.out',
            delay: isFirst ? 0.1 : 0,
          });
        },
        { threshold: 0, rootMargin: '0px 0px -10% 0px' },
      );
      io.observe(el);

      return () => io.disconnect();
    }, el);

    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}
