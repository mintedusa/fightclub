# Gym Members App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full gym management web app for Fight Club Galați with an admin panel and member portal, backed by Supabase.

**Architecture:** Standalone Vite/React/TypeScript app in `gym-members/`, separate from the marketing site. Two zones — `/admin/*` (role-gated) and `/portal/*` (auth-gated) — with a shared Supabase backend for auth, data, and row-level security.

**Tech Stack:** React 19, Vite, TypeScript, TailwindCSS, React Router v7, Tanstack Query v5, Supabase JS v2, Vitest, React Testing Library

---

## File Map

```
gym-members/
├── src/
│   ├── types/index.ts              # all shared TS types
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client singleton
│   │   └── utils.ts                # date helpers, subscription status
│   ├── hooks/
│   │   ├── useAuth.ts              # session, profile, role
│   │   ├── useMembers.ts           # CRUD members
│   │   ├── useSubscriptions.ts     # CRUD subscriptions + plans
│   │   ├── useClasses.ts           # CRUD classes
│   │   ├── useBookings.ts          # member bookings
│   │   └── useCheckIn.ts           # create check-in
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx     # sidebar + header for admin
│   │   │   ├── PortalLayout.tsx    # top nav for member portal
│   │   │   └── ProtectedRoute.tsx  # role/auth guard
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Table.tsx
│   ├── pages/
│   │   ├── Login.tsx
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
│   ├── router.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── .env.local
```

---

## Task 1: Project Setup

**Files:**
- Create: `gym-members/package.json`
- Create: `gym-members/vite.config.ts`
- Create: `gym-members/tailwind.config.ts`
- Create: `gym-members/tsconfig.json`
- Create: `gym-members/index.html`
- Create: `gym-members/src/main.tsx`
- Create: `gym-members/.env.local`

- [ ] **Step 1: Scaffold Vite project**

```bash
cd /Users/filimoncristian/Sites/fightclub/gym-members
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @tanstack/react-query react-router-dom lucide-react
npm install -D tailwindcss @tailwindcss/vite vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Configure Vite**

Replace `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Step 4: Create test setup file**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Configure Tailwind**

Create `src/index.css`:

```css
@import "tailwindcss";
```

- [ ] **Step 6: Create `.env.local`**

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

*(Actual values come from Supabase project settings → API)*

- [ ] **Step 7: Verify dev server runs**

```bash
npm run dev
```

Expected: server starts at `http://localhost:5173`

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold gym-members Vite app"
```

---

## Task 2: Supabase Project + Schema

**Files:**
- SQL run in Supabase Dashboard SQL editor (no local files for migrations in this setup)
- Create: `gym-members/src/lib/supabase.ts`
- Create: `gym-members/src/types/index.ts`

- [ ] **Step 1: Create Supabase project**

Go to [supabase.com](https://supabase.com) → New project → name: `fightclub-gym` → free tier → region: EU (Frankfurt)

Copy `Project URL` and `anon public key` into `.env.local`.

- [ ] **Step 2: Run schema SQL**

In Supabase Dashboard → SQL Editor → run the following:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- profiles (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- trigger: create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- subscription_plans
create table subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  duration_days int not null,
  price numeric(10,2) not null,
  is_active bool not null default true
);

-- subscriptions
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references profiles(id) on delete cascade,
  plan_id uuid not null references subscription_plans(id),
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'expired', 'frozen')),
  amount_paid numeric(10,2) not null,
  notes text,
  created_at timestamptz not null default now()
);

-- classes
create table classes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  instructor text not null,
  datetime timestamptz not null,
  capacity int not null,
  location text not null default 'Sala 1',
  is_cancelled bool not null default false
);

-- bookings
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references profiles(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'attended')),
  created_at timestamptz not null default now(),
  unique(member_id, class_id)
);

-- checkins
create table checkins (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references profiles(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  checked_in_by uuid references profiles(id)
);
```

- [ ] **Step 3: Run RLS policies SQL**

```sql
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table subscription_plans enable row level security;
alter table classes enable row level security;
alter table bookings enable row level security;
alter table checkins enable row level security;

-- profiles: member sees own, admin sees all
create policy "profiles_select" on profiles for select
  using (auth.uid() = id or exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));
create policy "profiles_update_own" on profiles for update
  using (auth.uid() = id);
create policy "profiles_admin_all" on profiles for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- subscription_plans: all authenticated can read, only admin writes
create policy "plans_select" on subscription_plans for select using (auth.role() = 'authenticated');
create policy "plans_admin_write" on subscription_plans for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- subscriptions: member sees own, admin sees all
create policy "subscriptions_member_select" on subscriptions for select
  using (member_id = auth.uid() or exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));
create policy "subscriptions_admin_write" on subscriptions for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- classes: authenticated can read, admin writes
create policy "classes_select" on classes for select using (auth.role() = 'authenticated');
create policy "classes_admin_write" on classes for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- bookings: member manages own, admin reads all
create policy "bookings_member" on bookings for all
  using (member_id = auth.uid());
create policy "bookings_admin_select" on bookings for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- checkins: member reads own, admin full access
create policy "checkins_member_select" on checkins for select
  using (member_id = auth.uid());
create policy "checkins_admin_all" on checkins for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
```

- [ ] **Step 4: Create first admin user**

In Supabase Dashboard → Authentication → Users → Invite user → email: (your email)

Then in SQL Editor:
```sql
update profiles set role = 'admin', full_name = 'Admin Fight Club'
where email = 'your-email@example.com';
```

- [ ] **Step 5: Create Supabase client**

Create `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 6: Create shared types**

Create `src/types/index.ts`:

```ts
export type Role = 'admin' | 'member'
export type SubscriptionStatus = 'active' | 'expired' | 'frozen'
export type BookingStatus = 'confirmed' | 'cancelled' | 'attended'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  email: string
  role: Role
  avatar_url: string | null
  created_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  duration_days: number
  price: number
  is_active: boolean
}

export interface Subscription {
  id: string
  member_id: string
  plan_id: string
  start_date: string
  end_date: string
  status: SubscriptionStatus
  amount_paid: number
  notes: string | null
  created_at: string
  plan?: SubscriptionPlan
}

export interface Class {
  id: string
  name: string
  instructor: string
  datetime: string
  capacity: number
  location: string
  is_cancelled: boolean
  bookings_count?: number
}

export interface Booking {
  id: string
  member_id: string
  class_id: string
  status: BookingStatus
  created_at: string
  class?: Class
}

