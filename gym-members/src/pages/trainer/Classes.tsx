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
