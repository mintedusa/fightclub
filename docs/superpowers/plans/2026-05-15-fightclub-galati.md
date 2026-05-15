# FightClub Galați — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete fitness gym website for FightClub Galați with 4 pages, 10 sections, full animations, and contact form.

**Architecture:** Single Vite app with React Router v7 shared layout (Navbar + Footer), all pages under `/`. GSAP handles macro scroll animations and Hero typewriter; Motion handles card micro-animations and page transitions; Lenis provides smooth scroll synced to GSAP ticker. Zustand manages theme (dark/light) and pricing (monthly/annual) state.

**Tech Stack:** React 19, Vite, TypeScript strict, Tailwind CSS v4, Motion (framer-motion), GSAP + ScrollTrigger + TextPlugin, @studio-freight/lenis, React Router v7 (react-router-dom), Zustand, shadcn/ui, Lucide React, Swiper, react-countup, @emailjs/browser, react-hot-toast, react-helmet-async

---

## File Map

| File | Responsibility |
|---|---|
| `src/main.tsx` | Lenis init, GSAP ticker sync, theme init, React mount |
| `src/App.tsx` | RouterProvider, HelmetProvider, Toaster |
| `src/index.css` | Tailwind v4 @theme tokens, global body styles, Swiper overrides |
| `src/types/index.ts` | All TypeScript interfaces |
| `src/data/classes.ts` | 6 GymClass objects |
| `src/data/trainers.ts` | 4 Trainer objects |
| `src/data/testimonials.ts` | 5 Testimonial objects |
| `src/data/gallery.ts` | 6 gallery image descriptors |
| `src/store/useThemeStore.ts` | Zustand theme store with localStorage persist |
| `src/store/usePricingStore.ts` | Zustand billing toggle store |
| `src/hooks/useScrollAnimation.ts` | Generic GSAP ScrollTrigger fade-in hook |
| `src/hooks/useSmoothScroll.ts` | Lenis scrollTo accessor |
| `src/hooks/useNavbarScroll.ts` | Returns boolean: scrollY > threshold |
| `src/components/ui/Layout.tsx` | Navbar + AnimatePresence Outlet + Footer + scroll reset |
| `src/components/ui/Navbar.tsx` | Sticky nav, scroll effect, theme toggle, mobile drawer |
| `src/components/ui/Footer.tsx` | 4-column footer, social links, copyright |
| `src/components/ui/ClassCard.tsx` | Single class card with Motion whileInView + whileHover |
| `src/components/ui/TrainerCard.tsx` | 3D flip card with Motion rotateY on hover |
| `src/components/ui/PricingCard.tsx` | Pricing card with animated price on billing toggle |
| `src/components/ui/StarRating.tsx` | 5-star display component |
| `src/components/sections/HeroSection.tsx` | Video/img bg, GSAP TextPlugin, parallax, CTA |
| `src/components/sections/StatsSection.tsx` | 4 react-countup stats with Lucide icons |
| `src/components/sections/ClassesSection.tsx` | Grid of 6 ClassCards |
| `src/components/sections/TrainersSection.tsx` | Grid of 4 TrainerCards |
| `src/components/sections/PricingSection.tsx` | Billing toggle + 3 PricingCards |
| `src/components/sections/TestimonialsSection.tsx` | Swiper autoplay carousel |
| `src/components/sections/GallerySection.tsx` | CSS columns masonry, Motion hover |
| `src/components/sections/ContactSection.tsx` | EmailJS form + Google Maps + toast |
| `src/pages/HomePage.tsx` | Composes all 8 sections + SEO Helmet |
| `src/pages/ClassesPage.tsx` | Filter buttons + AnimatePresence filtered grid |
| `src/pages/TrainersPage.tsx` | Mini-hero + TrainerCard grid |
| `src/pages/ContactPage.tsx` | pt-24 wrapper + ContactSection + SEO Helmet |
| `.env.example` | EmailJS and video URL variables |
| `README.md` | Install, configure, run instructions |

---

### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: project root (all Vite scaffolded files)

- [ ] **Step 1.1: Scaffold Vite project**

```bash
cd /Users/filimoncristian/Sites/fightclub
npm create vite@latest . -- --template react-ts
```

Expected: Creates `package.json`, `src/`, `index.html`, `vite.config.ts`, `tsconfig*.json`. Answer `y` to "Current directory is not empty" if prompted.

- [ ] **Step 1.2: Install runtime dependencies**

```bash
npm install framer-motion gsap @studio-freight/lenis react-router-dom zustand @emailjs/browser react-hot-toast react-helmet-async react-countup swiper lucide-react
```

- [ ] **Step 1.3: Install Tailwind CSS v4**

```bash
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 1.4: Configure Tailwind plugin in vite.config.ts**

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

- [ ] **Step 1.5: Replace src/index.css with Tailwind v4 theme tokens**

```css
/* src/index.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-gold: #F5C518;
  --color-gold-dark: #D4A800;
  --color-dark: #0A0A0A;
  --color-surface: #111111;
  --color-surface-2: #1A1A1A;
  --color-muted: #A0A0A0;
}

html {
  scroll-behavior: auto;
}

body {
  background-color: var(--color-dark);
  color: #ffffff;
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}

/* Swiper pagination overrides */
.swiper-pagination-bullet {
  background: var(--color-muted) !important;
  opacity: 1 !important;
}
.swiper-pagination-bullet-active {
  background: var(--color-gold) !important;
}
```

- [ ] **Step 1.6: Verify dev server starts with dark background**

```bash
npm run dev
```

Open http://localhost:5173 — expect dark `#0A0A0A` background.

- [ ] **Step 1.7: Commit**

```bash
git add -A && git commit -m "feat: scaffold Vite React 19 TypeScript project with Tailwind v4 and all dependencies"
```

---

