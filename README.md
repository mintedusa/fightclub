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