export interface CheckIn {
  id: string
  member_id: string
  checked_in_at: string
  checked_in_by: string | null
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/supabase.ts src/types/index.ts
git commit -m "feat: add Supabase client and shared types"
```

---

## Task 3: Utility Functions

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/lib/utils.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/utils.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getDaysRemaining, getSubscriptionStatusColor, formatDate } from './utils'

describe('getDaysRemaining', () => {
  it('returns positive number for future date', () => {
    const future = new Date()
    future.setDate(future.getDate() + 10)
    expect(getDaysRemaining(future.toISOString().split('T')[0])).toBe(10)
  })

  it('returns 0 for today', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(getDaysRemaining(today)).toBe(0)
  })

  it('returns negative for past date', () => {
    const past = new Date()
    past.setDate(past.getDate() - 5)
    expect(getDaysRemaining(past.toISOString().split('T')[0])).toBe(-5)
  })
})

describe('getSubscriptionStatusColor', () => {
  it('returns green for active with >7 days', () => {
    expect(getSubscriptionStatusColor('active', 15)).toBe('green')
  })

  it('returns yellow for active with <=7 days', () => {
    expect(getSubscriptionStatusColor('active', 5)).toBe('yellow')
  })

  it('returns red for expired status', () => {
    expect(getSubscriptionStatusColor('expired', 0)).toBe('red')
  })

  it('returns blue for frozen status', () => {
    expect(getSubscriptionStatusColor('frozen', 10)).toBe('blue')
  })
})

describe('formatDate', () => {
  it('formats ISO date to Romanian locale', () => {
    expect(formatDate('2026-05-20')).toBe('20 mai 2026')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test -- src/lib/utils.test.ts
```

Expected: FAIL — `Cannot find module './utils'`

- [ ] **Step 3: Implement utils**

Create `src/lib/utils.ts`:

```ts
import type { SubscriptionStatus } from '../types'

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getSubscriptionStatusColor(
  status: SubscriptionStatus,
  daysRemaining: number
): 'green' | 'yellow' | 'red' | 'blue' {
  if (status === 'expired') return 'red'
  if (status === 'frozen') return 'blue'
  return daysRemaining <= 7 ? 'yellow' : 'green'
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- src/lib/utils.test.ts
```

Expected: PASS — 7 tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.ts src/lib/utils.test.ts
git commit -m "feat: add utility functions with tests"
```

---

## Task 4: Auth Hook

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/hooks/useAuth.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/hooks/useAuth.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from './useAuth'

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))

describe('useAuth', () => {
  it('starts with loading true and no session', async () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.session).toBeNull()
    expect(result.current.profile).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- src/hooks/useAuth.test.ts
```

Expected: FAIL — `Cannot find module './useAuth'`

- [ ] **Step 3: Implement useAuth**

Create `src/hooks/useAuth.ts`:

```ts
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { session, profile, loading, signIn, signOut }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test -- src/hooks/useAuth.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAuth.ts src/hooks/useAuth.test.ts
git commit -m "feat: add useAuth hook with session and profile"
```

---

## Task 5: UI Primitives

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Table.tsx`
- Create: `src/components/ui/index.ts`

- [ ] **Step 1: Create Button**

Create `src/components/ui/Button.tsx`:

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: 'bg-red-600 hover:bg-red-700 text-white',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white',
  danger: 'bg-red-900 hover:bg-red-800 text-white',
  ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-300',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Create Card**

Create `src/components/ui/Card.tsx`:

```tsx
interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-6 ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Create Badge**

Create `src/components/ui/Badge.tsx`:

```tsx
interface BadgeProps {
  color: 'green' | 'yellow' | 'red' | 'blue' | 'zinc'
  children: React.ReactNode
}

const colors = {
  green: 'bg-green-900/40 text-green-400 border-green-800',
  yellow: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  red: 'bg-red-900/40 text-red-400 border-red-800',
  blue: 'bg-blue-900/40 text-blue-400 border-blue-800',
  zinc: 'bg-zinc-800 text-zinc-400 border-zinc-700',
}

export function Badge({ color, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Create Input**

Create `src/components/ui/Input.tsx`:

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 5: Create Modal**

Create `src/components/ui/Modal.tsx`:

```tsx
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className={`relative bg-zinc-900 border border-zinc-800 rounded-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create Table**

Create `src/components/ui/Table.tsx`:

```tsx
interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
}

export function Table<T>({ columns, data, emptyMessage = 'Nicio înregistrare.' }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-800/50">
            {columns.map(col => (
              <th key={col.key} className="text-left px-4 py-3 text-zinc-400 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-zinc-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-zinc-200">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 7: Create barrel export**

Create `src/components/ui/index.ts`:

```ts
export { Button } from './Button'
export { Card } from './Card'
export { Badge } from './Badge'
export { Input } from './Input'
export { Modal } from './Modal'
export { Table } from './Table'
```

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add UI primitive components"
```

---

## Task 6: Routing, Layouts, and Auth Context

**Files:**
- Create: `src/contexts/AuthContext.tsx`
- Create: `src/components/layout/ProtectedRoute.tsx`
- Create: `src/components/layout/AdminLayout.tsx`
- Create: `src/components/layout/PortalLayout.tsx`
- Create: `src/pages/Login.tsx`
- Create: `src/router.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create AuthContext**

Create `src/contexts/AuthContext.tsx`:

```tsx
import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'

type AuthContextValue = ReturnType<typeof useAuth>

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be inside AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Create ProtectedRoute**

Create `src/components/layout/ProtectedRoute.tsx`:

```tsx
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import type { Role } from '../../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Role
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-red-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) return <Navigate to="/" replace />
  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to={profile?.role === 'admin' ? '/admin' : '/portal'} replace />
  }

  return <>{children}</>
}
```

- [ ] **Step 3: Create AdminLayout**

Create `src/components/layout/AdminLayout.tsx`:

```tsx
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, Calendar, LogIn, LogOut } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/members', label: 'Membri', icon: Users },
  { to: '/admin/subscriptions', label: 'Abonamente', icon: CreditCard },
  { to: '/admin/classes', label: 'Clase', icon: Calendar },
  { to: '/admin/checkin', label: 'Check-in', icon: LogIn },
]

