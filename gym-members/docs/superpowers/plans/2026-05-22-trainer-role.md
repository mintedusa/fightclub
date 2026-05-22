# Trainer Role Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `trainer` role with their own zone (dashboard + class management), update admin member creation to accept role + password, and add change-password to member and trainer profiles.

**Architecture:** Three-zone app (admin / trainer / portal). Trainer zone mirrors admin's class management but scoped to classes where `instructor` matches the trainer's `full_name`. Admin create-member form gains role selector + password field. Change password uses `supabase.auth.updateUser`. Trainer ↔ classes linked by `classes.instructor = profiles.full_name` (no schema FK needed).

**Tech Stack:** React 19, Vite, TypeScript, Supabase (PostgreSQL + RLS + Auth), TanStack Query v5, React Router v7, TailwindCSS v4, Lucide icons.

---

## File Map

**New files:**
- `src/components/layout/TrainerLayout.tsx` — sidebar layout for trainer zone
- `src/pages/trainer/Dashboard.tsx` — trainer stats dashboard
- `src/pages/trainer/Classes.tsx` — trainer class list + add/edit
- `src/pages/trainer/ClassDetail.tsx` — enrolled members for one class
- `src/pages/trainer/Profile.tsx` — trainer profile + change password
- `src/hooks/useTrainerStats.ts` — trainer-specific stat queries
- `src/components/ui/ChangePasswordForm.tsx` — shared change-password form

**Modified files:**
- `src/types/index.ts` — add `'trainer'` to `Role`
- `src/hooks/useClasses.ts` — add `useTrainerClasses`, `useClassBookings`
- `src/hooks/useMembers.ts` — `useCreateMember` accepts `role` + `password`
- `src/pages/admin/Members.tsx` — role selector + password field in create form
- `src/pages/portal/Profile.tsx` — add `ChangePasswordForm`
- `src/components/layout/ProtectedRoute.tsx` — trainer redirect
- `src/pages/Login.tsx` — trainer → `/trainer`
- `src/router.tsx` — `/trainer/*` routes

---

### Task 1: DB — trainer role + RLS policies

**Files:**
- Run SQL via psql (connection: `postgresql://postgres.binttgkpdskzsdyfifnh:r7marE3zq8CelgB5@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`)

- [ ] **Step 1: Run migration SQL**

```sql
-- 1. Extend role check constraint
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'member', 'trainer'));

-- 2. Trainer can insert any class
DROP POLICY IF EXISTS "classes_trainer_insert" ON public.classes;
CREATE POLICY "classes_trainer_insert" ON public.classes FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'trainer')
  );

-- 3. Trainer can update only classes where they are the instructor
DROP POLICY IF EXISTS "classes_trainer_update" ON public.classes;
CREATE POLICY "classes_trainer_update" ON public.classes FOR UPDATE
  USING (
    instructor = (SELECT full_name FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'trainer')
  );

-- 4. Trainer can read bookings for their classes
DROP POLICY IF EXISTS "bookings_trainer_select" ON public.bookings;
CREATE POLICY "bookings_trainer_select" ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE c.id = class_id
        AND c.instructor = p.full_name
        AND p.role = 'trainer'
    )
  );

SELECT 'migration done' AS status;
```

Run:
```bash
PGPASSWORD=r7marE3zq8CelgB5 /usr/local/opt/libpq/bin/psql \
  "postgresql://postgres.binttgkpdskzsdyfifnh@aws-0-eu-west-1.pooler.supabase.com:5432/postgres" \
  -c "<sql above>"
```

Expected output: `migration done`

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: db migration — trainer role + RLS policies"
```

---

### Task 2: Types + shared ChangePasswordForm

**Files:**
- Modify: `src/types/index.ts:1`
- Create: `src/components/ui/ChangePasswordForm.tsx`

- [ ] **Step 1: Update Role type**

In `src/types/index.ts` change line 1:
```ts
export type Role = 'admin' | 'member' | 'trainer'
```

- [ ] **Step 2: Create ChangePasswordForm component**

Create `src/components/ui/ChangePasswordForm.tsx`:
```tsx
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Input } from './Input'
import { Button } from './Button'
import { Card } from './Card'