### Task 2: TypeScript Interfaces & Data Files

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/classes.ts`
- Create: `src/data/trainers.ts`
- Create: `src/data/testimonials.ts`
- Create: `src/data/gallery.ts`

- [ ] **Step 2.1: Create TypeScript interfaces**

```ts
// src/types/index.ts
export interface GymClass {
  id: string;
  title: string;
  level: 'Începător' | 'Intermediar' | 'Avansat' | 'Toate nivelele';
  schedule: string;
  image: string;
  description: string;
  category: string;
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  avatar: string;
  certifications: string[];
  socials: { instagram?: string; facebook?: string };
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

export interface NavItem {
  label: string;
  href: string;
}
```

- [ ] **Step 2.2: Create classes data**

```ts
// src/data/classes.ts
import type { GymClass } from '../types';

export const classes: GymClass[] = [
  {
    id: 'box-thai',
    title: 'Box Thai',
    level: 'Intermediar',
    schedule: 'L / M / V  18:00 - 19:30',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600&q=80',
    description: 'Antrenament complet care combină tehnici de box cu lovituri de picior specifice muay thai.',
    category: 'Lupte',
  },
  {
    id: 'crossfit',
    title: 'CrossFit',
    level: 'Avansat',
    schedule: 'M / J / S  07:00 - 08:30',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    description: 'Antrenamente de intensitate ridicată cu exerciții funcționale variate zilnic.',
    category: 'Funcțional',
  },
  {
    id: 'yoga',
    title: 'Yoga',
    level: 'Începător',
    schedule: 'M / V  10:00 - 11:00',
    image: 'https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=600&q=80',
    description: 'Sesiuni de yoga pentru flexibilitate, echilibru mental și recuperare musculară.',
    category: 'Wellness',
  },
  {
    id: 'spinning',
    title: 'Spinning',
    level: 'Toate nivelele',
    schedule: 'L / M / J  19:00 - 20:00',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    description: 'Cardio intens pe bicicletă staționară cu muzică energizantă și instructor motivator.',
    category: 'Cardio',
  },
  {
    id: 'mma',
    title: 'MMA',
    level: 'Avansat',
    schedule: 'M / V  20:00 - 21:30',
    image: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&q=80',
    description: 'Arte marțiale mixte — grappling, box și lupte la sol pentru combatanți serioși.',
    category: 'Lupte',
  },
  {
    id: 'kickbox',
    title: 'Kickbox',
    level: 'Intermediar',
    schedule: 'L / J  17:00 - 18:30',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80',
    description: 'Combinație de box și lovituri de picior, ideal pentru condiție fizică și autoapărare.',
    category: 'Lupte',
  },
];
```

- [ ] **Step 2.3: Create trainers data**

```ts
// src/data/trainers.ts
import type { Trainer } from '../types';

export const trainers: Trainer[] = [
  {
    id: 'alexandru-ionescu',
    name: 'Alexandru Ionescu',
    specialty: 'Box & MMA',
    bio: 'Campion național la box amator cu 15 ani experiență. Antrenor certificat FRBX cu peste 200 de sportivi pregătiți.',
    avatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80',
    certifications: ['FRBX Level 3', 'MMA Coach Certified', 'First Aid'],
    socials: { instagram: '#', facebook: '#' },
  },
  {
    id: 'maria-constantin',
    name: 'Maria Constantin',
    specialty: 'Yoga & Pilates',
    bio: 'Instructor de yoga cu certificare internațională RYT-200. Specializată în yoga terapeutică și recuperare post-traumatism.',
    avatar: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&q=80',
    certifications: ['RYT-200 Yoga Alliance', 'Pilates Mat Level 2', 'Mindfulness Coach'],
    socials: { instagram: '#', facebook: '#' },
  },
  {
    id: 'bogdan-radu',
    name: 'Bogdan Radu',
    specialty: 'CrossFit & Strength',
    bio: 'CrossFit Level 2 Trainer cu expertiză în olimpic lifting și programare pentru forță maximă.',
    avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80',
    certifications: ['CrossFit L2', 'NSCA-CSCS', 'Olympic Weightlifting'],
    socials: { instagram: '#', facebook: '#' },
  },
  {
    id: 'elena-popa',
    name: 'Elena Popa',
    specialty: 'Spinning & Cardio',
    bio: 'Instructor spinning certificat Schwinn cu 8 ani în industrie. Campioană la triatlon, pasionată de performanță cardio.',
    avatar: 'https://images.unsplash.com/photo-1609899464926-b2e60b4c7b42?w=400&q=80',
    certifications: ['Schwinn Cycling', 'ACE Group Fitness', 'Triathlon Coach'],
    socials: { instagram: '#', facebook: '#' },
  },
];
```

- [ ] **Step 2.4: Create testimonials data**

```ts
// src/data/testimonials.ts
import type { Testimonial } from '../types';

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Andrei Moldovan',
    role: 'Membru de 3 ani',
    text: 'FightClub Galați mi-a schimbat viața. Am slăbit 18 kg în 6 luni și acum mă simt mai puternic ca niciodată. Trainerii sunt profesioniști și atmosfera e incredibilă.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80',
  },
  {
    id: 't2',
    name: 'Cristina Dănilă',
    role: 'Membră de 2 ani',
    text: 'Clasele de yoga cu Maria sunt transformatoare. Am câștigat flexibilitate, echilibru și liniște mentală. Recomand cu toată inima oricui vrea să înceapă.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
  },
  {
    id: 't3',
    name: 'Mihai Vlad',
    role: 'Membru de 1 an',
    text: 'Cel mai bun gym din Galați, fără discuție. Echipamente de top, curățenie impecabilă și traineri care știu să te motiveze chiar și în zilele grele.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
  },
  {
    id: 't4',
    name: 'Raluca Ionescu',
    role: 'Membră de 6 luni',
    text: 'Am început cu CrossFit fără nicio experiență. Bogdan m-a ghidat pas cu pas și acum fac exerciții pe care nu le credeam posibile. Rezultatele vorbesc de la sine.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
  },
  {
    id: 't5',
    name: 'Daniel Ciobanu',
    role: 'Membru de 4 ani',
    text: 'Am testat multe săli în țară, dar FightClub Galați rămâne preferata mea. Comunitatea de aici e unică — te face să vii cu plăcere la antrenament în fiecare zi.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&q=80',
  },
];
```

- [ ] **Step 2.5: Create gallery data**

```ts
// src/data/gallery.ts
export const galleryImages = [
  {
    id: 'g1',
    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    alt: 'Sală de fitness FightClub Galați',
  },
  {
    id: 'g2',
    src: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    alt: 'Antrenament box',
  },
  {
    id: 'g3',
    src: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=800&q=80',
    alt: 'CrossFit training',
  },
  {
    id: 'g4',
    src: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&q=80',
    alt: 'Ring de box',
  },
  {
    id: 'g5',
    src: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
    alt: 'Antrenament cu greutăți',
  },
  {
    id: 'g6',
    src: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
    alt: 'Yoga class',
  },
];
```

- [ ] **Step 2.6: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2.7: Commit**

```bash
git add -A && git commit -m "feat: add TypeScript interfaces and placeholder data files"
```

---

### Task 3: Zustand Stores

**Files:**
- Create: `src/store/useThemeStore.ts`
- Create: `src/store/usePricingStore.ts`

- [ ] **Step 3.1: Create theme store**

```ts
// src/store/useThemeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  theme: 'dark' | 'light';
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        document.documentElement.classList.toggle('dark', next === 'dark');
      },
    }),
    { name: 'fightclub-theme' },
  ),
);