export function AdminLayout() {
  const { signOut, profile } = useAuthContext()

  return (
    <div className="min-h-screen bg-black flex">
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <span className="text-white font-bold text-lg tracking-tight">Fight Club</span>
          <span className="text-red-500 font-bold text-lg"> Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-600/20 text-red-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-500 mb-3">{profile?.full_name}</div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Deconectare
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Create PortalLayout**

Create `src/components/layout/PortalLayout.tsx`:

```tsx
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, CreditCard, Calendar, BookOpen, User, LogOut } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'

const navItems = [
  { to: '/portal', label: 'Acasă', icon: LayoutDashboard, end: true },
  { to: '/portal/subscription', label: 'Abonamentul meu', icon: CreditCard },
  { to: '/portal/classes', label: 'Clase', icon: Calendar },
  { to: '/portal/bookings', label: 'Rezervările mele', icon: BookOpen },
  { to: '/portal/profile', label: 'Profil', icon: User },
]

export function PortalLayout() {
  const { signOut, profile } = useAuthContext()

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="text-white font-bold text-lg tracking-tight">
          Fight Club <span className="text-red-500">Galați</span>
        </span>
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-red-600/20 text-red-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{label}</span>
            </NavLink>
          ))}
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </nav>
        <span className="text-xs text-zinc-500 hidden lg:block">{profile?.full_name}</span>
      </header>
      <main className="max-w-5xl mx-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Create Login page**

Create `src/pages/Login.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function Login() {
  const { signIn, session, profile, loading } = useAuthContext()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && session && profile) {
      navigate(profile.role === 'admin' ? '/admin' : '/portal', { replace: true })
    }
  }, [session, profile, loading, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    if (error) setError(error)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Fight Club <span className="text-red-500">Galați</span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">Intră în contul tău</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@exemplu.ro"
            required
          />
          <Input
            id="password"
            label="Parolă"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md px-3 py-2">{error}</p>}
          <Button type="submit" loading={submitting} className="w-full">
            Autentificare
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create router**

Create `src/router.tsx`:

```tsx
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { PortalLayout } from './components/layout/PortalLayout'
import { Login } from './pages/Login'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminMembers } from './pages/admin/Members'
import { AdminMemberDetail } from './pages/admin/MemberDetail'
import { AdminSubscriptions } from './pages/admin/Subscriptions'
import { AdminClasses } from './pages/admin/Classes'
import { AdminCheckIn } from './pages/admin/CheckIn'
import { PortalDashboard } from './pages/portal/Dashboard'
import { PortalMySubscription } from './pages/portal/MySubscription'
import { PortalClasses } from './pages/portal/Classes'
import { PortalMyBookings } from './pages/portal/MyBookings'
import { PortalProfile } from './pages/portal/Profile'

export const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  {
    path: '/admin',
    element: <ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'members', element: <AdminMembers /> },
      { path: 'members/:id', element: <AdminMemberDetail /> },
      { path: 'subscriptions', element: <AdminSubscriptions /> },
      { path: 'classes', element: <AdminClasses /> },
      { path: 'checkin', element: <AdminCheckIn /> },
    ],
  },
  {
    path: '/portal',
    element: <ProtectedRoute><PortalLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <PortalDashboard /> },
      { path: 'subscription', element: <PortalMySubscription /> },
      { path: 'classes', element: <PortalClasses /> },
      { path: 'bookings', element: <PortalMyBookings /> },
      { path: 'profile', element: <PortalProfile /> },
    ],
  },
])
```

- [ ] **Step 7: Update main.tsx**

Replace `src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { router } from './router'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
```

- [ ] **Step 8: Create placeholder page components** (so router doesn't crash before pages are built)

Create each file with a minimal placeholder. Run this in terminal:

```bash
mkdir -p src/pages/admin src/pages/portal

for page in Dashboard Members MemberDetail Subscriptions Classes CheckIn; do
  echo "export function Admin$page() { return <div className=\"text-white\">Admin $page</div> }" > src/pages/admin/$page.tsx
done

for page in Dashboard MySubscription Classes MyBookings Profile; do
  echo "export function Portal$page() { return <div className=\"text-white\">Portal $page</div> }" > src/pages/portal/$page.tsx
done
```

- [ ] **Step 9: Verify app builds and routes work**

```bash
npm run dev
```

Open `http://localhost:5173` — you should see the login page. Logging in as admin should redirect to `/admin`, as member to `/portal`.

- [ ] **Step 10: Commit**

```bash
git add src/
git commit -m "feat: add auth context, routing, layouts, and login page"
```

---

## Task 7: Data Hooks

**Files:**
- Create: `src/hooks/useMembers.ts`
- Create: `src/hooks/useSubscriptions.ts`
- Create: `src/hooks/useClasses.ts`
- Create: `src/hooks/useBookings.ts`
- Create: `src/hooks/useCheckIn.ts`

- [ ] **Step 1: Create useMembers**

Create `src/hooks/useMembers.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export function useMembers(search?: string) {
  return useQuery({
    queryKey: ['members', search],
    queryFn: async () => {
      let q = supabase.from('profiles').select('*').eq('role', 'member').order('full_name')
      if (search) q = q.ilike('full_name', `%${search}%`)
      const { data, error } = await q
      if (error) throw error
      return data as Profile[]
    },
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['member', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
      if (error) throw error
      return data as Profile
    },
  })
}

export function useCreateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { email: string; full_name: string; phone?: string }) => {
      const { error } = await supabase.auth.admin.inviteUserByEmail(data.email, {
        data: { full_name: data.full_name },
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  })
}

export function useUpdateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      const { error } = await supabase.from('profiles').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['members'] })
      qc.invalidateQueries({ queryKey: ['member', id] })
    },
  })
}
```

- [ ] **Step 2: Create useSubscriptions**

Create `src/hooks/useSubscriptions.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Subscription, SubscriptionPlan } from '../types'

export function useMemberSubscription(memberId: string) {
  return useQuery({
    queryKey: ['subscription', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('member_id', memberId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as (Subscription & { plan: SubscriptionPlan }) | null
    },
  })
}

export function useMemberSubscriptionHistory(memberId: string) {
  return useQuery({
    queryKey: ['subscriptions', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as (Subscription & { plan: SubscriptionPlan })[]
    },
  })
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price')
      if (error) throw error
      return data as SubscriptionPlan[]
    },
  })
}

export function useAllPlans() {
  return useQuery({
    queryKey: ['plans', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subscription_plans').select('*').order('price')
      if (error) throw error
      return data as SubscriptionPlan[]
    },
  })
}

export function useAssignSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      member_id: string
      plan_id: string
      start_date: string
      end_date: string
      amount_paid: number
      notes?: string
    }) => {
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('member_id', data.member_id)
        .eq('status', 'active')

      const { error } = await supabase.from('subscriptions').insert({ ...data, status: 'active' })
      if (error) throw error
    },
    onSuccess: (_d, { member_id }) => {
      qc.invalidateQueries({ queryKey: ['subscription', member_id] })
      qc.invalidateQueries({ queryKey: ['subscriptions', member_id] })
    },
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<SubscriptionPlan, 'id'>) => {
      const { error } = await supabase.from('subscription_plans').insert(data)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SubscriptionPlan> & { id: string }) => {
      const { error } = await supabase.from('subscription_plans').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  })
}
```

- [ ] **Step 3: Create useClasses**

Create `src/hooks/useClasses.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Class } from '../types'

export function useUpcomingClasses() {
  return useQuery({
    queryKey: ['classes', 'upcoming'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*, bookings_count:bookings(count)')
        .gte('datetime', new Date().toISOString())
        .eq('is_cancelled', false)
        .order('datetime')
      if (error) throw error
      return (data ?? []).map(c => ({
        ...c,
        bookings_count: (c.bookings_count as unknown as { count: number }[])[0]?.count ?? 0,
      })) as Class[]
    },
  })
}

export function useAllClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*, bookings_count:bookings(count)')
        .order('datetime', { ascending: false })
      if (error) throw error
      return (data ?? []).map(c => ({
        ...c,
        bookings_count: (c.bookings_count as unknown as { count: number }[])[0]?.count ?? 0,
      })) as Class[]
    },
  })
}

export function useCreateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Class, 'id' | 'is_cancelled' | 'bookings_count'>) => {
      const { error } = await supabase.from('classes').insert({ ...data, is_cancelled: false })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  })
}

export function useUpdateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Class> & { id: string }) => {
      const { error } = await supabase.from('classes').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
  })
}
```

- [ ] **Step 4: Create useBookings**

Create `src/hooks/useBookings.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Booking } from '../types'

export function useMyBookings(memberId: string) {
  return useQuery({
    queryKey: ['bookings', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, class:classes(*)')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Booking[]
    },
  })
}

export function useClassBookings(classId: string) {
  return useQuery({
    queryKey: ['bookings', 'class', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, member:profiles(*)')
        .eq('class_id', classId)
        .neq('status', 'cancelled')
      if (error) throw error
      return data
    },
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ member_id, class_id }: { member_id: string; class_id: string }) => {
      const { error } = await supabase
        .from('bookings')
        .insert({ member_id, class_id, status: 'confirmed' })
      if (error) throw error
    },
    onSuccess: (_d, { member_id }) => qc.invalidateQueries({ queryKey: ['bookings', member_id] }),
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ bookingId, memberId }: { bookingId: string; memberId: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
      if (error) throw error
      return memberId
    },
    onSuccess: (_d, { memberId }) => qc.invalidateQueries({ queryKey: ['bookings', memberId] }),
  })
}
```

- [ ] **Step 5: Create useCheckIn**

Create `src/hooks/useCheckIn.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { CheckIn } from '../types'

export function useTodayCheckIns() {
  const today = new Date().toISOString().split('T')[0]
  return useQuery({
    queryKey: ['checkins', 'today'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkins')
        .select('*, member:profiles(full_name, email)')
        .gte('checked_in_at', `${today}T00:00:00`)
        .order('checked_in_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useMemberCheckIns(memberId: string, limit = 30) {
  return useQuery({
    queryKey: ['checkins', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('member_id', memberId)
        .order('checked_in_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data as CheckIn[]
    },
  })
}

export function useCreateCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ member_id, checked_in_by }: { member_id: string; checked_in_by: string }) => {
      const { error } = await supabase.from('checkins').insert({ member_id, checked_in_by })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checkins'] }),
  })
}
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/
git commit -m "feat: add data hooks for members, subscriptions, classes, bookings, check-ins"
```

---

## Task 8: Admin Dashboard

**Files:**
- Modify: `src/pages/admin/Dashboard.tsx`

- [ ] **Step 1: Create admin stats query**

Add `src/hooks/useAdminStats.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [activeCount, expiringCount, todayCheckIns] = await Promise.all([
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true })
          .eq('status', 'active').lte('end_date', in7Days),
        supabase.from('checkins').select('id', { count: 'exact', head: true })
          .gte('checked_in_at', `${today}T00:00:00`),
      ])

      return {
        activeMembers: activeCount.count ?? 0,
        expiringCount: expiringCount.count ?? 0,
        todayCheckIns: todayCheckIns.count ?? 0,
      }
    },
  })
}

export function useExpiringSubscriptions() {
  return useQuery({
    queryKey: ['expiring-subscriptions'],
    queryFn: async () => {
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, member:profiles(full_name, email), plan:subscription_plans(name)')
        .eq('status', 'active')
        .lte('end_date', in7Days)
        .order('end_date')
      if (error) throw error
      return data
    },
  })
}
```

- [ ] **Step 2: Implement AdminDashboard page**

Replace `src/pages/admin/Dashboard.tsx`:

```tsx
import { Users, Clock, LogIn } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { useAdminStats, useExpiringSubscriptions } from '../../hooks/useAdminStats'
import { getDaysRemaining, formatDate } from '../../lib/utils'

export function AdminDashboard() {
  const { data: stats } = useAdminStats()
  const { data: expiring } = useExpiringSubscriptions()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-900/30 rounded-lg"><Users className="h-6 w-6 text-green-400" /></div>
            <div>
              <p className="text-3xl font-bold text-white">{stats?.activeMembers ?? '—'}</p>
              <p className="text-sm text-zinc-400">Membri activi</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-900/30 rounded-lg"><Clock className="h-6 w-6 text-yellow-400" /></div>
            <div>
              <p className="text-3xl font-bold text-white">{stats?.expiringCount ?? '—'}</p>
              <p className="text-sm text-zinc-400">Expiră în 7 zile</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-lg"><LogIn className="h-6 w-6 text-blue-400" /></div>
            <div>
              <p className="text-3xl font-bold text-white">{stats?.todayCheckIns ?? '—'}</p>
              <p className="text-sm text-zinc-400">Check-in-uri azi</p>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Abonamente ce expiră în 7 zile</h2>
        <Table
          data={expiring ?? []}
          emptyMessage="Niciun abonament nu expiră în 7 zile."
          columns={[
            { key: 'name', header: 'Membru', render: r => <span className="font-medium">{r.member.full_name}</span> },
            { key: 'plan', header: 'Plan', render: r => r.plan.name },
            { key: 'end_date', header: 'Expiră', render: r => formatDate(r.end_date) },
            {
              key: 'days', header: 'Zile rămase', render: r => {
                const days = getDaysRemaining(r.end_date)
                return <Badge color={days <= 3 ? 'red' : 'yellow'}>{days} zile</Badge>
              }
            },
          ]}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/Dashboard.tsx src/hooks/useAdminStats.ts
git commit -m "feat: admin dashboard with stats and expiring subscriptions"
```

---

## Task 9: Admin Members Page

**Files:**
- Modify: `src/pages/admin/Members.tsx`
- Modify: `src/pages/admin/MemberDetail.tsx`

- [ ] **Step 1: Implement Members list**

Replace `src/pages/admin/Members.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { Button, Card, Input, Modal, Table } from '../../components/ui'
import { useMembers, useCreateMember } from '../../hooks/useMembers'

export function AdminMembers() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const { data: members, isLoading } = useMembers(search)
  const createMember = useCreateMember()

  const [form, setForm] = useState({ email: '', full_name: '', phone: '' })
  const [formError, setFormError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    try {
      await createMember.mutateAsync(form)
      setOpen(false)
      setForm({ email: '', full_name: '', phone: '' })
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Eroare la creare.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Membri</h1>
        <Button onClick={() => setOpen(true)}>
          <UserPlus className="h-4 w-4" /> Adaugă membru
        </Button>
      </div>

      <Input
        placeholder="Caută după nume, email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {isLoading ? (
        <p className="text-zinc-500 text-sm">Se încarcă...</p>
      ) : (
        <Table
          data={members ?? []}
          emptyMessage="Niciun membru găsit."
          columns={[
            { key: 'name', header: 'Nume', render: m => <span className="font-medium">{m.full_name}</span> },
            { key: 'email', header: 'Email', render: m => <span className="text-zinc-400">{m.email}</span> },
            { key: 'phone', header: 'Telefon', render: m => m.phone ?? '—' },
            {
              key: 'actions', header: '', render: m => (
                <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/members/${m.id}`)}>
                  Detalii →
                </Button>
              ),
            },
          ]}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Adaugă membru nou">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nume complet" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Telefon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          {formError && <p className="text-sm text-red-400">{formError}</p>}
          <p className="text-xs text-zinc-500">Membrul va primi un email cu link pentru setarea parolei.</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Anulează</Button>
            <Button type="submit" loading={createMember.isPending}>Trimite invitație</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: Implement MemberDetail page**

