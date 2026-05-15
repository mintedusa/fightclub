# Orar Clase — Design Spec

**Data:** 2026-05-15
**Status:** Aprobat

---

## 1. Obiectiv

Adăugarea unui orar săptămânal al claselor afișat ca tabel clasic (zile pe coloane, ore pe rânduri), cu clase colorate pe categorie. Apare atât ca secțiune pe Homepage cât și ca pagină dedicată `/orar`.

---

## 2. Date & Tipuri

### Tipuri noi în `src/types/index.ts`

```typescript
type DayKey = 'luni' | 'marti' | 'miercuri' | 'joi' | 'vineri' | 'sambata' | 'duminica';

interface ScheduleEntry {
  classId: string;   // corespunde GymClass.id
  day: DayKey;
  startTime: string; // format "HH:MM"
  endTime: string;   // format "HH:MM"
}
```

### Fișier nou `src/data/schedule.ts`

Conține:
1. Array `scheduleEntries: ScheduleEntry[]` cu toate intrările:

| Clasă | Zile | Orar |
|---|---|---|
| Box Thai (`box-thai`) | luni, marti, vineri | 18:00–19:30 |
| CrossFit (`crossfit`) | marti, joi, sambata | 07:00–08:30 |
| Yoga (`yoga`) | marti, vineri | 10:00–11:00 |
| Spinning (`spinning`) | luni, marti, joi | 19:00–20:00 |
| MMA (`mma`) | marti, vineri | 20:00–21:30 |
| Kickbox (`kickbox`) | luni, joi | 17:00–18:30 |

2. Map `categoryColors: Record<string, string>`:

| Categorie | Culoare | Hex |
|---|---|---|
| Lupte | Roșu | `#EF4444` |
| Cardio | Albastru | `#3B82F6` |
| Funcțional | Verde | `#22C55E` |
| Wellness | Mov | `#A855F7` |

---

## 3. Componenta Grilă

### `src/components/ui/ScheduleGrid.tsx`

Componentă shared, folosită atât în `ScheduleSection` cât și în `SchedulePage`.

**Structură CSS Grid:**
- 8 coloane: coloana 1 = etichete ore, coloanele 2–8 = L / M / Mi / J / V / S / D
- Interval timp: 07:00–22:00, câte 30 minute = 30 rânduri de timp
- Rândul 1 = header zile

**Poziționare blocuri clase:**
- `gridRowStart` calculat din `startTime` relativ la 07:00: `(ore * 2 + minute / 30) - (7 * 2) + 2`
- `gridRowSpan` = durata în sloturi de 30 min
- Fiecare bloc afișează: **numele clasei** (bold) + **interval orar** (mic)
- Culoare de fundal din `categoryColors[class.category]` cu opacitate 85%, text alb

**Coloana Duminică:**
- Overlay gri `bg-surface-2/80` cu text centrat "Închis" în `text-muted`

**Legendă:**
- Sub grilă: 4 pastile colorate cu numele categoriei

**Responsive — mobil:**
- Ascunde grila completă sub `md`
- Afișează tab-uri cu zilele săptămânii (L / M / Mi / J / V / S / D)
- La selecție zi: Motion `AnimatePresence` fade-in lista claselor din ziua respectivă ca carduri verticale
- Duminică: mesaj "Închis"

**Animații:**
- Blocuri clase: Motion `whileInView` cu `opacity: 0→1` + `scale: 0.95→1`, stagger `delay: index * 0.05s`
- Hover pe bloc: Motion `whileHover: scale(1.03)`, `transition: duration 0.15s`

---

## 4. Secțiune Homepage

### `src/components/sections/ScheduleSection.tsx`

- `useScrollAnimation` hook pentru reveal secțiune (GSAP fade + y: 40→0)
- Titlu: `"Orar Clase"`
- Subtitlu: `"Programul săptămânal al tuturor claselor noastre"`
- `<ScheduleGrid />`
- Buton link la final: `"Vezi orar complet →"` → `/orar` (stil outline auriu)

---

## 5. Pagina Dedicată

### `src/pages/SchedulePage.tsx`

- `pt-24` padding top (sub Navbar fix)
- Hero mic: titlu `"Orar Săptămânal"` + subtitlu
- `<ScheduleGrid />` la lățime maximă (`max-w-7xl mx-auto`)
- SEO Helmet: title `"Orar Clase — FightClub Galați"`, description `"Programul complet al claselor de fitness din Galați."`

---

## 6. Modificări Fișiere Existente

| Fișier | Modificare |
|---|---|
| `src/types/index.ts` | Adaugă `DayKey` și `ScheduleEntry` |
| `src/App.tsx` | Adaugă ruta `/orar → SchedulePage` |
| `src/pages/HomePage.tsx` | Inserează `<ScheduleSection />` după `<ClassesSection />` |
| `src/components/ui/Navbar.tsx` | Adaugă link `"Orar"` între Clase și Traineri |
| `src/components/ui/Footer.tsx` | Adaugă `"Orar"` în coloana Navigare cu link `/orar` |

---

## 7. Fișiere Noi

```
src/
├── data/
│   └── schedule.ts              # ScheduleEntry[] + categoryColors
├── components/
│   ├── ui/
│   │   └── ScheduleGrid.tsx     # Grila tabel shared
│   └── sections/
│       └── ScheduleSection.tsx  # Wrapper homepage
└── pages/
    └── SchedulePage.tsx         # Pagina /orar
```

---

## 8. Excluderi din Scope

- Filtrare după categorie/nivel în orar
- Editare dinamică a orarului (CMS)
- Rezervări din orar
- Export PDF/iCal
