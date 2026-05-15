# FightClub Galați — Design Spec

**Data:** 2026-05-15
**Status:** Aprobat

---

## 1. Identitate & Brand

| Atribut | Valoare |
|---|---|
| Nume | FightClub Galați |
| Culoare primară | Auriu `#F5C518` |
| Culoare fundal | Negru `#0A0A0A` |
| Culoare suprafețe | `#111111` / `#1A1A1A` |
| Text principal | `#FFFFFF` |
| Text secundar | `#A0A0A0` |
| Tema default | Dark |
| Font | System UI stack (Tailwind default) |

---

## 2. Stack Tehnic

| Librărie | Versiune | Scop |
|---|---|---|
| React | 19 | UI framework |
| Vite | latest | Build tool |
| TypeScript | strict | Type safety |
| Tailwind CSS | v4 | Styling (CSS-first config) |
| Motion (framer-motion) | latest | Micro-animații React |
| GSAP + ScrollTrigger | latest | Macro-animații scroll |
| @studio-freight/lenis | latest | Smooth scroll global |
| React Router | v7 | Routing |
| Zustand | latest | State management |
| shadcn/ui | latest | Componente UI de bază |
| Lucide React | latest | Iconițe |
| Swiper | latest | Carusel testimoniale |
| react-countup | latest | Contoare animate stats |
| @emailjs/browser | latest | Formular contact |
| react-hot-toast | latest | Notificări |
| react-helmet-async | latest | SEO meta tags |

---

## 3. Structura Fișierelor

```
fightclub/
├── .env.example
├── .gitignore
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tailwind.config.ts
├── components.json             # shadcn/ui config
├── README.md
│
└── src/
    ├── main.tsx                # Lenis init + GSAP ticker sync + React mount
    ├── App.tsx                 # RouterProvider + HelmetProvider + Toaster
    │
    ├── index.css               # Tailwind v4 @theme tokens + global styles
    │
    ├── components/
    │   ├── sections/
    │   │   ├── HeroSection.tsx
    │   │   ├── StatsSection.tsx
    │   │   ├── ClassesSection.tsx
    │   │   ├── TrainersSection.tsx
    │   │   ├── PricingSection.tsx
    │   │   ├── TestimonialsSection.tsx
    │   │   ├── GallerySection.tsx
    │   │   └── ContactSection.tsx
    │   │
    │   └── ui/
    │       ├── Navbar.tsx
    │       ├── Footer.tsx
    │       ├── ClassCard.tsx
    │       ├── TrainerCard.tsx
    │       ├── PricingCard.tsx
    │       └── StarRating.tsx
    │
    ├── hooks/
    │   ├── useScrollAnimation.ts   # GSAP ScrollTrigger fade-in wrapper
    │   ├── useSmoothScroll.ts      # Lenis instance accessor
    │   └── useNavbarScroll.ts      # Navbar bg change on scroll
    │
    ├── pages/
    │   ├── HomePage.tsx            # Compune toate secțiunile în ordine
    │   ├── ClassesPage.tsx         # Grid + filtre nivel
    │   ├── TrainersPage.tsx        # Grid profiluri extinse
    │   └── ContactPage.tsx         # Formular + hartă standalone
    │
    ├── store/
    │   ├── useThemeStore.ts        # dark/light cu localStorage persist
    │   └── usePricingStore.ts      # monthly/annual billing toggle
    │
    ├── types/
    │   └── index.ts                # Toate interfețele TypeScript
    │
    └── data/
        ├── classes.ts              # 6 clase placeholder
        ├── trainers.ts             # 4 traineri placeholder
        ├── testimonials.ts         # 5 testimoniale placeholder
        └── gallery.ts              # 6 URL-uri Unsplash fitness
```

---

## 4. Routing

**Pattern:** Shared layout (Navbar + Footer) via React Router v7 `createBrowserRouter`.

```
/           → HomePage
/clase      → ClassesPage
/traineri   → TrainersPage
/contact    → ContactPage
```

- `App.tsx` renderizează `<Navbar />` + `<Outlet />` + `<Footer />`
- Motion `AnimatePresence` + `motion.div` pe fiecare pagină: `opacity 0→1`, 300ms
- Lenis resetează scroll la `y=0` la fiecare schimbare de rută via `useEffect` pe `location`

---

## 5. Secțiunile Home (în ordine)

### 5.1 Navbar
- **Stânga:** Logo `FC` (auriu, bold) + `FightClub Galați` text
- **Center:** Linkuri: Acasă · Clase · Traineri · Contact
- **Dreapta:** Buton `"Înscrie-te"` (auriu filled) + toggle dark/light (Lucide Sun/Moon)
- **Comportament scroll:** transparent la top → `bg-black/90 backdrop-blur-md shadow-lg` după 80px
- **Mobile:** hamburger icon → drawer animat cu Motion din dreapta