Replace `src/pages/admin/MemberDetail.tsx`:

```tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button, Card, Badge, Modal, Input } from '../../components/ui'
import { useMember, useUpdateMember } from '../../hooks/useMembers'
import { useMemberSubscription, useMemberSubscriptionHistory, useSubscriptionPlans, useAssignSubscription } from '../../hooks/useSubscriptions'
import { useMemberCheckIns } from '../../hooks/useCheckIn'
import { getDaysRemaining, getSubscriptionStatusColor, formatDate } from '../../lib/utils'

export function AdminMemberDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: member } = useMember(id!)
  const { data: activeSub } = useMemberSubscription(id!)
  const { data: subHistory } = useMemberSubscriptionHistory(id!)
  const { data: checkIns } = useMemberCheckIns(id!)
  const { data: plans } = useSubscriptionPlans()
  const assignSub = useAssignSubscription()
  const updateMember = useUpdateMember()

  const [subModal, setSubModal] = useState(false)
  const [subForm, setSubForm] = useState({ plan_id: '', start_date: new Date().toISOString().split('T')[0], amount_paid: '' })
  const [subError, setSubError] = useState<string | null>(null)

  async function handleAssignSub(e: React.FormEvent) {
    e.preventDefault()
    setSubError(null)
    const plan = plans?.find(p => p.id === subForm.plan_id)
    if (!plan) return
    const start = new Date(subForm.start_date)
    const end = new Date(start)
    end.setDate(end.getDate() + plan.duration_days)

    try {
      await assignSub.mutateAsync({
        member_id: id!,
        plan_id: subForm.plan_id,
        start_date: subForm.start_date,
        end_date: end.toISOString().split('T')[0],
        amount_paid: parseFloat(subForm.amount_paid),
      })
      setSubModal(false)
    } catch (err: unknown) {
      setSubError(err instanceof Error ? err.message : 'Eroare.')
    }
  }

  if (!member) return <div className="text-zinc-500">Se încarcă...</div>

  const daysRemaining = activeSub ? getDaysRemaining(activeSub.end_date) : null
  const color = activeSub ? getSubscriptionStatusColor(activeSub.status, daysRemaining!) : 'red'

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/members')} className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Înapoi la membri
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{member.full_name}</h1>
          <p className="text-zinc-400 text-sm">{member.email} · {member.phone ?? 'fără telefon'}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setSubModal(true)}>
          Atribuie abonament
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Abonament curent</h2>
          {activeSub ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{activeSub.plan.name}</span>
                <Badge color={color}>{daysRemaining} zile rămase</Badge>
              </div>
              <p className="text-sm text-zinc-400">Expiră: {formatDate(activeSub.end_date)}</p>
              <p className="text-sm text-zinc-400">Plătit: {activeSub.amount_paid} RON</p>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">Niciun abonament activ.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Ultimele check-in-uri</h2>
          {checkIns?.length ? (
            <ul className="space-y-2">
              {checkIns.slice(0, 8).map(c => (
                <li key={c.id} className="text-sm text-zinc-300">
                  {new Date(c.checked_in_at).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' })}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500 text-sm">Nicio prezență înregistrată.</p>
          )}
        </Card>
      </div>

      {subHistory && subHistory.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Istoric abonamente</h2>
          <ul className="space-y-3">
            {subHistory.map(s => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{s.plan.name}</span>
                <span className="text-zinc-500">{formatDate(s.start_date)} → {formatDate(s.end_date)}</span>
                <Badge color={s.status === 'active' ? 'green' : s.status === 'expired' ? 'red' : 'blue'}>
                  {s.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal open={subModal} onClose={() => setSubModal(false)} title="Atribuie abonament">
        <form onSubmit={handleAssignSub} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-1.5">Plan</label>
            <select
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              value={subForm.plan_id}
              onChange={e => setSubForm(f => ({ ...f, plan_id: e.target.value }))}
              required
            >
              <option value="">Selectează planul</option>
              {plans?.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.price} RON / {p.duration_days} zile</option>
              ))}
            </select>
          </div>
          <Input label="Data început" type="date" value={subForm.start_date} onChange={e => setSubForm(f => ({ ...f, start_date: e.target.value }))} required />
          <Input label="Sumă plătită (RON)" type="number" step="0.01" value={subForm.amount_paid} onChange={e => setSubForm(f => ({ ...f, amount_paid: e.target.value }))} required />
          {subError && <p className="text-sm text-red-400">{subError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setSubModal(false)}>Anulează</Button>
            <Button type="submit" loading={assignSub.isPending}>Salvează</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/Members.tsx src/pages/admin/MemberDetail.tsx
git commit -m "feat: admin members list and member detail with subscription assignment"
```

