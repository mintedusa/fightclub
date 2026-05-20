import { useAuthContext } from '../../contexts/AuthContext'
import { useMemberSubscription, useMemberSubscriptionHistory } from '../../hooks/useSubscriptions'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
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
              <span className="text-2xl font-bold text-white">{sub.plan!.name}</span>
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
                <p className="text-white">{sub.plan!.duration_days} zile</p>
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
                <span className="text-zinc-300">{s.plan!.name}</span>
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
