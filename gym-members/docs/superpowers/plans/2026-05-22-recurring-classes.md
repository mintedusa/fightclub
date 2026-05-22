# Recurring Classes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a recurring class option to create modals in both admin and trainer zones — user picks days of week + end date, frontend generates all occurrences and batch-inserts them.

**Architecture:** Pure client-side date generation in `src/lib/recurrence.ts`. A shared `RecurrenceFields` UI component handles the checkbox + day toggles + end date. Both create modals call `useCreateClasses` (new batch mutation) when recurrence is enabled, the existing `useCreateClass` otherwise.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, Supabase JS v2, TailwindCSS v4.

---

## File Map

**New files:**
- `src/lib/recurrence.ts` — pure `generateOccurrences` function + `RecurrenceState` type
- `src/components/ui/RecurrenceFields.tsx` — controlled UI component (checkbox + day toggles + end date)

**Modified files:**
- `src/hooks/useClasses.ts` — add `useCreateClasses` batch mutation
- `src/pages/admin/Classes.tsx` — integrate recurrence into create modal
- `src/pages/trainer/Classes.tsx` — integrate recurrence into create modal

---

### Task 1: `recurrence.ts` utility + `useCreateClasses` hook

**Files:**
- Create: `src/lib/recurrence.ts`
- Modify: `src/hooks/useClasses.ts`

- [ ] **Step 1: Create `src/lib/recurrence.ts`**

```ts
import type { Class } from '../types'

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
  base: Omit<ClassInput, 'datetime'>
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
```

- [ ] **Step 2: Add `useCreateClasses` to `src/hooks/useClasses.ts`**

Append after `useCreateClass` (after line 54):

```ts
export function useCreateClasses() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Class, 'id' | 'is_cancelled' | 'bookings_count'>[]) => {
      const { error } = await supabase
        .from('classes')
        .insert(data.map(c => ({ ...c, is_cancelled: false })))
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      qc.invalidateQueries({ queryKey: ['trainer-classes'] })
      qc.invalidateQueries({ queryKey: ['trainer-stats'] })
    },
  })
}
```

- [ ] **Step 3: Verify build**

```bash
PATH="/usr/local/opt/node/bin:$PATH" npm run build
```
Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/recurrence.ts src/hooks/useClasses.ts
git commit -m "feat: recurring classes — utility + batch insert hook"
```

---

### Task 2: `RecurrenceFields` component

**Files:**
- Create: `src/components/ui/RecurrenceFields.tsx`

- [ ] **Step 1: Create `src/components/ui/RecurrenceFields.tsx`**

```tsx
import type { RecurrenceState } from '../../lib/recurrence'

interface Props {
  value: RecurrenceState
  onChange: (v: RecurrenceState) => void
  startDate: string  // "YYYY-MM-DD" — used for min on endDate and day pre-selection
}

const DAY_LABELS = ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S']

