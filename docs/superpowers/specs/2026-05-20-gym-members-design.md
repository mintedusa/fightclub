# Gym Members App — Design Spec

**Data:** 2026-05-20
**Proiect:** Fight Club Galați — `gym-members/`
**Status:** Aprobat

---

## 1. Obiectiv

Aplicație web de management al membrilor pentru sala Fight Club Galați (~100–500 membri), cu două zone distincte:
- **Admin panel** — recepționer/proprietar gestionează membri, abonamente, clase, check-in
- **Portal membri** — membrul vede abonamentul, rezervă la clase, urmărește prezența

---

## 2. Stack tehnic

| Tehnologie | Rol |
|------------|-----|
| React 19 + Vite + TypeScript | Frontend |
| Supabase | Auth + bază de date + realtime (free tier) |
| TailwindCSS | Styling, branding consistent cu Fight Club |
| React Router v7 | Navigare SPA |
| Tanstack Query | Fetch/cache date din Supabase |

---

## 3. Structura proiectului

Aplicația trăiește în `gym-members/` ca proiect Vite independent față de site-ul de prezentare `fightclub/`.

```
gym-members/
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Members.tsx
│   │   │   ├── MemberDetail.tsx
│   │   │   ├── Subscriptions.tsx
│   │   │   ├── Classes.tsx
│   │   │   └── CheckIn.tsx
│   │   └── portal/
│   │       ├── Dashboard.tsx
│   │       ├── MySubscription.tsx
│   │       ├── Classes.tsx
│   │       ├── MyBookings.tsx
│   │       └── Profile.tsx
│   ├── components/
│   │   ├── layout/       # AdminLayout, PortalLayout, ProtectedRoute
│   │   └── ui/           # Button, Card, Badge, Table, Modal, etc.
│   ├── lib/
│   │   ├── supabase.ts   # client Supabase
│   │   └── utils.ts
│   └── hooks/
│       ├── useAuth.ts
│       ├── useMembers.ts
│       ├── useSubscriptions.ts
│       ├── useClasses.ts
│       └── useCheckIn.ts
├── index.html
├── package.json
├── vite.config.ts
└── .env.local           # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

---

## 4. Modelul de date (Supabase)

### `profiles`
Extinde `auth.users`. Creat automat via trigger la înregistrare.

| Coloană | Tip | Note |
|---------|-----|------|
| id | uuid PK | FK → auth.users.id |
| full_name | text | |
| phone | text | |
| email | text | |
| role | enum('admin','member') | default 'member' |
| avatar_url | text | nullable |
| created_at | timestamptz | |

### `subscription_plans`
Planuri disponibile (create de admin).

| Coloană | Tip | Note |
|---------|-----|------|
| id | uuid PK | |
| name | text | ex: "Lunar", "Trimestrial" |
| duration_days | int | ex: 30, 90 |
| price | numeric | RON |
| is_active | bool | default true |

### `subscriptions`
Abonamentul unui membru. Un singur abonament `active` per membru la un moment dat.

| Coloană | Tip | Note |
|---------|-----|------|
| id | uuid PK | |
| member_id | uuid | FK → profiles.id |
| plan_id | uuid | FK → subscription_plans.id |
| start_date | date | |
| end_date | date | calculat: start + duration_days |
| status | enum('active','expired','frozen') | |
| amount_paid | numeric | RON, poate diferi de plan.price |
| notes | text | nullable, note admin |
| created_at | timestamptz | |

### `classes`
Clase programate de admin.

| Coloană | Tip | Note |
|---------|-----|------|
| id | uuid PK | |
| name | text | ex: "CrossFit", "Yoga" |
| instructor | text | |
| datetime | timestamptz | data + ora clasei |
| capacity | int | locuri maxime |
| location | text | ex: "Sala 1" |
| is_cancelled | bool | default false |

### `bookings`
Rezervări ale membrilor la clase.

| Coloană | Tip | Note |
|---------|-----|------|
| id | uuid PK | |
| member_id | uuid | FK → profiles.id |
| class_id | uuid | FK → classes.id |
| status | enum('confirmed','cancelled','attended') | |
| created_at | timestamptz | |

**Constrângere:** un membru nu poate rezerva de două ori aceeași clasă.

### `checkins`
Prezență zilnică la sală (independentă de rezervări).

| Coloană | Tip | Note |
|---------|-----|------|
| id | uuid PK | |
| member_id | uuid | FK → profiles.id |
| checked_in_at | timestamptz | default now() |
| checked_in_by | uuid | FK → profiles.id (adminul), nullable |

---

## 5. Autentificare și roluri

### Flux login
```
/ (pagina de login)
  → email + parolă → Supabase Auth
  → citim profiles.role
  → role = 'admin'  → /admin/dashboard
  → role = 'member' → /portal/dashboard
