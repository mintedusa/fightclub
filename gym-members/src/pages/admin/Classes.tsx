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
            <Button type="submit" disabled={recurrenceInvalid} loading={isSaving}>Salvează</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