---

## Task 10: Admin Subscriptions, Classes, Check-in

**Files:**
- Modify: `src/pages/admin/Subscriptions.tsx`
- Modify: `src/pages/admin/Classes.tsx`
- Modify: `src/pages/admin/CheckIn.tsx`

- [ ] **Step 1: Implement Subscriptions page**

Replace `src/pages/admin/Subscriptions.tsx`:

```tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Card, Badge, Modal, Input } from '../../components/ui'
import { useAllPlans, useCreatePlan, useUpdatePlan } from '../../hooks/useSubscriptions'
import type { SubscriptionPlan } from '../../types'

export function AdminSubscriptions() {
  const { data: plans } = useAllPlans()
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null)
  const [form, setForm] = useState({ name: '', duration_days: '', price: '' })

  function openEdit(plan: SubscriptionPlan) {
    setEditing(plan)
    setForm({ name: plan.name, duration_days: String(plan.duration_days), price: String(plan.price) })
    setOpen(true)
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: '', duration_days: '', price: '' })
    setOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const data = { name: form.name, duration_days: parseInt(form.duration_days), price: parseFloat(form.price), is_active: true }
    if (editing) await updatePlan.mutateAsync({ id: editing.id, ...data })
    else await createPlan.mutateAsync(data)
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Planuri de abonament</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Plan nou</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans?.map(plan => (
          <Card key={plan.id}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-white text-lg">{plan.name}</h3>
              <Badge color={plan.is_active ? 'green' : 'zinc'}>{plan.is_active ? 'activ' : 'inactiv'}</Badge>
            </div>
            <p className="text-3xl font-bold text-white">{plan.price} <span className="text-sm text-zinc-400 font-normal">RON</span></p>
            <p className="text-sm text-zinc-400 mt-1">{plan.duration_days} zile</p>
            <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={() => openEdit(plan)}>Editează</Button>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editează plan' : 'Plan nou'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nume plan" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Durată (zile)" type="number" value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: e.target.value }))} required />
          <Input label="Preț (RON)" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Anulează</Button>
            <Button type="submit" loading={createPlan.isPending || updatePlan.isPending}>Salvează</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: Implement Classes page**

Replace `src/pages/admin/Classes.tsx`:

```tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Badge, Modal, Input, Table } from '../../components/ui'
import { useAllClasses, useCreateClass, useUpdateClass } from '../../hooks/useClasses'
import type { Class } from '../../types'

