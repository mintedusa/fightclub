# Class Series View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display recurring classes as a single series row in admin and trainer tables, with per-instance cancel support, edit-series modal, and DB-backed trainer selector on class creation.

**Architecture:** Add `recurrence_group_id UUID` to `classes`. Client-side `groupClassesBySeries()` deduplicates rows. Edit/cancel series does `UPDATE WHERE recurrence_group_id = $1`. Individual cancel uses existing `useUpdateClass`. Trainer selector replaced by `<select>` populated from `useTrainers` hook.

**Tech Stack:** React 19, TypeScript, Supabase (PostgreSQL), TanStack Query v5, TailwindCSS v4, Vite

---

## File Map

**New:**
- `src/hooks/useTrainers.ts` — fetch profiles WHERE role='trainer'
- `src/components/ui/ClassInstancesModal.tsx` — modal listing instances with per-row cancel

**Modified:**
- DB: `classes` table — add `recurrence_group_id UUID` column
- `src/types/index.ts` — add `recurrence_group_id` to `Class`; add `ClassRow` type
- `src/lib/recurrence.ts` — `generateOccurrences` requires `recurrence_group_id` in base; new `groupClassesBySeries()`
- `src/hooks/useClasses.ts` — add `useSeriesInstances`, `useUpdateClassSeries`
- `src/pages/admin/Classes.tsx` — series view, trainer select, 3 modal types
- `src/pages/trainer/Classes.tsx` — series view, edit series modal, Instanțe button

---

## Task 1: DB Migration + Types + recurrence.ts

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/lib/recurrence.ts`

- [ ] **Step 1: Run DB migration**

```bash
PGPASSWORD=r7marE3zq8CelgB5 /usr/local/opt/libpq/bin/psql \
  "postgresql://postgres.binttgkpdskzsdyfifnh@aws-0-eu-west-1.pooler.supabase.com:5432/postgres" \
  -c "ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS recurrence_group_id UUID;"
```

Expected output: `ALTER TABLE`

- [ ] **Step 2: Verify column exists**

```bash
PGPASSWORD=r7marE3zq8CelgB5 /usr/local/opt/libpq/bin/psql \
  "postgresql://postgres.binttgkpdskzsdyfifnh@aws-0-eu-west-1.pooler.supabase.com:5432/postgres" \
  -c "\d public.classes"
```

Expected: `recurrence_group_id | uuid` in column list.

- [ ] **Step 3: Update `src/types/index.ts` — add field to Class and add ClassRow**

Read the current file first, then update the `Class` interface to add `recurrence_group_id` and add a `ClassRow` interface after it:

```ts
export interface Class {
  id: string
  name: string
  instructor: string
  datetime: string
  capacity: number
  location: string
  is_cancelled: boolean
  bookings_count?: number
  recurrence_group_id?: string | null
}

export interface ClassRow extends Class {
  isSeries: true
  seriesDays: number[]        // unique weekday indices across all instances
  seriesStart: string         // earliest datetime ISO string
  seriesEnd: string           // latest datetime ISO string
  instanceCount: number
  instances: Class[]
}
```

- [ ] **Step 4: Update `src/lib/recurrence.ts` — update generateOccurrences + add groupClassesBySeries**

Replace the entire file content:

```ts
import type { Class, ClassRow } from '../types'

export interface RecurrenceState {
  enabled: boolean
  days: number[]   // JS day indices: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  endDate: string  // "YYYY-MM-DD"
}

type ClassInput = Omit<Class, 'id' | 'is_cancelled' | 'bookings_count'>

