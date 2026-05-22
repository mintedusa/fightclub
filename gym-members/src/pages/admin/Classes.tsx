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
  const time = new Date(row.datetime).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', hour12: false })
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