export function AdminClasses() {
  const { data: classes } = useAllClasses()
  const createClass = useCreateClass()
  const updateClass = useUpdateClass()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Class | null>(null)
  const [form, setForm] = useState({ name: '', instructor: '', datetime: '', capacity: '', location: 'Sala 1' })

  function openCreate() {
    setEditing(null)
    setForm({ name: '', instructor: '', datetime: '', capacity: '', location: 'Sala 1' })
    setOpen(true)
  }

  function openEdit(cls: Class) {
    setEditing(cls)
    setForm({
      name: cls.name,
      instructor: cls.instructor,
      datetime: cls.datetime.slice(0, 16),
      capacity: String(cls.capacity),
      location: cls.location,
    })
    setOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const data = { name: form.name, instructor: form.instructor, datetime: new Date(form.datetime).toISOString(), capacity: parseInt(form.capacity), location: form.location }
    if (editing) await updateClass.mutateAsync({ id: editing.id, ...data })
    else await createClass.mutateAsync(data)
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clase</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Clasă nouă</Button>
      </div>

      <Table
        data={classes ?? []}
        emptyMessage="Nicio clasă programată."
        columns={[
          { key: 'name', header: 'Clasă', render: c => <span className="font-medium">{c.name}</span> },
          { key: 'instructor', header: 'Instructor', render: c => c.instructor },
          { key: 'datetime', header: 'Data/Ora', render: c => new Date(c.datetime).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' }) },
          { key: 'capacity', header: 'Locuri', render: c => `${c.bookings_count ?? 0} / ${c.capacity}` },
          { key: 'location', header: 'Locație', render: c => c.location },
          {
            key: 'status', header: 'Status', render: c => c.is_cancelled
              ? <Badge color="red">Anulată</Badge>
              : <Badge color="green">Activă</Badge>
          },
          {
            key: 'actions', header: '', render: c => (
              <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Editează</Button>
            )
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editează clasa' : 'Clasă nouă'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Tip clasă" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="CrossFit, Yoga..." required />
          <Input label="Instructor" value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} required />
          <Input label="Data și ora" type="datetime-local" value={form.datetime} onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))} required />
          <Input label="Capacitate maximă" type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required />
          <Input label="Locație" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
          {editing && (
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input type="checkbox" className="accent-red-600" checked={(editing as Class).is_cancelled} onChange={e => setEditing(prev => prev ? { ...prev, is_cancelled: e.target.checked } : null)} />
              Marchează ca anulată
            </label>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Anulează</Button>
            <Button type="submit" loading={createClass.isPending || updateClass.isPending}>Salvează</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 3: Implement CheckIn page**

Replace `src/pages/admin/CheckIn.tsx`:

```tsx
import { useState } from 'react'
import { Search, CheckCircle } from 'lucide-react'
import { Card, Badge, Button, Input } from '../../components/ui'
import { useMembers } from '../../hooks/useMembers'
import { useMemberSubscription } from '../../hooks/useSubscriptions'
import { useCreateCheckIn, useTodayCheckIns } from '../../hooks/useCheckIn'
import { useAuthContext } from '../../contexts/AuthContext'
import { getDaysRemaining, getSubscriptionStatusColor } from '../../lib/utils'
import type { Profile } from '../../types'

function MemberCheckInCard({ member, adminId }: { member: Profile; adminId: string }) {
  const { data: sub } = useMemberSubscription(member.id)
  const checkIn = useCreateCheckIn()
  const [done, setDone] = useState(false)

  const days = sub ? getDaysRemaining(sub.end_date) : null
  const color = sub ? getSubscriptionStatusColor(sub.status, days!) : 'red'

  async function handleCheckIn() {
    await checkIn.mutateAsync({ member_id: member.id, checked_in_by: adminId })
    setDone(true)
  }

  return (
    <Card className="flex items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-white">{member.full_name}</p>
        <p className="text-sm text-zinc-400">{member.email}</p>
        <div className="mt-1">
          {sub ? (
            <Badge color={color}>{sub.plan?.name} · {days} zile rămase</Badge>
          ) : (
            <Badge color="red">Fără abonament activ</Badge>
          )}
        </div>
      </div>
      {done ? (
        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
          <CheckCircle className="h-5 w-5" /> Check-in OK
        </div>
      ) : (
        <Button onClick={handleCheckIn} loading={checkIn.isPending} disabled={!sub}>
          Check-in
        </Button>
      )}
    </Card>
  )
}

export function AdminCheckIn() {
  const { profile } = useAuthContext()
  const [search, setSearch] = useState('')
  const { data: members } = useMembers(search)
  const { data: todayCheckIns } = useTodayCheckIns()

  const results = search.trim().length >= 2 ? members ?? [] : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Check-in</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md pl-10 pr-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Caută după nume sau email (minim 2 caractere)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map(m => (
            <MemberCheckInCard key={m.id} member={m} adminId={profile!.id} />
          ))}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Check-in-uri azi ({todayCheckIns?.length ?? 0})</h2>
        <div className="space-y-2">
          {todayCheckIns?.map(c => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm">
              <span className="text-white font-medium">{c.member?.full_name}</span>
              <span className="text-zinc-400">{new Date(c.checked_in_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
          {todayCheckIns?.length === 0 && <p className="text-zinc-500 text-sm">Nicio intrare înregistrată azi.</p>}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/
git commit -m "feat: admin subscriptions, classes, and check-in pages"
```

---

## Task 11: Member Portal Pages

**Files:**
- Modify: `src/pages/portal/Dashboard.tsx`
- Modify: `src/pages/portal/MySubscription.tsx`
- Modify: `src/pages/portal/Classes.tsx`
- Modify: `src/pages/portal/MyBookings.tsx`
- Modify: `src/pages/portal/Profile.tsx`

- [ ] **Step 1: Portal Dashboard**

Replace `src/pages/portal/Dashboard.tsx`:

```tsx
import { useAuthContext } from '../../contexts/AuthContext'
import { useMemberSubscription } from '../../hooks/useSubscriptions'
import { useMyBookings } from '../../hooks/useBookings'
import { useMemberCheckIns } from '../../hooks/useCheckIn'
import { Card, Badge } from '../../components/ui'
import { getDaysRemaining, getSubscriptionStatusColor, formatDate } from '../../lib/utils'

export function PortalDashboard() {
  const { profile } = useAuthContext()
  const { data: sub } = useMemberSubscription(profile!.id)
  const { data: bookings } = useMyBookings(profile!.id)
  const { data: checkIns } = useMemberCheckIns(profile!.id, 5)

  const days = sub ? getDaysRemaining(sub.end_date) : null
  const color = sub ? getSubscriptionStatusColor(sub.status, days!) : 'red'

  const upcomingBookings = bookings?.filter(b =>
    b.status === 'confirmed' && b.class && new Date(b.class.datetime) > new Date()
  ).slice(0, 3)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Bună, {profile?.full_name.split(' ')[0]}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Abonamentul meu</h2>
          {sub ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">{sub.plan.name}</span>
                <Badge color={color}>{days! > 0 ? `${days} zile rămase` : 'Expirat'}</Badge>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.max(0, Math.min(100, (days! / sub.plan.duration_days) * 100))}%` }}
                />
              </div>
              <p className="text-sm text-zinc-400">Expiră pe {formatDate(sub.end_date)}</p>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">Niciun abonament activ. Contactează recepția.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Clase rezervate</h2>
          {upcomingBookings?.length ? (
            <ul className="space-y-3">
              {upcomingBookings.map(b => (
                <li key={b.id} className="flex items-center justify-between text-sm">
                  <span className="text-white font-medium">{b.class?.name}</span>
                  <span className="text-zinc-400">{new Date(b.class!.datetime).toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short' })}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500 text-sm">Nicio clasă rezervată.</p>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Ultimele prezențe</h2>
        {checkIns?.length ? (
          <ul className="space-y-2">
            {checkIns.map(c => (
              <li key={c.id} className="text-sm text-zinc-300">
                {new Date(c.checked_in_at).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' })}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-500 text-sm">Nicio prezență înregistrată.</p>
        )}
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Portal MySubscription**

Replace `src/pages/portal/MySubscription.tsx`:

```tsx
import { useAuthContext } from '../../contexts/AuthContext'
import { useMemberSubscription, useMemberSubscriptionHistory } from '../../hooks/useSubscriptions'
import { Card, Badge } from '../../components/ui'
import { getDaysRemaining, getSubscriptionStatusColor, formatDate } from '../../lib/utils'

export function PortalMySubscription() {
  const { profile } = useAuthContext()
  const { data: sub } = useMemberSubscription(profile!.id)
  const { data: history } = useMemberSubscriptionHistory(profile!.id)

  const days = sub ? getDaysRemaining(sub.end_date) : null
  const color = sub ? getSubscriptionStatusColor(sub.status, days!) : 'red'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Abonamentul meu</h1>

      <Card>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6">Abonament curent</h2>
        {sub ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">{sub.plan.name}</span>
              <Badge color={color}>{days! > 0 ? `${days} zile rămase` : 'Expirat'}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Data start</p>
                <p className="text-white">{formatDate(sub.start_date)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Data expirare</p>
                <p className="text-white">{formatDate(sub.end_date)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Durată plan</p>
                <p className="text-white">{sub.plan.duration_days} zile</p>
              </div>
              <div>
                <p className="text-zinc-500">Sumă plătită</p>
                <p className="text-white">{sub.amount_paid} RON</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-zinc-500">Niciun abonament activ. Contactează recepția pentru a achiziționa un abonament.</p>
        )}
      </Card>

      {history && history.length > 1 && (
        <Card>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Istoric</h2>
          <ul className="space-y-3">
            {history.slice(1).map(s => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{s.plan.name}</span>
                <span className="text-zinc-500">{formatDate(s.start_date)} → {formatDate(s.end_date)}</span>
                <Badge color="zinc">{s.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Portal Classes**

Replace `src/pages/portal/Classes.tsx`:

```tsx
import { useAuthContext } from '../../contexts/AuthContext'
import { useUpcomingClasses } from '../../hooks/useClasses'
import { useMyBookings, useCreateBooking, useCancelBooking } from '../../hooks/useBookings'
import { useMemberSubscription } from '../../hooks/useSubscriptions'
import { Card, Badge, Button } from '../../components/ui'

export function PortalClasses() {
  const { profile } = useAuthContext()
  const { data: classes } = useUpcomingClasses()
  const { data: myBookings } = useMyBookings(profile!.id)
  const { data: sub } = useMemberSubscription(profile!.id)
  const createBooking = useCreateBooking()
  const cancelBooking = useCancelBooking()

  const myBookingMap = new Map(myBookings?.map(b => [b.class_id, b]) ?? [])
  const hasActiveSub = sub?.status === 'active'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Clase disponibile</h1>
      {!hasActiveSub && (
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg px-4 py-3 text-sm text-yellow-400">
          Ai nevoie de un abonament activ pentru a rezerva clase.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes?.map(cls => {
          const booking = myBookingMap.get(cls.id)
          const isBooked = booking?.status === 'confirmed'
          const isFull = cls.bookings_count! >= cls.capacity
          return (
            <Card key={cls.id}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-white text-lg">{cls.name}</h3>
                {isBooked
                  ? <Badge color="green">Rezervat</Badge>
                  : isFull
                  ? <Badge color="red">Complet</Badge>
                  : <Badge color="zinc">{cls.capacity - cls.bookings_count!} locuri</Badge>}
              </div>
              <p className="text-sm text-zinc-400">{cls.instructor} · {cls.location}</p>
              <p className="text-sm text-zinc-300 mt-1 font-medium">
                {new Date(cls.datetime).toLocaleString('ro-RO', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
              <div className="mt-4">
                {isBooked ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => cancelBooking.mutate({ bookingId: booking!.id, memberId: profile!.id })}
                    loading={cancelBooking.isPending}
                  >
                    Anulează rezervarea
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={isFull || !hasActiveSub}
                    onClick={() => createBooking.mutate({ member_id: profile!.id, class_id: cls.id })}
                    loading={createBooking.isPending}
                  >
                    Rezervă loc
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
        {classes?.length === 0 && <p className="text-zinc-500 text-sm col-span-2">Nicio clasă disponibilă momentan.</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Portal MyBookings**

Replace `src/pages/portal/MyBookings.tsx`:

```tsx
import { useAuthContext } from '../../contexts/AuthContext'
import { useMyBookings, useCancelBooking } from '../../hooks/useBookings'
import { Card, Badge, Button } from '../../components/ui'

export function PortalMyBookings() {
  const { profile } = useAuthContext()
  const { data: bookings } = useMyBookings(profile!.id)
  const cancelBooking = useCancelBooking()

  const upcoming = bookings?.filter(b => b.status === 'confirmed' && b.class && new Date(b.class.datetime) > new Date()) ?? []
  const past = bookings?.filter(b => b.status !== 'confirmed' || (b.class && new Date(b.class.datetime) <= new Date())) ?? []

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Rezervările mele</h1>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Viitoare</h2>
        {upcoming.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nicio rezervare viitoare.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(b => (
              <Card key={b.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{b.class?.name}</p>
                  <p className="text-sm text-zinc-400">
                    {new Date(b.class!.datetime).toLocaleString('ro-RO', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                  <p className="text-sm text-zinc-500">{b.class?.instructor} · {b.class?.location}</p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => cancelBooking.mutate({ bookingId: b.id, memberId: profile!.id })}
                  loading={cancelBooking.isPending}
                >
                  Anulează
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Trecute</h2>
        {past.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nicio rezervare trecută.</p>
        ) : (
          <div className="space-y-2">
            {past.map(b => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-zinc-300">{b.class?.name}</p>
                  <p className="text-xs text-zinc-500">{b.class && new Date(b.class.datetime).toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
                <Badge color={b.status === 'attended' ? 'green' : b.status === 'cancelled' ? 'red' : 'zinc'}>
                  {b.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Portal Profile**

Replace `src/pages/portal/Profile.tsx`:

```tsx
import { useState } from 'react'
import { useAuthContext } from '../../contexts/AuthContext'
import { useUpdateMember } from '../../hooks/useMembers'
import { Card, Input, Button } from '../../components/ui'

export function PortalProfile() {
  const { profile } = useAuthContext()
  const updateMember = useUpdateMember()
  const [form, setForm] = useState({ full_name: profile?.full_name ?? '', phone: profile?.phone ?? '' })
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await updateMember.mutateAsync({ id: profile!.id, ...form })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-2xl font-bold text-white">Profilul meu</h1>

      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nume complet" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
          <Input label="Telefon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <Input label="Email" value={profile?.email ?? ''} disabled className="opacity-60" />
          {saved && <p className="text-sm text-green-400">Profil actualizat cu succes.</p>}
          <Button type="submit" loading={updateMember.isPending}>Salvează modificările</Button>
        </form>
      </Card>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/portal/
git commit -m "feat: member portal pages — dashboard, subscription, classes, bookings, profile"
```

---

## Task 12: Final Wiring and Verification

**Files:**
- Modify: `gym-members/index.html` (title + favicon)

- [ ] **Step 1: Update page title**

Edit `index.html`:

```html
<!doctype html>
<html lang="ro">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fight Club Galați — Membri</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Run all tests**

```bash
npm run test
```

Expected: all tests pass

- [ ] **Step 3: Build for production**

```bash
npm run build
```

Expected: build completes without errors in `dist/`

- [ ] **Step 4: Smoke test the full app**

```bash
npm run dev
```

Manual checks:
- [ ] Login ca admin → redirect la `/admin/dashboard` → cartonașele de stats apar
- [ ] Navighezi la Membri → lista se încarcă → adaugi un membru test
- [ ] Navighezi la Abonamente → adaugi un plan
- [ ] Deschizi detaliul membrului → atribui un abonament
- [ ] Navighezi la Clase → adaugi o clasă
- [ ] Navighezi la Check-in → cauți membrul → faci check-in
- [ ] Login ca member → portal dashboard arată abonamentul
- [ ] Navighezi la Clase → rezervi o clasă
- [ ] Navighezi la Rezervările mele → rezervarea apare

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete gym-members app — admin panel and member portal"
```

---

## Notes

- **Supabase inviteUserByEmail** necesită `service_role` key, nu `anon` key. În producție, mută această operație pe un Edge Function Supabase sau folosește Supabase Dashboard pentru a crea manual useri inițial.
- **Supabase Realtime** pe tabelul `checkins` poate fi activat din Dashboard → Database → Replication pentru a actualiza live lista de check-in-uri fără refresh.
- **Deploy:** `npm run build` → upload `dist/` pe Vercel sau Netlify. Setează env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) în platforma de deploy.