export function RecurrenceFields({ value, onChange, startDate }: Props) {
  function toggleDay(day: number) {
    const days = value.days.includes(day)
      ? value.days.filter(d => d !== day)
      : [...value.days, day]
    onChange({ ...value, days })
  }

  function handleEnableToggle(checked: boolean) {
    if (checked && value.days.length === 0 && startDate) {
      const day = new Date(startDate + 'T12:00:00').getDay()
      onChange({ ...value, enabled: true, days: [day] })
    } else {
      onChange({ ...value, enabled: checked })
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
        <input
          type="checkbox"
          className="accent-red-600"
          checked={value.enabled}
          onChange={e => handleEnableToggle(e.target.checked)}
        />
        Recurent (săptămânal)
      </label>

      {value.enabled && (
        <>
          <div>
            <p className="text-sm font-medium text-zinc-300 mb-2">Zilele de repetiție</p>
            <div className="flex gap-1">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
                    value.days.includes(i)
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {value.days.length === 0 && (
              <p className="text-xs text-red-400 mt-1">Selectează cel puțin o zi</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Repetă până la
            </label>
            <input
              type="date"
              value={value.endDate}
              min={startDate}
              onChange={e => onChange({ ...value, endDate: e.target.value })}
              required
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-500"
            />
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
PATH="/usr/local/opt/node/bin:$PATH" npm run build
```
Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/RecurrenceFields.tsx
git commit -m "feat: RecurrenceFields component"
```

---

### Task 3: Admin Classes — integrate recurrence

**Files:**
- Modify: `src/pages/admin/Classes.tsx`

Current file is 106 lines. Replace it entirely with the version below.

- [ ] **Step 1: Replace `src/pages/admin/Classes.tsx`**

```tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import { RecurrenceFields } from '../../components/ui/RecurrenceFields'
import { useAllClasses, useCreateClass, useCreateClasses, useUpdateClass } from '../../hooks/useClasses'
import { generateOccurrences, type RecurrenceState } from '../../lib/recurrence'
import type { Class } from '../../types'

const EMPTY_RECURRENCE: RecurrenceState = { enabled: false, days: [], endDate: '' }

export function AdminClasses() {
  const { data: classes } = useAllClasses()
  const createClass = useCreateClass()
  const createClasses = useCreateClasses()
  const updateClass = useUpdateClass()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Class | null>(null)
  const [form, setForm] = useState({ name: '', instructor: '', datetime: '', capacity: '', location: 'Sala 1' })
  const [recurrence, setRecurrence] = useState<RecurrenceState>(EMPTY_RECURRENCE)

  function openCreate() {
    setEditing(null)
    setForm({ name: '', instructor: '', datetime: '', capacity: '', location: 'Sala 1' })
    setRecurrence(EMPTY_RECURRENCE)
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
    setRecurrence(EMPTY_RECURRENCE)
    setOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const base = {
      name: form.name,
      instructor: form.instructor,
      capacity: parseInt(form.capacity),
      location: form.location,
    }
    if (editing) {
      await updateClass.mutateAsync({
        id: editing.id,
        ...base,
        datetime: new Date(form.datetime).toISOString(),
        is_cancelled: editing.is_cancelled,
      })
    } else if (recurrence.enabled) {
      const occurrences = generateOccurrences(form.datetime, recurrence.days, recurrence.endDate, base)
      await createClasses.mutateAsync(occurrences)
    } else {
      await createClass.mutateAsync({ ...base, datetime: new Date(form.datetime).toISOString() })
    }
    setOpen(false)
  }

  const isSaving = createClass.isPending || createClasses.isPending || updateClass.isPending
  const recurrenceInvalid = recurrence.enabled && (recurrence.days.length === 0 || !recurrence.endDate)

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
          {editing ? (
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                className="accent-red-600"
                checked={editing.is_cancelled}
                onChange={e => setEditing(prev => prev ? { ...prev, is_cancelled: e.target.checked } : null)}
              />
              Marchează ca anulată
            </label>
          ) : (
            <RecurrenceFields
              value={recurrence}
              onChange={setRecurrence}
              startDate={form.datetime.slice(0, 10)}
            />
          )}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Anulează</Button>
            <Button type="submit" loading={isSaving} disabled={recurrenceInvalid}>Salvează</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
PATH="/usr/local/opt/node/bin:$PATH" npm run build
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/Classes.tsx
git commit -m "feat: recurring classes in admin create modal"
```

---

### Task 4: Trainer Classes — integrate recurrence

**Files:**
- Modify: `src/pages/trainer/Classes.tsx`

Same pattern as Task 3. Differences from admin: no `instructor` field (uses `profile!.full_name`); table has "Înscrieri" button.

- [ ] **Step 1: Replace `src/pages/trainer/Classes.tsx`**

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
import { useTrainerClasses, useCreateClass, useCreateClasses, useUpdateClass } from '../../hooks/useClasses'
import { generateOccurrences, type RecurrenceState } from '../../lib/recurrence'
import { useAuthContext } from '../../contexts/AuthContext'
import type { Class } from '../../types'

const EMPTY_RECURRENCE: RecurrenceState = { enabled: false, days: [], endDate: '' }

export function TrainerClasses() {
  const navigate = useNavigate()
  const { profile } = useAuthContext()
  const { data: classes } = useTrainerClasses()
  const createClass = useCreateClass()
  const createClasses = useCreateClasses()
  const updateClass = useUpdateClass()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Class | null>(null)
  const [form, setForm] = useState({ name: '', datetime: '', capacity: '', location: 'Sala 1' })
  const [recurrence, setRecurrence] = useState<RecurrenceState>(EMPTY_RECURRENCE)

  function openCreate() {
    setEditing(null)
    setForm({ name: '', datetime: '', capacity: '', location: 'Sala 1' })
    setRecurrence(EMPTY_RECURRENCE)
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
    setRecurrence(EMPTY_RECURRENCE)
    setOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const base = {
      name: form.name,
      instructor: profile!.full_name,
      capacity: parseInt(form.capacity),
      location: form.location,
    }
    if (editing) {
      await updateClass.mutateAsync({
        id: editing.id,
        ...base,
        datetime: new Date(form.datetime).toISOString(),
        is_cancelled: editing.is_cancelled,
      })
    } else if (recurrence.enabled) {
      const occurrences = generateOccurrences(form.datetime, recurrence.days, recurrence.endDate, base)
      await createClasses.mutateAsync(occurrences)
    } else {
      await createClass.mutateAsync({ ...base, datetime: new Date(form.datetime).toISOString() })
    }
    setOpen(false)
  }

  const isSaving = createClass.isPending || createClasses.isPending || updateClass.isPending
  const recurrenceInvalid = recurrence.enabled && (recurrence.days.length === 0 || !recurrence.endDate)

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
          {editing ? (
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                className="accent-red-600"
                checked={editing.is_cancelled}
                onChange={e => setEditing(prev => prev ? { ...prev, is_cancelled: e.target.checked } : null)}
              />
              Marchează ca anulată
            </label>
          ) : (
            <RecurrenceFields
              value={recurrence}
              onChange={setRecurrence}
              startDate={form.datetime.slice(0, 10)}
            />
          )}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Anulează</Button>
            <Button type="submit" loading={isSaving} disabled={recurrenceInvalid}>Salvează</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
PATH="/usr/local/opt/node/bin:$PATH" npm run build
```
Expected: clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/trainer/Classes.tsx
git commit -m "feat: recurring classes in trainer create modal"
```