export function ChangePasswordForm() {
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setErrorMsg('Parolele nu coincid.')
      return
    }
    if (form.password.length < 6) {
      setErrorMsg('Parola trebuie să aibă minim 6 caractere.')
      return
    }
    setStatus('saving')
    setErrorMsg(null)
    const { error } = await supabase.auth.updateUser({ password: form.password })
    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      setStatus('done')
      setForm({ password: '', confirm: '' })
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <Card>
      <h2 className="text-base font-semibold text-white mb-4">Schimbă parola</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Parolă nouă"
          type="password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
          minLength={6}
        />
        <Input
          label="Confirmă parola"
          type="password"
          value={form.confirm}
          onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
          required
        />
        {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
        {status === 'done' && <p className="text-sm text-green-400">Parola a fost schimbată cu succes.</p>}
        <Button type="submit" loading={status === 'saving'}>Schimbă parola</Button>
      </form>
    </Card>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts src/components/ui/ChangePasswordForm.tsx
git commit -m "feat: add trainer to Role type + ChangePasswordForm component"
```

---

### Task 3: Admin create member — role selector + password field

**Files:**
- Modify: `src/hooks/useMembers.ts:29-50`
- Modify: `src/pages/admin/Members.tsx`

- [ ] **Step 1: Update useCreateMember in `src/hooks/useMembers.ts`**

Replace the `useCreateMember` function and `generateTempPassword` helper:

```ts
export function useCreateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { email: string; full_name: string; phone?: string; password: string; role: 'member' | 'trainer' }) => {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.full_name } },
      })
      if (signUpError) throw signUpError

      await supabase.rpc('admin_confirm_user', { user_email: data.email })

      if (data.role === 'trainer') {
        await supabase.from('profiles').update({ role: 'trainer' }).eq('email', data.email)
      }
      if (data.phone) {
        await supabase.from('profiles').update({ phone: data.phone }).eq('email', data.email)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  })
}
```

- [ ] **Step 2: Update `src/pages/admin/Members.tsx` form state and modal**

Change form state (line ~17):
```tsx
const [form, setForm] = useState({ email: '', full_name: '', phone: '', password: '', role: 'member' as 'member' | 'trainer' })
```

Change `setForm` reset in `handleCreate`:
```tsx
setForm({ email: '', full_name: '', phone: '', password: '', role: 'member' })
```

Replace modal form fields (keep existing Nume, Email, Telefon fields, add role + password):
```tsx
<Input label="Nume complet" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
<Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
<Input label="Telefon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
<div>
  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Rol</label>
  <select
    value={form.role}
    onChange={e => setForm(f => ({ ...f, role: e.target.value as 'member' | 'trainer' }))}
    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-500"
  >
    <option value="member">Membru</option>
    <option value="trainer">Trainer</option>
  </select>
