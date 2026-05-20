import { useAuthContext } from '../../contexts/AuthContext'
import { useMemberSubscription } from '../../hooks/useSubscriptions'
import { useMyBookings } from '../../hooks/useBookings'
import { useMemberCheckIns } from '../../hooks/useCheckIn'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
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
                <span className="text-xl font-bold text-white">{sub.plan!.name}</span>
                <Badge color={color}>{days! > 0 ? `${days} zile rămase` : 'Expirat'}</Badge>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.max(0, Math.min(100, (days! / sub.plan!.duration_days) * 100))}%` }}
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