### 5.2 Hero
- **Background:** `<video autoPlay muted loop playsInline src={VITE_HERO_VIDEO_URL}>` cu `<img>` Unsplash ca fallback
- **Overlay:** `bg-black/60` absolut peste video
- **Text animat GSAP TextPlugin** (secvență):
  1. `"Forjează-ți"` (scriere typewriter)
  2. pauză 1s
  3. `"Limitele"` (scriere typewriter, culoare auriu)
  4. pauză 0.5s
  5. Subtitlu fade-in: `"Sala de fitness #1 din Galați"`
- **CTA buttons:**
  - `"Începe Acum"` — auriu filled, scroll programatic la `#clase` via Lenis
  - `"Vezi Clase"` — outline alb, link `/clase`
  - Ambele cu `whileHover: scale(1.05)` + `whileTap: scale(0.97)` (Motion)
- **Parallax:** GSAP ScrollTrigger pe background `y: 0 → -150px` la scroll

### 5.3 Stats
- 4 contoare: `500+ Membri` · `12 Traineri` · `30+ Clase` · `10 Ani Experiență`
- react-countup cu `enableScrollSpy: true`, `duration: 2.5`, `separator: "."`
- Layout: 4 coloane pe desktop, 2×2 pe mobil
- Fiecare stat are icon Lucide deasupra (auriu)

### 5.4 Clase & Programe
- 6 `<ClassCard />` în grid 3×2 (desktop) / 2×3 (tablet) / 1×6 (mobil)
- Card: imagine Unsplash (aspect-video), tag nivel (colored badge), titlu, orar, buton `"Detalii"`
- Motion `whileInView` cu stagger `delay: index * 0.1s` + `opacity + translateY(30px→0)`
- Motion `whileHover: y: -8px` pe card
- **Date:**
  - Box Thai · Intermediar · L/M/V 18:00-19:30
  - CrossFit · Avansat · M/J/S 07:00-08:30
  - Yoga · Începător · M/V 10:00-11:00
  - Spinning · Toate nivelele · L/M/J 19:00-20:00
  - MMA · Avansat · M/V 20:00-21:30
  - Kickbox · Intermediar · L/J 17:00-18:30

### 5.5 Traineri
- 4 `<TrainerCard />` în grid 2×2 (desktop) / 1×4 (mobil)
- **Flip 3D la hover:** față (foto + nume + specializare) → verso (bio scurt + social links)
- Motion `rotateY: 0→180deg`, `backface-visibility: hidden` pe față/verso
- Motion `whileInView` cu stagger pe grid
- **Date:**
  - Alexandru Ionescu · Box & MMA · foto placeholder
  - Maria Constantin · Yoga & Pilates · foto placeholder
  - Bogdan Radu · CrossFit & Strength · foto placeholder
  - Elena Popa · Spinning & Cardio · foto placeholder

### 5.6 Prețuri
- Toggle `Lunar / Anual` (Zustand `usePricingStore`) — anual = 20% reducere, badge `"Economisești 20%"`
- 3 `<PricingCard />`:
  - **Basic** · 99 RON/lună · Acces sală, vestiare, 2 clase/săpt
  - **Pro** · 159 RON/lună · *(highlighted auriu, badge "Cel mai popular")* · Acces nelimitat, toate clasele, 1 sesiune PT/lună
  - **Elite** · 249 RON/lună · Tot din Pro + nutriționist, acces 24/7, PT dedicat
- Prețuri animate cu Motion la toggle billing
- CTA per card: `"Alege Planul"`

### 5.7 Testimoniale
- Swiper: `autoplay: { delay: 3000 }`, `loop: true`, `slidesPerView: 3` (desktop) / `1` (mobil)
- Fiecare slide: avatar circular, nume, rol (ex: "Membru 2 ani"), `<StarRating rating={5} />`, text recenzie
- 5 testimoniale placeholder în română

### 5.8 Galerie
- CSS masonry grid 3 coloane, `gap: 1rem`
- 6 imagini Unsplash fitness (aspect ratios variate pentru efect masonry)
- Motion `whileHover: scale(1.03)` + overlay auriu semi-transparent la hover
- Lightbox: fără (out of scope)

### 5.9 Contact
- **Stânga:** formular cu câmpuri: Nume, Email, Telefon, Mesaj + buton `"Trimite Mesaj"`
  - EmailJS via `@emailjs/browser`
  - react-hot-toast: `"Mesaj trimis cu succes!"` (success) / `"Eroare la trimitere."` (error)
  - Validare: câmpuri required, email format
- **Dreapta:** Google Maps embed `Strada Saturn 34, 800647 Galați` + info (adresă, telefon placeholder, email placeholder, orar)
- Layout: 2 coloane pe desktop, stacked pe mobil