```

### Creare conturi
- Adminul creează conturi pentru membri din panoul admin
- Supabase trimite email cu link de setare parolă (Supabase Invite)
- Nu există pagină de înregistrare publică
- Membrul își setează parola la prima logare

### Protecția rutelor
- `/admin/*` — acces dacă `role === 'admin'`, altfel redirect `/`
- `/portal/*` — acces dacă autentificat, altfel redirect `/`
- Un admin poate accesa și `/portal/*` pentru suport/demo

### Sesiune
- Supabase gestionează token-urile automat (refresh inclus)
- Sesiunea se restaurează din localStorage la refresh pagină

### Row Level Security (RLS) în Supabase
- `profiles`: membrul vede doar propriul profil; adminul vede toate
- `subscriptions`: membrul vede doar abonamentele sale; adminul vede toate
- `classes`: toți autentificații pot citi; adminul poate scrie
- `bookings`: membrul gestionează propriile rezervări; adminul vede toate
- `checkins`: membrul vede propriile check-in-uri; adminul poate crea și vedea toate

---

## 6. Pagini și funcționalități

### Admin Panel (`/admin/*`)

**Dashboard**
- Carduri: membri activi total, abonamente ce expiră în 7 zile, check-in-uri azi
- Tabel: membri cu abonament expirat recent (ultimele 7 zile)

**Membri** (`/admin/members`)
- Listă paginată cu search (nume, email, telefon) și filter (status abonament)
- Buton "Adaugă membru" → modal cu formular
- Acțiuni per rând: editează, dezactivează, vezi detalii

**Detaliu Membru** (`/admin/members/:id`)
- Info personal (editabil)
- Abonament curent (status, zile rămase, plan)
- Buton "Atribuie abonament" → selectezi planul, data start, suma plătită
- Istoric abonamente
- Istoric check-in-uri (ultimele 30)

**Abonamente** (`/admin/subscriptions`)
- Gestionează planurile disponibile (CRUD)
- Listă membri cu abonamente active + filtru "expiră curând"

**Clase** (`/admin/classes`)
- Listă clase programate (viitoare + trecute)
- Crează/editează clasă: nume, instructor, dată/oră, capacitate, locație
- Per clasă: câți au rezervat din capacitate, lista participanților

**Check-in** (`/admin/checkin`)
- Search rapid după nume sau email
- Click → marchează check-in instant
- Afișează statusul abonamentului membrului (activ/expirat/fără abonament)

### Portal Membri (`/portal/*`)

**Dashboard**
- Card abonament: plan, data expirare, zile rămase, status vizual (verde/galben/roșu)
- Următoarele clase rezervate (max 3)
- Ultimele 5 check-in-uri

**Abonamentul meu** (`/portal/subscription`)
- Detalii plan curent
- Istoric abonamente anterioare

**Clase** (`/portal/classes`)
- Grid clase disponibile (viitoare, necancellate)
- Filter după dată sau tip
- Per clasă: locuri disponibile, rezervă/anulează rezervare
- Nu se poate rezerva dacă abonamentul e expirat

**Rezervările mele** (`/portal/bookings`)
- Liste rezervări viitoare + trecute
- Anulează rezervare (doar dacă clasa e în viitor)

**Profil** (`/portal/profile`)
- Editează: nume, telefon, avatar
- Schimbă parola (via Supabase)

---

## 7. Considerații tehnice

- **Supabase free tier:** 500MB DB, 50.000 auth users, 2GB bandwidth — suficient pentru 100–500 membri
- **Deploy:** Vercel (free) sau Netlify — build static din Vite
- **Variabile de mediu:** `VITE_SUPABASE_URL` și `VITE_SUPABASE_ANON_KEY` în `.env.local`
- **Branding:** culorile și fonturile din site-ul Fight Club (roșu, negru, alb) refolosite via Tailwind config
- **Realtime:** Supabase Realtime poate fi activat pe `checkins` pentru a actualiza live dashboard-ul admin fără refresh

---

## 8. Out of scope (prima versiune)

- Notificări email automate la expirare abonament
- Plăți online integrate
- App mobil nativă
- QR code check-in (poate fi adăugat ulterior pe pagina de check-in admin)
- Rapoarte financiare avansate / export CSV
