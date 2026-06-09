# FightClub Galați — Context pentru Claude

## Proiect
Site de prezentare pentru sala de fitness **FightClub Galați** (fightclubgalati.ro).
Owner: Narcisa Dorin. Antrenori reali: Narcisa Dorin + Ionuț (kinetoterapeut).

## Stack
- React 19 + Vite 5 + TypeScript + Tailwind CSS v4 (CSS-first `@theme {}`)
- Framer Motion v12, GSAP + ScrollTrigger, Lenis smooth scroll
- React Router v7 `createBrowserRouter` cu `basename: '/'`
- react-helmet-async pentru SEO per pagină

## Node
**IMPORTANT:** Node-ul de sistem e v16 (prea vechi). Folosește mereu:
```bash
export PATH="/usr/local/Cellar/node/26.0.0/bin:$PATH" && npx vite build
```
Sau pentru dev server:
```bash
export PATH="/usr/local/Cellar/node/26.0.0/bin:$PATH" && npx vite --host
```

## Culori (src/index.css @theme)
```
--color-gold: #C7843B
--color-gold-dark: #A8692A
--color-dark: #000101
--color-surface: #172531
--color-surface-2: #2C4657
--color-muted: #F3BD68
```

## Fonturi
Oswald (headings) + Inter (body) — Google Fonts în index.html

## Deploy
- Hosting: cPanel shared hosting la **fightclubgalati.ro**
- Build: `npx vite build` → conținut `dist/` se urcă în `public_html/`
- `mail()` este **dezactivat** pe server — formularul folosește `fsockopen` SMTP în `contact.php`
- PHP 8.3 disponibil

## Structură importantă
```
src/
  assets/         — Ionut.jpg, Narcisa.jpg, gma-app.png, logo.png
  data/
    classes.ts    — 11 clase reale GMA
    schedule.ts   — orar săptămânal real (Luni-Sâmbătă)
    trainers.ts   — Ionuț + Narcisa + 2 placeholder
  components/
    sections/     — HeroSection, ClassesSection, PricingSection, AppBannerSection etc.
    ui/           — Layout, Header, Footer, ClassCard, ScheduleGrid, CookieBanner
  pages/          — HomePage, ClassesPage, SchedulePage, TrainersPage, ContactPage
public/
  contact.php     — trimite email via fsockopen (fără mail())
  .htaccess       — HTTPS redirect + SPA fallback
  sitemap.xml
  robots.txt
```

## Decizii luate
- Paleta dark navy + amber gold (nu beige)
- ClassesSection pe homepage: 4 clase + buton "Mai multe clase"
- ScheduleGrid desktop: tabel compact (doar orele cu clase, fără goluri)
- AppBannerSection: anunț GMA app cu logo + linkuri reale App Store/Google Play
- PricingSection: 5 categorii reale din aplicația GMA
- Cookie banner GDPR apare după 1.5s, salvat în localStorage
- Favicon: logo alb FightClub (transparent background)
