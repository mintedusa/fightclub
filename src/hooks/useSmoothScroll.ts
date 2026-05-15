import Lenis from '@studio-freight/lenis';

type LenisInstance = InstanceType<typeof Lenis>;

export function useSmoothScroll() {
  const lenis = (window as Window & { __lenis?: LenisInstance }).__lenis;

  const scrollTo = (target: string | number) => {
    lenis?.scrollTo(target as string, { duration: 1.5 });
  };

  return { scrollTo };
}