export function generateOccurrences(
  startDatetime: string,
  days: number[],
  endDate: string,
  base: Omit<ClassInput, 'datetime'> & { recurrence_group_id: string }
): ClassInput[] {
  const result: ClassInput[] = []
  const start = new Date(startDatetime)
  const end = new Date(endDate + 'T23:59:59')
  const hours = start.getHours()
  const minutes = start.getMinutes()

  const cursor = new Date(start)
  cursor.setHours(0, 0, 0, 0)

  while (cursor <= end) {
    if (days.includes(cursor.getDay())) {
      const dt = new Date(cursor)
      dt.setHours(hours, minutes, 0, 0)
      if (dt >= start) {
        result.push({ ...base, datetime: dt.toISOString() })
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return result
}

export function groupClassesBySeries(classes: Class[]): (Class | ClassRow)[] {
  const seriesMap = new Map<string, Class[]>()
  const individual: Class[] = []

  for (const cls of classes) {
    if (cls.recurrence_group_id) {
      const existing = seriesMap.get(cls.recurrence_group_id) ?? []
      existing.push(cls)
      seriesMap.set(cls.recurrence_group_id, existing)
    } else {
      individual.push(cls)
    }
  }

  const seriesRows: ClassRow[] = []
  for (const [, instances] of seriesMap) {
    const sorted = [...instances].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    )
    const now = new Date()
    const representative =
      sorted.find(c => new Date(c.datetime) >= now) ?? sorted[sorted.length - 1]

    const seriesDays = [...new Set(sorted.map(c => new Date(c.datetime).getDay()))]

    seriesRows.push({
      ...representative,
      isSeries: true,
      seriesDays,
      seriesStart: sorted[0].datetime,
      seriesEnd: sorted[sorted.length - 1].datetime,
      instanceCount: sorted.length,
      instances: sorted,
    })
  }

  return [...seriesRows, ...individual]
}
```

- [ ] **Step 5: Verify build compiles**

```bash
cd /Users/filimoncristian/Sites/fightclub/gym-members && PATH="/usr/local/opt/node/bin:$PATH" npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors. If errors about `ClassRow` import, check `src/types/index.ts` exports.

- [ ] **Step 6: Commit**

```bash
cd /Users/filimoncristian/Sites/fightclub/gym-members
git add src/types/index.ts src/lib/recurrence.ts
git commit -m "feat: add recurrence_group_id to Class type and groupClassesBySeries utility"
```

---

## Task 2: useTrainers hook + useSeriesInstances + useUpdateClassSeries

**Files:**
- Create: `src/hooks/useTrainers.ts`
- Modify: `src/hooks/useClasses.ts`

- [ ] **Step 1: Create `src/hooks/useTrainers.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useTrainers() {
  return useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'trainer')
        .order('full_name')
      if (error) throw error
      return (data ?? []) as { id: string; full_name: string }[]
    },
  })
}
```

- [ ] **Step 2: Add `useSeriesInstances` and `useUpdateClassSeries` to `src/hooks/useClasses.ts`**

Append to the end of the existing file:

```ts
export function useSeriesInstances(recurrenceGroupId: string | null | undefined) {
  return useQuery({
    queryKey: ['series-instances', recurrenceGroupId],
    enabled: !!recurrenceGroupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*, bookings_count:bookings(count)')
        .eq('recurrence_group_id', recurrenceGroupId!)
        .order('datetime')
      if (error) throw error
      return (data ?? []).map(c => ({
        ...c,
        bookings_count: (c.bookings_count as unknown as { count: number }[])[0]?.count ?? 0,
      })) as Class[]
    },
  })
}

export function useUpdateClassSeries() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      recurrenceGroupId,
      updates,
    }: {
      recurrenceGroupId: string
      updates: {
        name?: string
        instructor?: string
        time?: string   // "HH:mm"
        capacity?: number
        location?: string
        is_cancelled?: boolean
      }
    }) => {
      // Fetch all instances to update datetimes when time changes
      if (updates.time !== undefined) {
        const { data, error } = await supabase
          .from('classes')
          .select('id, datetime')
          .eq('recurrence_group_id', recurrenceGroupId)
        if (error) throw error

        const [hStr, mStr] = updates.time.split(':')
        const h = parseInt(hStr, 10)
        const m = parseInt(mStr, 10)

        for (const inst of data ?? []) {
          const dt = new Date(inst.datetime)
          dt.setHours(h, m, 0, 0)
          const { error: updateError } = await supabase
            .from('classes')
            .update({ ...getCommonUpdates(updates), datetime: dt.toISOString() })
            .eq('id', inst.id)
          if (updateError) throw updateError
        }
      } else {
        const { error } = await supabase
          .from('classes')
          .update(getCommonUpdates(updates))
          .eq('recurrence_group_id', recurrenceGroupId)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      qc.invalidateQueries({ queryKey: ['trainer-classes'] })
      qc.invalidateQueries({ queryKey: ['series-instances'] })
    },
  })
}

function getCommonUpdates(updates: {
  name?: string
  instructor?: string
  capacity?: number
  location?: string
  is_cancelled?: boolean
}) {
  const result: Record<string, unknown> = {}
  if (updates.name !== undefined) result.name = updates.name
  if (updates.instructor !== undefined) result.instructor = updates.instructor
  if (updates.capacity !== undefined) result.capacity = updates.capacity
  if (updates.location !== undefined) result.location = updates.location
  if (updates.is_cancelled !== undefined) result.is_cancelled = updates.is_cancelled
  return result
}
```

- [ ] **Step 3: Verify build compiles**

```bash
cd /Users/filimoncristian/Sites/fightclub/gym-members && PATH="/usr/local/opt/node/bin:$PATH" npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/filimoncristian/Sites/fightclub/gym-members
git add src/hooks/useTrainers.ts src/hooks/useClasses.ts
git commit -m "feat: add useTrainers, useSeriesInstances, useUpdateClassSeries hooks"
```

---

## Task 3: ClassInstancesModal component

**Files:**
- Create: `src/components/ui/ClassInstancesModal.tsx`

- [ ] **Step 1: Create `src/components/ui/ClassInstancesModal.tsx`**

```tsx
import { Modal } from './Modal'
import { Badge } from './Badge'
import { Button } from './Button'
import { useSeriesInstances } from '../../hooks/useClasses'
import { useUpdateClass } from '../../hooks/useClasses'
import type { ClassRow } from '../../types'

interface Props {
  series: ClassRow | null
  onClose: () => void
}

export function ClassInstancesModal({ series, onClose }: Props) {
  const { data: instances, isLoading } = useSeriesInstances(series?.recurrence_group_id)
  const updateClass = useUpdateClass()

  async function handleCancel(id: string) {
    await updateClass.mutateAsync({ id, is_cancelled: true })
  }

  return (
    <Modal open={!!series} onClose={onClose} title={`Instanțe — ${series?.name ?? ''}`}>
      {isLoading ? (
        <p className="text-zinc-400 text-sm">Se încarcă...</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {(instances ?? []).map(inst => (
            <div key={inst.id} className="flex items-center justify-between py-2 border-b border-zinc-700">
              <div className="text-sm text-zinc-300">
                {new Date(inst.datetime).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              <div className="flex items-center gap-3">
                {inst.is_cancelled
                  ? <Badge color="red">Anulată</Badge>
                  : <Badge color="green">Activă</Badge>
                }
                {!inst.is_cancelled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={updateClass.isPending}
                    onClick={() => handleCancel(inst.id)}
                  >
                    Anulează
                  </Button>
                )}
              </div>
            </div>
          ))}
          {(instances ?? []).length === 0 && (
            <p className="text-zinc-400 text-sm text-center py-4">Nicio instanță găsită.</p>
          )}
        </div>
      )}
      <div className="flex justify-end mt-4">
        <Button variant="ghost" onClick={onClose}>Închide</Button>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 2: Verify build compiles**

```bash
cd /Users/filimoncristian/Sites/fightclub/gym-members && PATH="/usr/local/opt/node/bin:$PATH" npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/filimoncristian/Sites/fightclub/gym-members
git add src/components/ui/ClassInstancesModal.tsx
git commit -m "feat: add ClassInstancesModal component"
```

---

## Task 4: Admin Classes page — series view + trainer selector

**Files:**
- Modify: `src/pages/admin/Classes.tsx`

This is a full rewrite. The page needs:
- Series rows via `groupClassesBySeries()`
- Trainer `<select>` from `useTrainers()` instead of free-text input
- `recurrenceGroupId` passed to `generateOccurrences` on create
- Edit individual class modal (existing behavior)
- Edit series modal (name, instructor, time, capacity, location, cancel-all checkbox)
- Instanțe button for series rows

- [ ] **Step 1: Rewrite `src/pages/admin/Classes.tsx`**

```tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import { RecurrenceFields } from '../../components/ui/RecurrenceFields'
import { ClassInstancesModal } from '../../components/ui/ClassInstancesModal'
import { useAllClasses, useCreateClass, useCreateClasses, useUpdateClass, useUpdateClassSeries } from '../../hooks/useClasses'
import { useTrainers } from '../../hooks/useTrainers'
import { generateOccurrences, groupClassesBySeries, type RecurrenceState } from '../../lib/recurrence'
import type { Class, ClassRow } from '../../types'

const EMPTY_RECURRENCE: RecurrenceState = { enabled: false, days: [], endDate: '' }

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']

function formatSeriesSchedule(row: ClassRow): string {
  const days = row.seriesDays.map(d => DAY_LABELS[d]).join(', ')
  const time = new Date(row.datetime).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
  return `${days} ${time}`
}

function formatSeriesInterval(row: ClassRow): string {
  const start = new Date(row.seriesStart).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
  const end = new Date(row.seriesEnd).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
  return `${start} – ${end}`
}

type ModalMode = 'none' | 'create' | 'edit-individual' | 'edit-series'

export function AdminClasses() {
  const { data: rawClasses } = useAllClasses()
  const { data: trainers } = useTrainers()
  const createClass = useCreateClass()
  const createClasses = useCreateClasses()
  const updateClass = useUpdateClass()
  const updateSeries = useUpdateClassSeries()

  const [modalMode, setModalMode] = useState<ModalMode>('none')
  const [editingIndividual, setEditingIndividual] = useState<Class | null>(null)
  const [editingSeries, setEditingSeries] = useState<ClassRow | null>(null)
  const [instancesTarget, setInstancesTarget] = useState<ClassRow | null>(null)

  const [form, setForm] = useState({ name: '', instructor: '', datetime: '', capacity: '', location: 'Sala 1' })
  const [seriesForm, setSeriesForm] = useState({ name: '', instructor: '', time: '', capacity: '', location: '', cancelAll: false })
  const [recurrence, setRecurrence] = useState<RecurrenceState>(EMPTY_RECURRENCE)
  const [formError, setFormError] = useState<string | null>(null)

  const rows = rawClasses ? groupClassesBySeries(rawClasses) : []

  function openCreate() {
    setForm({ name: '', instructor: trainers?.[0]?.full_name ?? '', datetime: '', capacity: '', location: 'Sala 1' })
    setRecurrence(EMPTY_RECURRENCE)
    setFormError(null)
    setModalMode('create')
  }

  function openEditIndividual(cls: Class) {
    setEditingIndividual(cls)
    setForm({
      name: cls.name,
      instructor: cls.instructor,
      datetime: cls.datetime.slice(0, 16),
      capacity: String(cls.capacity),
      location: cls.location,
    })
    setFormError(null)
    setModalMode('edit-individual')
  }

  function openEditSeries(row: ClassRow) {
    setEditingSeries(row)
    const time = new Date(row.datetime).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', hour12: false })
    setSeriesForm({
      name: row.name,
      instructor: row.instructor,
      time,
      capacity: String(row.capacity),
      location: row.location,
      cancelAll: false,
    })
    setModalMode('edit-series')
  }

  async function handleSaveCreate(e: React.FormEvent) {
    e.preventDefault()
    const base = {
      name: form.name,
      instructor: form.instructor,
      capacity: parseInt(form.capacity),
      location: form.location,
    }
    if (recurrence.enabled) {
      const groupId = crypto.randomUUID()
      const occurrences = generateOccurrences(form.datetime, recurrence.days, recurrence.endDate, {
        ...base,
        recurrence_group_id: groupId,
      })
      if (occurrences.length === 0) {
        setFormError('Nicio apariție în intervalul selectat. Verifică zilele și data de final.')
        return
      }
      setFormError(null)
      await createClasses.mutateAsync(occurrences)
    } else {
      await createClass.mutateAsync({ ...base, datetime: new Date(form.datetime).toISOString() })
    }
    setModalMode('none')
  }

  async function handleSaveIndividual(e: React.FormEvent) {
    e.preventDefault()
    if (!editingIndividual) return
    await updateClass.mutateAsync({
      id: editingIndividual.id,
      name: form.name,
      instructor: form.instructor,
      capacity: parseInt(form.capacity),
      location: form.location,
      datetime: new Date(form.datetime).toISOString(),
      is_cancelled: editingIndividual.is_cancelled,
    })
    setModalMode('none')
  }

  async function handleSaveSeries(e: React.FormEvent) {
    e.preventDefault()
    if (!editingSeries?.recurrence_group_id) return
    await updateSeries.mutateAsync({
      recurrenceGroupId: editingSeries.recurrence_group_id,
      updates: {
        name: seriesForm.name,
        instructor: seriesForm.instructor,
        time: seriesForm.time,
        capacity: parseInt(seriesForm.capacity),
        location: seriesForm.location,
        ...(seriesForm.cancelAll ? { is_cancelled: true } : {}),
      },
    })
    setModalMode('none')
  }

  const isSaving =
    createClass.isPending || createClasses.isPending ||
    updateClass.isPending || updateSeries.isPending
  const recurrenceInvalid = recurrence.enabled && (recurrence.days.length === 0 || !recurrence.endDate)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clase</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Clasă nouă</Button>
      </div>

      <Table
        data={rows}
        emptyMessage="Nicio clasă programată."
        columns={[
          {
            key: 'name',
            header: 'Clasă',
            render: row => <span className="font-medium">{row.name}</span>,
          },
          { key: 'instructor', header: 'Instructor', render: row => row.instructor },
          {
            key: 'schedule',
            header: 'Program',
            render: row =>
              (row as ClassRow).isSeries
                ? formatSeriesSchedule(row as ClassRow)
                : new Date(row.datetime).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' }),
          },
          {
            key: 'interval',
            header: 'Interval',
            render: row =>
              (row as ClassRow).isSeries ? formatSeriesInterval(row as ClassRow) : '—',
          },
          { key: 'capacity', header: 'Locuri', render: row => `${row.bookings_count ?? 0} / ${row.capacity}` },
          { key: 'location', header: 'Locație', render: row => row.location },
          {
            key: 'status',
            header: 'Status',
            render: row => {
              if ((row as ClassRow).isSeries) {
                const allCancelled = (row as ClassRow).instances.every(i => i.is_cancelled)
                return allCancelled
                  ? <Badge color="red">Anulată</Badge>
                  : <Badge color="green">Activă</Badge>
              }
              return row.is_cancelled
                ? <Badge color="red">Anulată</Badge>
                : <Badge color="green">Activă</Badge>
            },
          },
          {
            key: 'actions',
            header: '',
            render: row => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    (row as ClassRow).isSeries
                      ? openEditSeries(row as ClassRow)
                      : openEditIndividual(row as Class)
                  }
                >
                  Editează
                </Button>
                {(row as ClassRow).isSeries && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInstancesTarget(row as ClassRow)}
                  >
                    Instanțe
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Create modal */}
      <Modal open={modalMode === 'create'} onClose={() => setModalMode('none')} title="Clasă nouă">
        <form onSubmit={handleSaveCreate} className="space-y-4">
          <Input label="Tip clasă" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="CrossFit, Yoga..." required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-300">Instructor</label>
            <select
              className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              value={form.instructor}
              onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))}
              required
            >
              <option value="">Alege instructor...</option>
              {(trainers ?? []).map(t => (
                <option key={t.id} value={t.full_name}>{t.full_name}</option>
              ))}
            </select>
          </div>
          <Input label="Data și ora" type="datetime-local" value={form.datetime} onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))} required />
          <Input label="Capacitate maximă" type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required />
          <Input label="Locație" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
          <RecurrenceFields value={recurrence} onChange={setRecurrence} startDate={form.datetime.slice(0, 10)} />
          {formError && <p className="text-sm text-red-400">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setModalMode('none')}>Anulează</Button>
            <Button type="submit" loading={isSaving} disabled={recurrenceInvalid}>Salvează</Button>
          </div>
        </form>
      </Modal>

      {/* Edit individual modal */}
      <Modal open={modalMode === 'edit-individual'} onClose={() => setModalMode('none')} title="Editează clasa">
        <form onSubmit={handleSaveIndividual} className="space-y-4">
          <Input label="Tip clasă" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-300">Instructor</label>
            <select
              className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              value={form.instructor}
              onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))}
              required
            >
              <option value="">Alege instructor...</option>
              {(trainers ?? []).map(t => (
                <option key={t.id} value={t.full_name}>{t.full_name}</option>
              ))}
            </select>
          </div>
          <Input label="Data și ora" type="datetime-local" value={form.datetime} onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))} required />
          <Input label="Capacitate maximă" type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required />
          <Input label="Locație" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
          {editingIndividual && (
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                className="accent-red-600"
                checked={editingIndividual.is_cancelled}
                onChange={e => setEditingIndividual(prev => prev ? { ...prev, is_cancelled: e.target.checked } : null)}
              />
              Marchează ca anulată
            </label>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setModalMode('none')}>Anulează</Button>
            <Button type="submit" loading={isSaving}>Salvează</Button>
          </div>
        </form>
      </Modal>

      {/* Edit series modal */}
      <Modal open={modalMode === 'edit-series'} onClose={() => setModalMode('none')} title="Editează seria">
        <form onSubmit={handleSaveSeries} className="space-y-4">
          <Input label="Tip clasă" value={seriesForm.name} onChange={e => setSeriesForm(f => ({ ...f, name: e.target.value }))} required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-300">Instructor</label>
            <select
              className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              value={seriesForm.instructor}
              onChange={e => setSeriesForm(f => ({ ...f, instructor: e.target.value }))}
              required
            >
              <option value="">Alege instructor...</option>
              {(trainers ?? []).map(t => (
                <option key={t.id} value={t.full_name}>{t.full_name}</option>
              ))}
            </select>
          </div>
          <Input label="Ora (HH:MM)" type="time" value={seriesForm.time} onChange={e => setSeriesForm(f => ({ ...f, time: e.target.value }))} required />
          <Input label="Capacitate maximă" type="number" value={seriesForm.capacity} onChange={e => setSeriesForm(f => ({ ...f, capacity: e.target.value }))} required />
          <Input label="Locație" value={seriesForm.location} onChange={e => setSeriesForm(f => ({ ...f, location: e.target.value }))} required />
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              className="accent-red-600"
              checked={seriesForm.cancelAll}
              onChange={e => setSeriesForm(f => ({ ...f, cancelAll: e.target.checked }))}
            />
            Anulează toată seria
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setModalMode('none')}>Anulează</Button>
            <Button type="submit" loading={isSaving}>Salvează</Button>
          </div>
        </form>
      </Modal>

      <ClassInstancesModal
        series={instancesTarget}
        onClose={() => setInstancesTarget(null)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify build compiles**

```bash
cd /Users/filimoncristian/Sites/fightclub/gym-members && PATH="/usr/local/opt/node/bin:$PATH" npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/filimoncristian/Sites/fightclub/gym-members
git add src/pages/admin/Classes.tsx
git commit -m "feat: admin classes series view with trainer selector and edit-series modal"
```

---

## Task 5: Trainer Classes page — series view

**Files:**
- Modify: `src/pages/trainer/Classes.tsx`

This is a full rewrite. The trainer page needs:
- Series rows via `groupClassesBySeries()`
- `recurrenceGroupId` passed to `generateOccurrences` on create
- Edit series modal (name, time, capacity, location — no instructor change for trainer)
- Edit individual modal (unchanged behavior)
- Instanțe button for series rows
- Înscrieri button only for non-series (individual) rows

- [ ] **Step 1: Rewrite `src/pages/trainer/Classes.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import { RecurrenceFields } from '../../components/ui/RecurrenceFields'
import { ClassInstancesModal } from '../../components/ui/ClassInstancesModal'
import { useTrainerClasses, useCreateClass, useCreateClasses, useUpdateClass, useUpdateClassSeries } from '../../hooks/useClasses'
import { generateOccurrences, groupClassesBySeries, type RecurrenceState } from '../../lib/recurrence'
import { useAuthContext } from '../../contexts/AuthContext'
import type { Class, ClassRow } from '../../types'

const EMPTY_RECURRENCE: RecurrenceState = { enabled: false, days: [], endDate: '' }

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']

function formatSeriesSchedule(row: ClassRow): string {
  const days = row.seriesDays.map(d => DAY_LABELS[d]).join(', ')
  const time = new Date(row.datetime).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${days} ${time}`
}