export function initTheme() {
  const stored = localStorage.getItem('fightclub-theme');
  const theme = stored ? (JSON.parse(stored).state?.theme ?? 'dark') : 'dark';
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
```

- [ ] **Step 3.2: Create pricing store**

```ts
// src/store/usePricingStore.ts
import { create } from 'zustand';

interface PricingStore {
  billing: 'monthly' | 'annual';
  toggle: () => void;
}

export const usePricingStore = create<PricingStore>()((set, get) => ({
  billing: 'monthly',
  toggle: () =>
    set({ billing: get().billing === 'monthly' ? 'annual' : 'monthly' }),
}));
```

- [ ] **Step 3.3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3.4: Commit**

```bash
git add -A && git commit -m "feat: add Zustand stores for theme and pricing"
```

---

### Task 4: Lenis + GSAP + Custom Hooks

**Files:**
- Modify: `src/main.tsx`
- Create: `src/hooks/useScrollAnimation.ts`
- Create: `src/hooks/useSmoothScroll.ts`
- Create: `src/hooks/useNavbarScroll.ts`

- [ ] **Step 4.1: Initialize Lenis + GSAP in main.tsx**

```tsx
// src/main.tsx
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
```

- [ ] **Step 4.2: Create useScrollAnimation hook**

```ts
// src/hooks/useScrollAnimation.ts
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

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
      gsap.fromTo(
        el,
        { opacity: 0, y: options?.y ?? 40 },
        {
          opacity: 1,
          y: 0,
          duration: options?.duration ?? 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: options?.start ?? 'top 85%',
            once: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}
```

- [ ] **Step 4.3: Create useSmoothScroll hook**

```ts
// src/hooks/useSmoothScroll.ts
import Lenis from '@studio-freight/lenis';

type LenisInstance = InstanceType<typeof Lenis>;

export function useSmoothScroll() {
  const lenis = (window as Window & { __lenis?: LenisInstance }).__lenis;

  const scrollTo = (target: string | number) => {
    lenis?.scrollTo(target as string, { duration: 1.5 });
  };

  return { scrollTo };
}
```

- [ ] **Step 4.4: Create useNavbarScroll hook**

```ts
// src/hooks/useNavbarScroll.ts
import { useEffect, useState } from 'react';

export function useNavbarScroll(threshold = 80) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}
```

- [ ] **Step 4.5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4.6: Commit**

```bash
git add -A && git commit -m "feat: initialize Lenis smooth scroll synced to GSAP ticker, add custom hooks"
```

---

### Task 5: App.tsx + React Router Layout

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/ui/Layout.tsx`
- Create: `src/components/ui/Navbar.tsx` (stub)
- Create: `src/components/ui/Footer.tsx` (stub)
- Create: `src/pages/HomePage.tsx` (stub)
- Create: `src/pages/ClassesPage.tsx` (stub)
- Create: `src/pages/TrainersPage.tsx` (stub)
- Create: `src/pages/ContactPage.tsx` (stub)

- [ ] **Step 5.1: Create Layout component**

```tsx
// src/components/ui/Layout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import Navbar from './Navbar';
import Footer from './Footer';

type LenisInstance = InstanceType<typeof Lenis>;

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    const lenis = (window as Window & { __lenis?: LenisInstance }).__lenis;
    lenis?.scrollTo(0, { immediate: true });
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
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
```

- [ ] **Step 5.2: Create stub Navbar**

```tsx
// src/components/ui/Navbar.tsx
export default function Navbar() {
  return <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface" />;
}
```

- [ ] **Step 5.3: Create stub Footer**

```tsx
// src/components/ui/Footer.tsx
export default function Footer() {
  return <footer className="bg-dark py-8" />;
}
```

- [ ] **Step 5.4: Create stub pages**

```tsx
// src/pages/HomePage.tsx
export default function HomePage() {
  return <div className="pt-16 min-h-screen">Home</div>;
}
```

```tsx
// src/pages/ClassesPage.tsx
export default function ClassesPage() {
  return <div className="pt-16 min-h-screen">Clase</div>;
}
```

```tsx
// src/pages/TrainersPage.tsx
export default function TrainersPage() {
  return <div className="pt-16 min-h-screen">Traineri</div>;
}
```

```tsx
// src/pages/ContactPage.tsx
export default function ContactPage() {
  return <div className="pt-16 min-h-screen">Contact</div>;
}
```

- [ ] **Step 5.5: Set up App.tsx with router**

```tsx
// src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Layout from './components/ui/Layout';
import HomePage from './pages/HomePage';
import ClassesPage from './pages/ClassesPage';
import TrainersPage from './pages/TrainersPage';
import ContactPage from './pages/ContactPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'clase', element: <ClassesPage /> },
      { path: 'traineri', element: <TrainersPage /> },
      { path: 'contact', element: <ContactPage /> },
    ],
  },
]);

export default function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid #F5C518',
          },
        }}
      />
    </HelmetProvider>
  );
}
```

- [ ] **Step 5.6: Verify routing works**

```bash
npm run dev
```

Open http://localhost:5173 and manually navigate to `/clase`, `/traineri`, `/contact` in the address bar — all should render their stub text.

- [ ] **Step 5.7: Commit**

```bash
git add -A && git commit -m "feat: set up React Router v7 with shared layout and AnimatePresence page transitions"
```

---

### Task 6: Navbar Component

**Files:**
- Modify: `src/components/ui/Navbar.tsx`

- [ ] **Step 6.1: Implement full Navbar**

```tsx
// src/components/ui/Navbar.tsx
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, Dumbbell } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useNavbarScroll } from '../../hooks/useNavbarScroll';
import type { NavItem } from '../../types';

const navItems: NavItem[] = [
  { label: 'Acasă', href: '/' },
  { label: 'Clase', href: '/clase' },
  { label: 'Traineri', href: '/traineri' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useThemeStore();
  const scrolled = useNavbarScroll(80);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Dumbbell className="text-gold w-6 h-6" />
          <span className="text-gold font-black text-xl tracking-tight">FC</span>
          <span className="text-white font-semibold text-sm hidden sm:block">
            FightClub Galați
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-gold' : 'text-white/80 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 text-white/70 hover:text-gold transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <Link
            to="/contact"
            className="hidden md:block bg-gold text-dark text-sm font-bold px-4 py-2 rounded hover:bg-gold-dark transition-colors"
          >
            Înscrie-te
          </Link>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 top-16 bg-dark z-40 flex flex-col p-8 gap-6"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `text-2xl font-bold transition-colors ${
                    isActive ? 'text-gold' : 'text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="mt-4 bg-gold text-dark text-center text-lg font-bold px-6 py-3 rounded"
            >
              Înscrie-te
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
```

- [ ] **Step 6.2: Test scroll effect and mobile menu**

```bash
npm run dev
```

- Scroll past 80px → Navbar gets `bg-dark/90` with blur
- Resize to < 768px → hamburger appears → click opens drawer from right
- Click Sun icon → applies light theme (html gets no `.dark` class)

- [ ] **Step 6.3: Commit**

```bash
git add -A && git commit -m "feat: implement Navbar with scroll effect, theme toggle, and mobile drawer"
```

---

### Task 7: Footer Component

**Files:**
- Modify: `src/components/ui/Footer.tsx`

- [ ] **Step 7.1: Implement Footer**

```tsx
// src/components/ui/Footer.tsx
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Dumbbell } from 'lucide-react';

const navLinks = [
  { label: 'Acasă', href: '/' },
  { label: 'Clase', href: '/clase' },
  { label: 'Traineri', href: '/traineri' },
  { label: 'Contact', href: '/contact' },
];

const classLinks = ['Box Thai', 'CrossFit', 'Yoga', 'Spinning', 'MMA', 'Kickbox'];

export default function Footer() {
  return (
    <footer className="bg-dark border-t-2 border-gold pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="text-gold w-6 h-6" />
              <span className="text-gold font-black text-xl">FC</span>
              <span className="text-white font-semibold">FightClub Galați</span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Forjează-ți limitele la FightClub Galați. Sala de fitness #1 din Galați.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Navigare
            </h4>
            <ul className="space-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="text-muted text-sm hover:text-gold transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Clase
            </h4>
            <ul className="space-y-2">
              {classLinks.map((c) => (
                <li key={c}>
                  <span className="text-muted text-sm">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Contact
            </h4>
            <ul className="space-y-2 text-muted text-sm mb-5">
              <li>Strada Saturn 34, Galați</li>
              <li>0236 000 000</li>
              <li>contact@fightclubgalati.ro</li>
              <li>L-V: 06:00-22:00 · S-D: 08:00-20:00</li>
            </ul>
            <div className="flex gap-4">
              <a href="#" className="text-muted hover:text-gold transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted hover:text-gold transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted hover:text-gold transition-colors" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-muted text-sm">
          © 2025 FightClub Galați. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7.2: Verify Footer renders on all pages**

Open http://localhost:5173 and navigate to each route — Footer appears at the bottom with gold top border.

- [ ] **Step 7.3: Commit**

```bash
git add -A && git commit -m "feat: implement Footer with 4-column layout, social links, and copyright"
```

---

### Task 8: HeroSection

**Files:**
- Create: `src/components/sections/HeroSection.tsx`

- [ ] **Step 8.1: Implement HeroSection**

```tsx
// src/components/sections/HeroSection.tsx
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import TextPlugin from 'gsap/TextPlugin';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

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
    void heroVideoUrl; // used in JSX

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
```

- [ ] **Step 8.2: Add to HomePage and verify**

```tsx
// src/pages/HomePage.tsx
import HeroSection from '../components/sections/HeroSection';

export default function HomePage() {
  return <HeroSection />;
}
```

Open browser — typewriter sequence plays: "Forjează-ți" then "Limitele" in gold. Scroll down — background moves slower than content (parallax). Bouncing chevron visible.

- [ ] **Step 8.3: Commit**

```bash
git add -A && git commit -m "feat: implement HeroSection with GSAP TextPlugin typewriter and parallax"
```

---

### Task 9: StatsSection

**Files:**
- Create: `src/components/sections/StatsSection.tsx`

- [ ] **Step 9.1: Implement StatsSection**

```tsx
// src/components/sections/StatsSection.tsx
import CountUp from 'react-countup';
import { Users, UserCheck, Dumbbell, Trophy } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const stats = [
  { id: 's1', end: 500, suffix: '+', label: 'Membri Activi', Icon: Users },
  { id: 's2', end: 12, suffix: '', label: 'Traineri Certificați', Icon: UserCheck },
  { id: 's3', end: 30, suffix: '+', label: 'Clase / Săptămână', Icon: Dumbbell },
  { id: 's4', end: 10, suffix: '', label: 'Ani Experiență', Icon: Trophy },
];

export default function StatsSection() {
  const sectionRef = useScrollAnimation<HTMLElement>();

  return (
    <section ref={sectionRef} className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ id, end, suffix, label, Icon }) => (
            <div key={id} className="text-center">
              <Icon className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-4xl sm:text-5xl font-black text-white mb-1">
                <CountUp
                  end={end}
                  suffix={suffix}
                  duration={2.5}
                  separator="."
                  enableScrollSpy
                  scrollSpyOnce
                />
              </div>
              <p className="text-muted text-sm font-medium uppercase tracking-wider">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9.2: Add to HomePage and verify counters**

```tsx
// src/pages/HomePage.tsx
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
    </>
  );
}
```

Scroll to stats — counters should animate from 0 to their end values. `500+`, `12`, `30+`, `10`.

- [ ] **Step 9.3: Commit**

```bash
git add -A && git commit -m "feat: implement StatsSection with react-countup scroll-triggered animation"
```

---

### Task 10: ClassCard + ClassesSection

**Files:**
- Create: `src/components/ui/ClassCard.tsx`
- Create: `src/components/sections/ClassesSection.tsx`

- [ ] **Step 10.1: Implement ClassCard**

```tsx
// src/components/ui/ClassCard.tsx
import { motion } from 'framer-motion';
import { Clock, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { GymClass } from '../../types';

const levelColors: Record<GymClass['level'], string> = {
  Începător: 'bg-green-500/20 text-green-400',
  Intermediar: 'bg-yellow-500/20 text-yellow-400',
  Avansat: 'bg-red-500/20 text-red-400',
  'Toate nivelele': 'bg-blue-500/20 text-blue-400',
};

interface ClassCardProps {
  gymClass: GymClass;
  index: number;
}

export default function ClassCard({ gymClass, index }: ClassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="bg-surface-2 rounded-xl overflow-hidden group"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={gymClass.image}
          alt={gymClass.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${
            levelColors[gymClass.level]
          }`}
        >
          {gymClass.level}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-white font-bold text-lg mb-2">{gymClass.title}</h3>
        <p className="text-muted text-sm mb-4 line-clamp-2">{gymClass.description}</p>

        <div className="flex items-center gap-4 text-muted text-xs mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {gymClass.schedule}
          </span>
          <span className="flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5" />
            {gymClass.category}
          </span>
        </div>

        <Link
          to="/clase"
          className="inline-block text-gold text-sm font-semibold border border-gold/40 hover:border-gold hover:bg-gold/10 px-4 py-1.5 rounded transition-colors"
        >
          Detalii
        </Link>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 10.2: Implement ClassesSection**

```tsx
// src/components/sections/ClassesSection.tsx
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import ClassCard from '../ui/ClassCard';
import { classes } from '../../data/classes';

export default function ClassesSection() {
  const titleRef = useScrollAnimation<HTMLDivElement>();

  return (
    <section id="clase" className="py-20 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-12">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Programele noastre
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Clase & <span className="text-gold">Programe</span>
          </h2>
          <p className="text-muted mt-4 max-w-xl mx-auto">
            Alege din 30+ clase săptămânale conduse de traineri certificați,
            potrivite pentru orice nivel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, i) => (
            <ClassCard key={cls.id} gymClass={cls} index={i} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/clase"
            className="inline-block bg-gold text-dark font-bold px-8 py-3 rounded hover:bg-gold-dark transition-colors"
          >
            Vezi Toate Clasele
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 10.3: Add to HomePage and verify**

```tsx
// src/pages/HomePage.tsx
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import ClassesSection from '../components/sections/ClassesSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ClassesSection />
    </>
  );
}
```

Scroll to classes — 6 cards stagger in (0.1s delay each). Hover a card — it lifts 8px. Level badge visible top-right with color coding.

- [ ] **Step 10.4: Commit**

```bash
git add -A && git commit -m "feat: implement ClassCard and ClassesSection with Motion stagger and hover animations"
```

---

### Task 11: TrainerCard + TrainersSection

**Files:**
- Create: `src/components/ui/TrainerCard.tsx`
- Create: `src/components/sections/TrainersSection.tsx`

- [ ] **Step 11.1: Implement TrainerCard with 3D flip**

```tsx
// src/components/ui/TrainerCard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook } from 'lucide-react';
import type { Trainer } from '../../types';

interface TrainerCardProps {
  trainer: Trainer;
  index: number;
}

export default function TrainerCard({ trainer, index }: TrainerCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative h-80 cursor-pointer"
      style={{ perspective: 1000 }}
      onHoverStart={() => setFlipped(true)}
      onHoverEnd={() => setFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src={trainer.avatar}
            alt={trainer.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-white font-bold text-lg">{trainer.name}</h3>
            <p className="text-gold text-sm font-medium">{trainer.specialty}</p>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-surface-2 rounded-xl p-6 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div>
            <h3 className="text-white font-bold text-lg mb-1">{trainer.name}</h3>
            <p className="text-gold text-sm font-medium mb-3">{trainer.specialty}</p>
            <p className="text-muted text-sm leading-relaxed">{trainer.bio}</p>
          </div>
          <div>
            <div className="flex flex-wrap gap-1 mb-4">
              {trainer.certifications.map((cert) => (
                <span
                  key={cert}
                  className="text-xs bg-gold/10 text-gold border border-gold/30 px-2 py-0.5 rounded-full"
                >
                  {cert}
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              {trainer.socials.instagram && (
                <a
                  href={trainer.socials.instagram}
                  className="text-muted hover:text-gold transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {trainer.socials.facebook && (
                <a
                  href={trainer.socials.facebook}
                  className="text-muted hover:text-gold transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 11.2: Implement TrainersSection**

```tsx
// src/components/sections/TrainersSection.tsx
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import TrainerCard from '../ui/TrainerCard';
import { trainers } from '../../data/trainers';

export default function TrainersSection() {
  const titleRef = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-12">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Echipa noastră
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Trainerii <span className="text-gold">Noștri</span>
          </h2>
          <p className="text-muted mt-4 max-w-xl mx-auto">
            Profesioniști certificați dedicați transformării tale. Treci cu
            mouse-ul peste un card pentru detalii.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trainers.map((trainer, i) => (
            <TrainerCard key={trainer.id} trainer={trainer} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 11.3: Add to HomePage and verify flip**

Add `<TrainersSection />` after `<ClassesSection />` in `src/pages/HomePage.tsx`.

Hover over a trainer card — it rotates 180° revealing bio, certifications (gold badges), and social icons.

- [ ] **Step 11.4: Commit**

```bash
git add -A && git commit -m "feat: implement TrainerCard with 3D flip and TrainersSection"
```

---

### Task 12: PricingCard + PricingSection

**Files:**
- Create: `src/components/ui/PricingCard.tsx`
- Create: `src/components/sections/PricingSection.tsx`

- [ ] **Step 12.1: Implement PricingCard**

```tsx
// src/components/ui/PricingCard.tsx
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { PricingPlan } from '../../types';

interface PricingCardProps {
  plan: PricingPlan;
  billing: 'monthly' | 'annual';
  index: number;
}

export default function PricingCard({ plan, billing, index }: PricingCardProps) {
  const price =
    billing === 'annual' ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative rounded-2xl p-8 flex flex-col ${
        plan.highlighted
          ? 'bg-gold text-dark ring-4 ring-gold scale-105'
          : 'bg-surface-2 text-white'
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-dark text-gold text-xs font-bold px-4 py-1.5 rounded-full border border-gold whitespace-nowrap">
          {plan.badge}
        </span>
      )}

      <h3
        className={`text-xl font-bold mb-2 ${
          plan.highlighted ? 'text-dark' : 'text-white'
        }`}
      >
        {plan.name}
      </h3>

      <div className="mb-6">
        <motion.span
          key={price}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-5xl font-black ${
            plan.highlighted ? 'text-dark' : 'text-gold'
          }`}
        >
          {price}
        </motion.span>
        <span
          className={`text-sm ml-1 ${
            plan.highlighted ? 'text-dark/70' : 'text-muted'
          }`}
        >
          RON/lună
        </span>
        {billing === 'annual' && (
          <p
            className={`text-xs mt-1 ${
              plan.highlighted ? 'text-dark/70' : 'text-green-400'
            }`}
          >
            Economisești 20%
          </p>
        )}
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                plan.highlighted ? 'text-dark' : 'text-gold'
              }`}
            />
            <span className={plan.highlighted ? 'text-dark/90' : 'text-muted'}>
              {f}
            </span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3 rounded-lg font-bold text-sm transition-colors ${
          plan.highlighted
            ? 'bg-dark text-gold hover:bg-dark/80'
            : 'bg-gold text-dark hover:bg-gold-dark'
        }`}
      >
        Alege Planul
      </button>
    </motion.div>
  );
}
```

- [ ] **Step 12.2: Implement PricingSection**

```tsx
// src/components/sections/PricingSection.tsx
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { usePricingStore } from '../../store/usePricingStore';
import PricingCard from '../ui/PricingCard';
import type { PricingPlan } from '../../types';

const plans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 99,
    highlighted: false,
    features: [
      'Acces sală L-V 06:00-22:00',
      'Vestiare și dușuri',
      '2 clase/săptămână inclusă',
      'Evaluare fizică inițială',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 159,
    highlighted: true,
    badge: 'Cel mai popular',
    features: [
      'Acces sală nelimitat',
      'Toate clasele de grup inclusă',
      '1 sesiune Personal Training/lună',
      'Acces saună și jacuzzi',
      'App FightClub exclusiv',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    monthlyPrice: 249,
    highlighted: false,
    features: [
      'Tot din planul Pro',
      'Acces 24/7 cu card',
      'Personal Trainer dedicat (4h/lună)',
      'Consultație nutriționist lunar',
      'Zonă VIP exclusivă',
      'Towel service inclus',
    ],
  },
];

export default function PricingSection() {
  const titleRef = useScrollAnimation<HTMLDivElement>();
  const { billing, toggle } = usePricingStore();

  return (
    <section className="py-20 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-10">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Abonamente
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Alege <span className="text-gold">Planul</span>
          </h2>

          <div className="flex items-center justify-center gap-4 mt-6">
            <span
              className={`text-sm font-medium ${
                billing === 'monthly' ? 'text-white' : 'text-muted'
              }`}
            >
              Lunar
            </span>
            <button
              onClick={toggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                billing === 'annual' ? 'bg-gold' : 'bg-surface-2'
              }`}
              aria-label="Toggle billing period"
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  billing === 'annual' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                billing === 'annual' ? 'text-white' : 'text-muted'
              }`}
            >
              Anual{' '}
              <span className="text-green-400 text-xs font-bold">-20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} billing={billing} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 12.3: Add to HomePage and verify toggle**

Add `<PricingSection />` after `<TrainersSection />` in `src/pages/HomePage.tsx`.

Click toggle — prices animate from 99/159/249 to 79/127/199. Pro card is gold and slightly scaled up with badge.

- [ ] **Step 12.4: Commit**

```bash
git add -A && git commit -m "feat: implement PricingCard and PricingSection with Lunar/Anual billing toggle"
```

---

### Task 13: StarRating + TestimonialsSection

**Files:**
- Create: `src/components/ui/StarRating.tsx`
- Create: `src/components/sections/TestimonialsSection.tsx`

- [ ] **Step 13.1: Implement StarRating**

```tsx
// src/components/ui/StarRating.tsx
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
}

export default function StarRating({ rating }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-gold fill-gold' : 'text-muted'}`}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 13.2: Implement TestimonialsSection**

```tsx
// src/components/sections/TestimonialsSection.tsx
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
```

- [ ] **Step 13.3: Add to HomePage and verify Swiper**

Add `<TestimonialsSection />` after `<PricingSection />` in `src/pages/HomePage.tsx`.

Open browser — Swiper autoplays every 3.5s, 3 slides on desktop, gold pagination dots at bottom.

- [ ] **Step 13.4: Commit**

```bash
git add -A && git commit -m "feat: implement StarRating and TestimonialsSection with Swiper autoplay carousel"
```

---

### Task 14: GallerySection

**Files:**
- Create: `src/components/sections/GallerySection.tsx`

- [ ] **Step 14.1: Implement GallerySection**

```tsx
// src/components/sections/GallerySection.tsx
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { galleryImages } from '../../data/gallery';

export default function GallerySection() {
  const titleRef = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="py-20 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-12">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Atmosferă
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Galerie <span className="text-gold">Foto</span>
          </h2>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {galleryImages.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.03 }}
              className="relative overflow-hidden rounded-xl break-inside-avoid group"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 14.2: Add to HomePage and verify masonry**

Add `<GallerySection />` after `<TestimonialsSection />` in `src/pages/HomePage.tsx`.

Verify 3-column masonry layout on desktop, images at varying heights, gold overlay on hover.

- [ ] **Step 14.3: Commit**

```bash
git add -A && git commit -m "feat: implement GallerySection with CSS columns masonry and gold hover overlay"
```

---

### Task 15: ContactSection

**Files:**
- Create: `src/components/sections/ContactSection.tsx`
- Create: `.env.example`

- [ ] **Step 15.1: Create .env.example**

```bash
# .env.example
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_HERO_VIDEO_URL=https://example.com/hero-video.mp4
```

Also create `.env.local` (won't be committed — already in .gitignore from Vite):
```
VITE_EMAILJS_SERVICE_ID=placeholder
VITE_EMAILJS_TEMPLATE_ID=placeholder
VITE_EMAILJS_PUBLIC_KEY=placeholder
```

- [ ] **Step 15.2: Implement ContactSection**

```tsx
// src/components/sections/ContactSection.tsx
import { FormEvent, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const contactInfo = [
  { Icon: MapPin, text: 'Strada Saturn 34, 800647 Galați' },
  { Icon: Phone, text: '0236 000 000' },
  { Icon: Mail, text: 'contact@fightclubgalati.ro' },
  { Icon: Clock, text: 'L-V: 06:00-22:00 · S-D: 08:00-20:00' },
];

export default function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useScrollAnimation<HTMLDivElement>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setLoading(true);
    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID as string,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string,
        formRef.current,
        { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string },
      );
      toast.success('Mesaj trimis cu succes! Te vom contacta în curând.');
      formRef.current.reset();
    } catch {
      toast.error('Eroare la trimitere. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-muted text-sm focus:outline-none focus:border-gold transition-colors';

  return (
    <section id="contact" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-12">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Contactează-ne
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Hai la <span className="text-gold">FightClub</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="from_name"
              placeholder="Numele tău *"
              className={inputClass}
              required
            />
            <input
              type="email"
              name="from_email"
              placeholder="Email *"
              className={inputClass}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Telefon"
              className={inputClass}
            />
            <textarea
              name="message"
              placeholder="Mesajul tău *"
              rows={5}
              className={`${inputClass} resize-none`}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-dark font-bold py-3 rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Se trimite...' : 'Trimite Mesaj'}
            </button>
          </form>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map(({ Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                  <span className="text-muted text-sm">{text}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden h-64 lg:h-80">
              <iframe
                src="https://maps.google.com/maps?q=Strada+Saturn+34,+Galati,+Romania&output=embed&hl=ro"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FightClub Galați pe hartă"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 15.3: Add to HomePage**

Add `<ContactSection />` after `<GallerySection />` in `src/pages/HomePage.tsx`.

Open browser — submit empty form → HTML5 validation fires. Fill all fields and click Trimite → error toast appears (placeholder EmailJS credentials), confirming the flow works.

- [ ] **Step 15.4: Commit**

```bash
git add -A && git commit -m "feat: implement ContactSection with EmailJS form, Google Maps, and toast notifications"
```

---

### Task 16: Complete HomePage with SEO

**Files:**
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 16.1: Assemble all sections with Helmet SEO**

```tsx
// src/pages/HomePage.tsx
import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import ClassesSection from '../components/sections/ClassesSection';
import TrainersSection from '../components/sections/TrainersSection';
import PricingSection from '../components/sections/PricingSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import GallerySection from '../components/sections/GallerySection';
import ContactSection from '../components/sections/ContactSection';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>FightClub Galați — Sala de Fitness #1 din Galați</title>
        <meta
          name="description"
          content="Antrenează-te la FightClub Galați. Box, CrossFit, Yoga, MMA și mai mult. 500+ membri, 12 traineri certificați. Strada Saturn 34, Galați."
        />
      </Helmet>

      <HeroSection />
      <StatsSection />
      <ClassesSection />
      <TrainersSection />
      <PricingSection />
      <TestimonialsSection />
      <GallerySection />
      <ContactSection />
    </>
  );
}
```

- [ ] **Step 16.2: Full page walkthrough**

```bash
npm run dev
```

Walk through top to bottom verifying:
- Hero typewriter plays, CTA "Începe Acum" scrolls to `#clase`
- Stats counters animate on scroll
- 6 class cards stagger in, hover lifts
- 4 trainer cards flip on hover revealing bio
- Pricing toggle switches prices, Pro highlighted gold
- Swiper autoplays
- Gallery masonry grid, gold overlay on hover
- Contact form + map visible

- [ ] **Step 16.3: Commit**

```bash
git add -A && git commit -m "feat: assemble complete HomePage with all 8 sections and SEO meta tags"
```

---

### Task 17: ClassesPage

**Files:**
- Modify: `src/pages/ClassesPage.tsx`

- [ ] **Step 17.1: Implement ClassesPage with filter system**

```tsx
// src/pages/ClassesPage.tsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import ClassCard from '../components/ui/ClassCard';
import { classes } from '../data/classes';
import type { GymClass } from '../types';

type Filter = 'All' | GymClass['level'];

const filters: Filter[] = [
  'All',
  'Începător',
  'Intermediar',
  'Avansat',
  'Toate nivelele',
];

export default function ClassesPage() {
  const [active, setActive] = useState<Filter>('All');

  const filtered = classes.filter(
    (c) =>
      active === 'All' ||
      c.level === active ||
      (active !== 'Toate nivelele' && c.level === 'Toate nivelele'),
  );

  return (
    <>
      <Helmet>
        <title>Clase & Programe — FightClub Galați</title>
        <meta
          name="description"
          content="Descoperă toate clasele noastre de fitness din Galați. Box Thai, CrossFit, Yoga, Spinning, MMA, Kickbox."
        />
      </Helmet>

      <div className="pt-32 pb-12 bg-surface text-center">
        <span className="text-gold text-sm font-bold uppercase tracking-widest">
          Programele noastre
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white mt-2">
          Clase & <span className="text-gold">Programe</span>
        </h1>
        <p className="text-muted mt-4 max-w-lg mx-auto text-sm">
          30+ clase săptămânale pentru orice nivel și obiectiv.
        </p>
      </div>

      <div className="bg-surface pb-8 flex flex-wrap justify-center gap-3 px-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${
              active === f
                ? 'bg-gold text-dark border-gold'
                : 'border-white/20 text-muted hover:border-gold hover:text-gold'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((cls, i) => (
                <motion.div
                  key={cls.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <ClassCard gymClass={cls} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 17.2: Test all filter combinations**

Navigate to `/clase`:
- "All" → 6 classes visible
- "Începător" → Yoga + Spinning (Toate nivelele appears in all non-"Toate nivelele" filters)
- "Intermediar" → Box Thai + Kickbox + Spinning
- "Avansat" → CrossFit + MMA + Spinning
- "Toate nivelele" → Spinning only

Cards animate in/out with Motion on filter change.

- [ ] **Step 17.3: Commit**

```bash
git add -A && git commit -m "feat: implement ClassesPage with animated filter buttons and AnimatePresence grid"
```

---

### Task 18: TrainersPage + ContactPage

**Files:**
- Modify: `src/pages/TrainersPage.tsx`
- Modify: `src/pages/ContactPage.tsx`

- [ ] **Step 18.1: Implement TrainersPage**

```tsx
// src/pages/TrainersPage.tsx
import { Helmet } from 'react-helmet-async';
import TrainerCard from '../components/ui/TrainerCard';
import { trainers } from '../data/trainers';

export default function TrainersPage() {
  return (
    <>
      <Helmet>
        <title>Trainerii Noștri — FightClub Galați</title>
        <meta
          name="description"
          content="Echipa de traineri certificați FightClub Galați. Alexandru Ionescu, Maria Constantin, Bogdan Radu, Elena Popa."
        />
      </Helmet>

      <div className="pt-32 pb-12 bg-surface text-center">
        <span className="text-gold text-sm font-bold uppercase tracking-widest">
          Echipa noastră
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white mt-2">
          Trainerii <span className="text-gold">Noștri</span>
        </h1>
        <p className="text-muted mt-4 max-w-lg mx-auto text-sm">
          Profesioniști certificați dedicați transformării tale. Treci cu
          mouse-ul pentru detalii.
        </p>
      </div>

      <div className="bg-dark py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((trainer, i) => (
              <TrainerCard key={trainer.id} trainer={trainer} index={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 18.2: Implement ContactPage**

```tsx
// src/pages/ContactPage.tsx
import { Helmet } from 'react-helmet-async';
import ContactSection from '../components/sections/ContactSection';

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact & Locație — FightClub Galați</title>
        <meta
          name="description"
          content="Strada Saturn 34, 800647 Galați. Contactează-ne astăzi. Tel: 0236 000 000. Email: contact@fightclubgalati.ro"
        />
      </Helmet>
      <div className="pt-24">
        <ContactSection />
      </div>
    </>
  );
}
```

- [ ] **Step 18.3: Verify all 4 routes**

```bash
npm run dev
```

- `/` — full landing page
- `/clase` — filter buttons + grid
- `/traineri` — mini hero + 4 flip cards
- `/contact` — form + map

Check Navbar links route correctly. Check Footer links route correctly.

- [ ] **Step 18.4: Commit**

```bash
git add -A && git commit -m "feat: implement TrainersPage and ContactPage with SEO Helmet"
```

---

### Task 19: README + Final Build

**Files:**
- Create: `README.md`

- [ ] **Step 19.1: Create README.md**

```markdown
# FightClub Galați

Site complet pentru sala de fitness FightClub Galați. React 19 + Vite + TypeScript + Tailwind CSS v4.

## Prerequisites

- Node.js 20+
- npm 9+

## Instalare

```bash
git clone <repo-url>
cd fightclub
npm install
cp .env.example .env.local
# editează .env.local cu datele tale
npm run dev
```

## Configurare EmailJS

1. Creează cont la [emailjs.com](https://www.emailjs.com/)
2. Adaugă un **Email Service** (Gmail, Outlook etc.)
3. Creează un **Email Template** cu variabilele: `{{from_name}}`, `{{from_email}}`, `{{phone}}`, `{{message}}`
4. Copiază **Service ID**, **Template ID** și **Public Key** în `.env.local`

## Configurare video Hero (opțional)

```
VITE_HERO_VIDEO_URL=https://your-cdn.com/hero.mp4
```

Fără această variabilă se afișează imaginea fallback Unsplash.

## Comenzi

```bash
npm run dev       # development server
npm run build     # build producție
npm run preview   # preview build local
```

## Pagini

| Rută | Descriere |
|---|---|
| `/` | Landing page (Hero, Stats, Clase, Traineri, Prețuri, Testimoniale, Galerie, Contact) |
| `/clase` | Grid clase cu filtre după nivel |
| `/traineri` | Grid profiluri traineri cu flip card |
| `/contact` | Formular + Google Maps |

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · Motion · GSAP + ScrollTrigger · Lenis · React Router v7 · Zustand · Swiper · react-countup · EmailJS · react-hot-toast · react-helmet-async
```

- [ ] **Step 19.2: Run production build**

```bash
npm run build
```

Expected: Build completes with no TypeScript errors and no import errors. Output in `dist/`.

- [ ] **Step 19.3: Final checklist in preview**

```bash
npm run preview
```

Verify each item:
- [ ] Dark theme by default (html has `.dark` class)
- [ ] Theme toggle (Sun icon → switches to light)
- [ ] Navbar: transparent → `bg-dark/90` after 80px scroll
- [ ] Hero: typewriter animation plays on load
- [ ] Hero CTA "Începe Acum" scrolls to `#clase` with Lenis
- [ ] Stats: counters animate from 0 on scroll
- [ ] Class cards: stagger in with 0.1s delay, lift 8px on hover
- [ ] Trainer cards: 3D flip on hover reveals bio + certifications
- [ ] Pricing toggle: prices animate on billing switch, Pro highlighted
- [ ] Swiper autoplays with gold pagination dots
- [ ] Gallery: masonry layout, gold overlay on hover
- [ ] Contact form: required field validation works, toast fires
- [ ] Google Maps embed loads
- [ ] All 4 nav routes work
- [ ] Footer links navigate correctly
- [ ] Mobile hamburger opens/closes drawer
- [ ] Page transitions fade in/out

- [ ] **Step 19.4: Commit**

```bash
git add -A && git commit -m "feat: add README and verify production build passes"
```

---

## Self-Review

**Spec coverage:**
All 10 Home sections ✓ · 4 pages ✓ · Lenis global ✓ · GSAP ScrollTrigger reveals ✓ · GSAP TextPlugin Hero ✓ · GSAP parallax ✓ · Motion whileInView stagger ✓ · Motion flip trainer ✓ · Motion page transitions ✓ · Navbar scroll effect ✓ · react-countup ✓ · Swiper autoplay ✓ · EmailJS + toast ✓ · Google Maps ✓ · Zustand theme + pricing ✓ · TypeScript strict ✓ · Helmet SEO per page ✓ · .env.example ✓ · README ✓ · shadcn/ui installed ✓ · Lucide icons ✓

**Type consistency:** `useScrollAnimation<T>` generic used consistently across all components without casting. `GymClass['level']` union type used in both `ClassCard` levelColors map and `ClassesPage` Filter type.

**Filter logic clarification (Task 17):** When active filter is `"Începător"`, `"Intermediar"`, or `"Avansat"`, the Spinning class (level `"Toate nivelele"`) appears. When active filter is `"Toate nivelele"`, only Spinning appears.
