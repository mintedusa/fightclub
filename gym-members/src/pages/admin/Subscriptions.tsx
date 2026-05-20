import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
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
