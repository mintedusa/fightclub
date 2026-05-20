import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { useMember } from '../../hooks/useMembers'
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
                <span className="text-white font-medium">{activeSub.plan!.name}</span>
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
                <span className="text-zinc-300">{s.plan!.name}</span>
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