</div>
<Input label="Parolă" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
```

Replace success card to remove temp-password display (admin set it themselves):
```tsx
{created ? (
  <div className="space-y-4">
    <p className="text-green-400 text-sm font-medium">
      Cont {created.role === 'trainer' ? 'trainer' : 'membru'} creat cu succes!
    </p>
    <div className="rounded-lg bg-zinc-800 p-4">
      <p className="text-xs text-zinc-400">Email</p>
      <p className="text-white font-mono">{created.email}</p>
    </div>
    <div className="flex justify-end">
      <Button onClick={handleClose}>Închide</Button>
    </div>
  </div>
) : (
```

Update `created` state type:
```tsx
const [created, setCreated] = useState<{ email: string; role: string } | null>(null)
```

Update `setCreated` call in `handleCreate`:
```tsx
setCreated({ email: form.email, role: form.role })
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useMembers.ts src/pages/admin/Members.tsx
git commit -m "feat: admin create member — role selector + password field"
```

---

### Task 4: Login + ProtectedRoute + Router for trainer

**Files:**
- Modify: `src/pages/Login.tsx:14`
- Modify: `src/components/layout/ProtectedRoute.tsx`
- Modify: `src/router.tsx`
- Create: `src/components/layout/TrainerLayout.tsx`

- [ ] **Step 1: Update Login.tsx redirect logic (line 14)**

```tsx
navigate(profile.role === 'admin' ? '/admin' : profile.role === 'trainer' ? '/trainer' : '/portal', { replace: true })
```

- [ ] **Step 2: Update ProtectedRoute.tsx**

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
    const home = profile?.role === 'admin' ? '/admin' : profile?.role === 'trainer' ? '/trainer' : '/portal'
    return <Navigate to={home} replace />
  }

  return <>{children}</>
}
```

- [ ] **Step 3: Create TrainerLayout.tsx**

```tsx
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Calendar, User, LogOut } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'

const navItems = [
  { to: '/trainer', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/trainer/classes', label: 'Clasele mele', icon: Calendar },
  { to: '/trainer/profile', label: 'Profil', icon: User },
]

export function TrainerLayout() {
  const { signOut, profile } = useAuthContext()

  return (
    <div className="min-h-screen bg-black flex">
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <span className="text-white font-bold text-lg tracking-tight">Fight Club</span>
          <span className="text-red-500 font-bold text-lg"> Trainer</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-red-600/20 text-red-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
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

- [ ] **Step 4: Update router.tsx**

Add these imports at the top:
```tsx
import { TrainerLayout } from './components/layout/TrainerLayout'
import { TrainerDashboard } from './pages/trainer/Dashboard'
import { TrainerClasses } from './pages/trainer/Classes'
import { TrainerClassDetail } from './pages/trainer/ClassDetail'
import { TrainerProfile } from './pages/trainer/Profile'
```

Add trainer routes after the portal block:
```tsx
{
  path: '/trainer',
  element: <ProtectedRoute requiredRole="trainer"><TrainerLayout /></ProtectedRoute>,
  children: [
    { index: true, element: <TrainerDashboard /> },
    { path: 'classes', element: <TrainerClasses /> },
    { path: 'classes/:id', element: <TrainerClassDetail /> },
    { path: 'profile', element: <TrainerProfile /> },
  ],
},
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/Login.tsx src/components/layout/ProtectedRoute.tsx src/components/layout/TrainerLayout.tsx src/router.tsx
git commit -m "feat: trainer routing — layout, protected route, login redirect"
```

---

### Task 5: Trainer hooks

**Files:**
- Modify: `src/hooks/useClasses.ts`
- Create: `src/hooks/useTrainerStats.ts`

- [ ] **Step 1: Add useTrainerClasses + useClassBookings to `src/hooks/useClasses.ts`**

Append to end of file:
```ts
export function useTrainerClasses() {
  return useQuery({
    queryKey: ['trainer-classes'],
    queryFn: async () => {
      const { data: profile } = await supabase.from('profiles').select('full_name').single()
      if (!profile) return []
      const { data, error } = await supabase
        .from('classes')
        .select('*, bookings_count:bookings(count)')
        .eq('instructor', profile.full_name)
        .order('datetime', { ascending: false })
      if (error) throw error
      return (data ?? []).map(c => ({
        ...c,
        bookings_count: (c.bookings_count as unknown as { count: number }[])[0]?.count ?? 0,
      })) as Class[]
    },
  })
}

export function useClassBookings(classId: string) {
  return useQuery({
    queryKey: ['class-bookings', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, member:profiles(full_name, email, phone)')
        .eq('class_id', classId)
        .neq('status', 'cancelled')
        .order('created_at')
      if (error) throw error
      return data
    },
  })
}
```

- [ ] **Step 2: Create `src/hooks/useTrainerStats.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useTrainerStats() {
  return useQuery({
    queryKey: ['trainer-stats'],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .single()

      if (!profile) return { totalClasses: 0, upcomingClasses: 0, totalEnrolled: 0 }

      const now = new Date().toISOString()

      const [allClasses, upcomingClasses, bookings] = await Promise.all([
        supabase
          .from('classes')
          .select('id', { count: 'exact', head: true })
          .eq('instructor', profile.full_name),
        supabase
          .from('classes')
          .select('id', { count: 'exact', head: true })
          .eq('instructor', profile.full_name)
          .eq('is_cancelled', false)
          .gte('datetime', now),
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'confirmed')
          .in(
            'class_id',
            (
              await supabase
                .from('classes')
                .select('id')
                .eq('instructor', profile.full_name)
            ).data?.map(c => c.id) ?? []
          ),
      ])

      return {
        totalClasses: allClasses.count ?? 0,
        upcomingClasses: upcomingClasses.count ?? 0,
        totalEnrolled: bookings.count ?? 0,
      }
    },
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useClasses.ts src/hooks/useTrainerStats.ts
git commit -m "feat: trainer hooks — useTrainerClasses, useClassBookings, useTrainerStats"
```

---

### Task 6: Trainer pages — Dashboard, Classes, ClassDetail

**Files:**
- Create: `src/pages/trainer/Dashboard.tsx`
- Create: `src/pages/trainer/Classes.tsx`
- Create: `src/pages/trainer/ClassDetail.tsx`

- [ ] **Step 1: Create `src/pages/trainer/Dashboard.tsx`**

```tsx
import { useTrainerStats } from '../../hooks/useTrainerStats'
import { useTrainerClasses } from '../../hooks/useClasses'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuthContext } from '../../contexts/AuthContext'

export function TrainerDashboard() {
  const { profile } = useAuthContext()
  const { data: stats } = useTrainerStats()
  const { data: classes } = useTrainerClasses()

  const upcoming = (classes ?? [])
    .filter(c => !c.is_cancelled && new Date(c.datetime) > new Date())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bună, {profile?.full_name}!</h1>
        <p className="text-zinc-400 text-sm mt-1">Iată un rezumat al activității tale</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-zinc-400">Total clase</p>
          <p className="text-3xl font-bold text-white mt-1">{stats?.totalClasses ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-400">Clase viitoare</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{stats?.upcomingClasses ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-400">Total înscrieri active</p>
          <p className="text-3xl font-bold text-white mt-1">{stats?.totalEnrolled ?? 0}</p>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Următoarele clase</h2>
        {upcoming.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nicio clasă viitoare programată.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map(cls => (
              <Card key={cls.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{cls.name}</p>
                    <p className="text-sm text-zinc-400">
                      {new Date(cls.datetime).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' })}
                      {' · '}{cls.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">{cls.bookings_count ?? 0} / {cls.capacity}</p>
                    <Badge color="green">Activă</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/pages/trainer/Classes.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import { useTrainerClasses, useCreateClass, useUpdateClass } from '../../hooks/useClasses'
import { useAuthContext } from '../../contexts/AuthContext'
import type { Class } from '../../types'

export function TrainerClasses() {
  const navigate = useNavigate()
  const { profile } = useAuthContext()
  const { data: classes } = useTrainerClasses()
  const createClass = useCreateClass()
  const updateClass = useUpdateClass()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Class | null>(null)
  const [form, setForm] = useState({ name: '', datetime: '', capacity: '', location: 'Sala 1' })

  function openCreate() {
    setEditing(null)
    setForm({ name: '', datetime: '', capacity: '', location: 'Sala 1' })
    setOpen(true)
  }

  function openEdit(cls: Class) {
    setEditing(cls)
    setForm({
      name: cls.name,
      datetime: cls.datetime.slice(0, 16),
      capacity: String(cls.capacity),
      location: cls.location,
    })
    setOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      name: form.name,
      instructor: profile!.full_name,
      datetime: new Date(form.datetime).toISOString(),
      capacity: parseInt(form.capacity),
      location: form.location,
    }
    if (editing) {
      await updateClass.mutateAsync({ id: editing.id, ...data, is_cancelled: editing.is_cancelled })
    } else {
      await createClass.mutateAsync(data)
    }
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clasele mele</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Clasă nouă</Button>
      </div>

      <Table
        data={classes ?? []}
        emptyMessage="Nicio clasă creată încă."
        columns={[
          { key: 'name', header: 'Clasă', render: c => <span className="font-medium">{c.name}</span> },
          { key: 'datetime', header: 'Data/Ora', render: c => new Date(c.datetime).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' }) },
          { key: 'capacity', header: 'Locuri', render: c => `${c.bookings_count ?? 0} / ${c.capacity}` },
          { key: 'location', header: 'Locație', render: c => c.location },
          { key: 'status', header: 'Status', render: c => c.is_cancelled ? <Badge color="red">Anulată</Badge> : <Badge color="green">Activă</Badge> },
          {
            key: 'actions', header: '', render: c => (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Editează</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/trainer/classes/${c.id}`)}>Înscrieri</Button>
              </div>
            )
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editează clasa' : 'Clasă nouă'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Tip clasă" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="CrossFit, Yoga..." required />
          <Input label="Data și ora" type="datetime-local" value={form.datetime} onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))} required />
          <Input label="Capacitate maximă" type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required />
          <Input label="Locație" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
          {editing && (
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                className="accent-red-600"
                checked={editing.is_cancelled}
                onChange={e => setEditing(prev => prev ? { ...prev, is_cancelled: e.target.checked } : null)}
              />
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

- [ ] **Step 3: Create `src/pages/trainer/ClassDetail.tsx`**

```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { useClassBookings } from '../../hooks/useClasses'

export function TrainerClassDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: bookings, isLoading } = useClassBookings(id!)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/trainer/classes')}>
          <ArrowLeft className="h-4 w-4" /> Înapoi
        </Button>
        <h1 className="text-2xl font-bold text-white">Membri înscriși</h1>
      </div>

      {isLoading ? (
        <p className="text-zinc-500 text-sm">Se încarcă...</p>
      ) : (
        <Table
          data={bookings ?? []}
          emptyMessage="Niciun membru înscris."
          columns={[
            { key: 'name', header: 'Nume', render: b => <span className="font-medium">{(b.member as any)?.full_name}</span> },
            { key: 'email', header: 'Email', render: b => <span className="text-zinc-400">{(b.member as any)?.email}</span> },
            { key: 'phone', header: 'Telefon', render: b => (b.member as any)?.phone ?? '—' },
            {
              key: 'status', header: 'Status', render: b =>
                b.status === 'attended'
                  ? <Badge color="green">Prezent</Badge>
                  : <Badge color="red">Înscris</Badge>
            },
          ]}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/trainer/
git commit -m "feat: trainer pages — Dashboard, Classes, ClassDetail"
```

---

### Task 7: Trainer profile + change password for members

**Files:**
- Create: `src/pages/trainer/Profile.tsx`
- Modify: `src/pages/portal/Profile.tsx`

- [ ] **Step 1: Create `src/pages/trainer/Profile.tsx`**

```tsx
import { useState } from 'react'
import { useAuthContext } from '../../contexts/AuthContext'
import { useUpdateMember } from '../../hooks/useMembers'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { ChangePasswordForm } from '../../components/ui/ChangePasswordForm'

export function TrainerProfile() {
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
          {saved && <p className="text-sm text-green-400">Profil actualizat.</p>}
          <Button type="submit" loading={updateMember.isPending}>Salvează</Button>
        </form>
      </Card>
      <ChangePasswordForm />
    </div>
  )
}
```

- [ ] **Step 2: Update `src/pages/portal/Profile.tsx` — add ChangePasswordForm**

Add import at top:
```tsx
import { ChangePasswordForm } from '../../components/ui/ChangePasswordForm'
```

Add after the closing `</Card>`:
```tsx
<ChangePasswordForm />
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/trainer/Profile.tsx src/pages/portal/Profile.tsx
git commit -m "feat: change password in member portal + trainer profile"
```

---

## Self-Review

**Spec coverage:**
- ✅ Trainer role added (Task 1 + 2)
- ✅ Admin sets role (member/trainer) when creating account (Task 3)
- ✅ Admin sets password (Task 3)
- ✅ Members can change password from portal (Task 7)
- ✅ Trainers can change password from trainer profile (Task 7)
- ✅ Trainers can add/edit classes (Task 6 — TrainerClasses)
- ✅ Trainers have dashboard with stats (Task 6 — TrainerDashboard)
- ✅ Trainers can see who's enrolled in their classes (Task 6 — ClassDetail)
- ✅ RLS policies for trainer access (Task 1)

**No placeholders:** All code is complete and copy-pasteable.

**Type consistency:**
- `Role = 'admin' | 'member' | 'trainer'` defined in Task 2, used consistently throughout.
- `useTrainerClasses` returns `Class[]` — matches `Class` type used in TrainerClasses page.
- `useClassBookings` returns bookings with `member` join — used as `(b.member as any)` in ClassDetail (acceptable for inline join).