function formatSeriesInterval(row: ClassRow): string {
  const start = new Date(row.seriesStart).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
  const end = new Date(row.seriesEnd).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
  return `${start} – ${end}`
}

type ModalMode = 'none' | 'create' | 'edit-individual' | 'edit-series'

export function TrainerClasses() {
  const navigate = useNavigate()
  const { profile } = useAuthContext()
  const { data: rawClasses } = useTrainerClasses()
  const createClass = useCreateClass()
  const createClasses = useCreateClasses()
  const updateClass = useUpdateClass()
  const updateSeries = useUpdateClassSeries()

  const [modalMode, setModalMode] = useState<ModalMode>('none')
  const [editingIndividual, setEditingIndividual] = useState<Class | null>(null)
  const [editingSeries, setEditingSeries] = useState<ClassRow | null>(null)
  const [instancesTarget, setInstancesTarget] = useState<ClassRow | null>(null)

  const [form, setForm] = useState({ name: '', datetime: '', capacity: '', location: 'Sala 1' })
  const [seriesForm, setSeriesForm] = useState({ name: '', time: '', capacity: '', location: '', cancelAll: false })
  const [recurrence, setRecurrence] = useState<RecurrenceState>(EMPTY_RECURRENCE)
  const [formError, setFormError] = useState<string | null>(null)

  const rows = rawClasses ? groupClassesBySeries(rawClasses) : []

  function openCreate() {
    setForm({ name: '', datetime: '', capacity: '', location: 'Sala 1' })
    setRecurrence(EMPTY_RECURRENCE)
    setFormError(null)
    setModalMode('create')
  }

  function openEditIndividual(cls: Class) {
    setEditingIndividual(cls)
    setForm({
      name: cls.name,
      datetime: cls.datetime.slice(0, 16),
      capacity: String(cls.capacity),
      location: cls.location,
    })
    setModalMode('edit-individual')
  }

  function openEditSeries(row: ClassRow) {
    setEditingSeries(row)
    const time = new Date(row.datetime).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', hour12: false })
    setSeriesForm({ name: row.name, time, capacity: String(row.capacity), location: row.location, cancelAll: false })
    setModalMode('edit-series')
  }

  async function handleSaveCreate(e: React.FormEvent) {
    e.preventDefault()
    const base = {
      name: form.name,
      instructor: profile!.full_name,
      capacity: parseInt(form.capacity),
      location: form.location,
    }
    if (recurrence.enabled) {
      const groupId = crypto.randomUUID()
      const occurrences = generateOccurrences(form.datetime, recurrence.days, recurrence.endDate, {
        ...base,
        recurrence_group_id: groupId,
      })
      if (occurrences.length === 0) {
        setFormError('Nicio apariție în intervalul selectat. Verifică zilele și data de final.')
        return
      }
      setFormError(null)
      await createClasses.mutateAsync(occurrences)
    } else {
      await createClass.mutateAsync({ ...base, datetime: new Date(form.datetime).toISOString() })
    }
    setModalMode('none')
  }

  async function handleSaveIndividual(e: React.FormEvent) {
    e.preventDefault()
    if (!editingIndividual) return
    await updateClass.mutateAsync({
      id: editingIndividual.id,
      name: form.name,
      instructor: profile!.full_name,
      capacity: parseInt(form.capacity),
      location: form.location,
      datetime: new Date(form.datetime).toISOString(),
      is_cancelled: editingIndividual.is_cancelled,
    })
    setModalMode('none')
  }

  async function handleSaveSeries(e: React.FormEvent) {
    e.preventDefault()
    if (!editingSeries?.recurrence_group_id) return
    await updateSeries.mutateAsync({
      recurrenceGroupId: editingSeries.recurrence_group_id,
      updates: {
        name: seriesForm.name,
        time: seriesForm.time,
        capacity: parseInt(seriesForm.capacity),
        location: seriesForm.location,
        ...(seriesForm.cancelAll ? { is_cancelled: true } : {}),
      },
    })
    setModalMode('none')
  }

  const isSaving =
    createClass.isPending || createClasses.isPending ||
    updateClass.isPending || updateSeries.isPending
  const recurrenceInvalid = recurrence.enabled && (recurrence.days.length === 0 || !recurrence.endDate)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clasele mele</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Clasă nouă</Button>
      </div>

      <Table
        data={rows}
        emptyMessage="Nicio clasă creată încă."
        columns={[
          {
            key: 'name',
            header: 'Clasă',
            render: row => <span className="font-medium">{row.name}</span>,
          },
          {
            key: 'schedule',
            header: 'Program',
            render: row =>
              (row as ClassRow).isSeries
                ? formatSeriesSchedule(row as ClassRow)
                : new Date(row.datetime).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' }),
          },
          {
            key: 'interval',
            header: 'Interval',
            render: row =>
              (row as ClassRow).isSeries ? formatSeriesInterval(row as ClassRow) : '—',
          },
          { key: 'capacity', header: 'Locuri', render: row => `${row.bookings_count ?? 0} / ${row.capacity}` },
          { key: 'location', header: 'Locație', render: row => row.location },
          {
            key: 'status',
            header: 'Status',
            render: row => {
              if ((row as ClassRow).isSeries) {
                const allCancelled = (row as ClassRow).instances.every(i => i.is_cancelled)
                return allCancelled
                  ? <Badge color="red">Anulată</Badge>
                  : <Badge color="green">Activă</Badge>
              }
              return row.is_cancelled
                ? <Badge color="red">Anulată</Badge>
                : <Badge color="green">Activă</Badge>
            },
          },
          {
            key: 'actions',
            header: '',
            render: row => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    (row as ClassRow).isSeries
                      ? openEditSeries(row as ClassRow)
                      : openEditIndividual(row as Class)
                  }
                >
                  Editează
                </Button>
                {(row as ClassRow).isSeries ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInstancesTarget(row as ClassRow)}
                  >
                    Instanțe
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/trainer/classes/${row.id}`)}
                  >
                    Înscrieri
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Create modal */}
      <Modal open={modalMode === 'create'} onClose={() => setModalMode('none')} title="Clasă nouă">
        <form onSubmit={handleSaveCreate} className="space-y-4">
          <Input label="Tip clasă" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="CrossFit, Yoga..." required />
          <Input label="Data și ora" type="datetime-local" value={form.datetime} onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))} required />
          <Input label="Capacitate maximă" type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required />
          <Input label="Locație" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
          <RecurrenceFields value={recurrence} onChange={setRecurrence} startDate={form.datetime.slice(0, 10)} />
          {formError && <p className="text-sm text-red-400">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setModalMode('none')}>Anulează</Button>
            <Button type="submit" loading={isSaving} disabled={recurrenceInvalid}>Salvează</Button>
          </div>
        </form>
      </Modal>

      {/* Edit individual modal */}
      <Modal open={modalMode === 'edit-individual'} onClose={() => setModalMode('none')} title="Editează clasa">
        <form onSubmit={handleSaveIndividual} className="space-y-4">
          <Input label="Tip clasă" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Data și ora" type="datetime-local" value={form.datetime} onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))} required />
          <Input label="Capacitate maximă" type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required />
          <Input label="Locație" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
          {editingIndividual && (
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                className="accent-red-600"
                checked={editingIndividual.is_cancelled}
                onChange={e => setEditingIndividual(prev => prev ? { ...prev, is_cancelled: e.target.checked } : null)}
              />
              Marchează ca anulată
            </label>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setModalMode('none')}>Anulează</Button>
            <Button type="submit" loading={isSaving}>Salvează</Button>
          </div>
        </form>
      </Modal>

      {/* Edit series modal */}
      <Modal open={modalMode === 'edit-series'} onClose={() => setModalMode('none')} title="Editează seria">
        <form onSubmit={handleSaveSeries} className="space-y-4">
          <Input label="Tip clasă" value={seriesForm.name} onChange={e => setSeriesForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Ora (HH:MM)" type="time" value={seriesForm.time} onChange={e => setSeriesForm(f => ({ ...f, time: e.target.value }))} required />
          <Input label="Capacitate maximă" type="number" value={seriesForm.capacity} onChange={e => setSeriesForm(f => ({ ...f, capacity: e.target.value }))} required />
          <Input label="Locație" value={seriesForm.location} onChange={e => setSeriesForm(f => ({ ...f, location: e.target.value }))} required />
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              className="accent-red-600"
              checked={seriesForm.cancelAll}
              onChange={e => setSeriesForm(f => ({ ...f, cancelAll: e.target.checked }))}
            />
            Anulează toată seria
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setModalMode('none')}>Anulează</Button>
            <Button type="submit" loading={isSaving}>Salvează</Button>
          </div>
        </form>
      </Modal>

      <ClassInstancesModal
        series={instancesTarget}
        onClose={() => setInstancesTarget(null)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify build compiles**

```bash
cd /Users/filimoncristian/Sites/fightclub/gym-members && PATH="/usr/local/opt/node/bin:$PATH" npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/filimoncristian/Sites/fightclub/gym-members
git add src/pages/trainer/Classes.tsx
git commit -m "feat: trainer classes series view with edit-series modal and Instante button"
```

---

## Self-Review

**Spec coverage:**
- ✅ DB migration: `recurrence_group_id UUID` — Task 1 Step 1
- ✅ `Class` type update + `ClassRow` type — Task 1 Step 3
- ✅ `generateOccurrences` accepts `recurrence_group_id` in base — Task 1 Step 4
- ✅ `groupClassesBySeries()` — Task 1 Step 4
- ✅ `useTrainers` hook — Task 2 Step 1
- ✅ `useSeriesInstances` — Task 2 Step 2
- ✅ `useUpdateClassSeries` with time-update logic — Task 2 Step 2
- ✅ `ClassInstancesModal` — Task 3
- ✅ Admin series view with series/individual rows — Task 4
- ✅ Admin trainer `<select>` — Task 4
- ✅ Admin edit series modal — Task 4
- ✅ Admin Instanțe button — Task 4
- ✅ Trainer series view — Task 5
- ✅ Trainer edit series modal (no instructor field) — Task 5
- ✅ Trainer Instanțe button — Task 5
- ✅ Înscrieri only for non-series rows — Task 5
- ✅ Series status: Anulată only if all instances cancelled — Tasks 4 & 5
- ✅ `crypto.randomUUID()` for group ID on create — Tasks 4 & 5

**Placeholder scan:** No TBD, TODO, or vague requirements found.

**Type consistency:**
- `ClassRow` defined in Task 1 Step 3, used in Tasks 3, 4, 5 — consistent
- `useUpdateClassSeries` defined in Task 2 Step 2, imported in Tasks 4 & 5 — consistent
- `groupClassesBySeries` defined in Task 1 Step 4, imported in Tasks 4 & 5 — consistent
- `recurrence_group_id` in `generateOccurrences` base parameter — consistent in Tasks 1, 4, 5