### 5.10 Footer
- **Rândul 1:** Logo + tagline `"Forjează-ți limitele la FightClub Galați"`
- **4 coloane:** Navigare (linkuri pagini) · Clase (6 clase) · Contact (adresă, tel, email) · Social (Facebook, Instagram, YouTube — Lucide icons)
- **Rândul final:** `© 2025 FightClub Galați. Toate drepturile rezervate.`
- Fundal `#0A0A0A`, separator auriu top border

---

## 6. Pagini Secundare

### ClassesPage (`/clase`)
- Hero mic cu titlu `"Clase & Programe"`
- Filtre: `All · Începător · Intermediar · Avansat` (butons toggle)
- Grid cu toate 6 clasele, filtrat cu Motion `AnimatePresence layout`
- State local `useState<string>` pentru filtrul activ

### TrainersPage (`/traineri`)
- Hero mic cu titlu `"Trainerii Noștri"`
- Grid 2×2 cu carduri extinse: foto mare, bio complet, specializări, certificări, social links
- Motion `whileInView` stagger

### ContactPage (`/contact`)
- Replica exactă a `ContactSection` dar ca pagină de sine stătătoare
- SEO: title + description specifice

---

## 7. Strategie Animații

### GSAP (macro)
- **Hero TextPlugin:** typewriter sequence la mount
- **Hero parallax:** ScrollTrigger `y: 0→-150px` pe `#hero-bg`
- **Section reveals:** `useScrollAnimation` hook aplică pe toate secțiunile `gsap.fromTo(el, { opacity:0, y:40 }, { opacity:1, y:0, duration:0.8 })` cu `trigger: start: "top 85%", once: true`

### Motion (micro)
- **Cards whileInView:** `opacity: 0→1, y: 30→0` cu `delay: index * 0.1`
- **Trainer flip:** `rotateY: 0→180` pe hover
- **Page transitions:** `opacity: 0→1` cu `duration: 0.3`
- **CTA buttons:** `whileHover: scale(1.05)`, `whileTap: scale(0.97)`
- **Navbar mobile drawer:** `x: "100%"→0` cu `AnimatePresence`

### Lenis
- Init în `main.tsx`: `new Lenis({ duration: 1.2, easing: easeInOutQuart })`
- GSAP ticker sync: `gsap.ticker.add((time) => lenis.raf(time * 1000))`
- `gsap.ticker.lagSmoothing(0)`
- `useSmoothScroll` returnează instanța pentru `lenis.scrollTo('#section-id')`

---

## 8. State Management

| Store | State | Acțiuni |
|---|---|---|
| `useThemeStore` | `theme: 'dark' \| 'light'` | `toggle()` — aplică `document.documentElement.classList` + persist localStorage |
| `usePricingStore` | `billing: 'monthly' \| 'annual'` | `toggle()` |

---

## 9. TypeScript Interfaces

```typescript
interface GymClass {
  id: string;
  title: string;
  level: 'Începător' | 'Intermediar' | 'Avansat' | 'Toate nivelele';
  schedule: string;
  image: string;
  description: string;
  category: string;
}

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  avatar: string;
  certifications: string[];
  socials: { instagram?: string; facebook?: string };
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
}

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

interface NavItem {
  label: string;
  href: string;
}
```

---

## 10. Configurație & Environment

### `.env.example`
```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_HERO_VIDEO_URL=https://example.com/hero-video.mp4
```

### Tailwind CSS v4 tokens (`src/index.css`)
```css
@import "tailwindcss";

@theme {
  --color-gold: #F5C518;
  --color-gold-dark: #D4A800;
  --color-dark: #0A0A0A;
  --color-surface: #111111;
  --color-surface-2: #1A1A1A;
}
```

### SEO per pagină
| Pagină | Title | Description |
|---|---|---|
| Home | FightClub Galați — Sala de Fitness #1 din Galați | Antrenează-te la FightClub Galați. Box, CrossFit, Yoga, MMA și mai mult. |
| Clase | Clase & Programe — FightClub Galați | Descoperă toate clasele noastre de fitness din Galați. |
| Traineri | Trainerii Noștri — FightClub Galați | Echipa de traineri certificați FightClub Galați. |
| Contact | Contact & Locație — FightClub Galați | Strada Saturn 34, Galați. Contactează-ne astăzi. |

---

## 11. Excluderi din Scope

- Autentificare / cont utilizator
- Sistem de rezervări online
- Plăți integrate
- Blog / articole
- Lightbox pentru galerie
- i18n (multilingv)
- Backend / API propriu

---

## 12. README Sections

1. Descriere proiect
2. Prerequisites (Node 20+, npm)
3. Instalare (`npm install`)
4. Configurare `.env` (copiere din `.env.example`)
5. Configurare EmailJS (pași detaliați)
6. Dev server (`npm run dev`)
7. Build producție (`npm run build`)
8. Structura fișierelor
