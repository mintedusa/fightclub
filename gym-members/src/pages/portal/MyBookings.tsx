import { useAuthContext } from '../../contexts/AuthContext'
import { useMyBookings, useCancelBooking } from '../../hooks/useBookings'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

export function PortalMyBookings() {
  const { profile } = useAuthContext()
  const { data: bookings } = useMyBookings(profile!.id)
  const cancelBooking = useCancelBooking()

  const upcoming = bookings?.filter(b => b.status === 'confirmed' && b.class && new Date(b.class.datetime) > new Date()) ?? []
  const past = bookings?.filter(b => b.status !== 'confirmed' || (b.class && new Date(b.class.datetime) <= new Date())) ?? []

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Rezervările mele</h1>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Viitoare</h2>
        {upcoming.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nicio rezervare viitoare.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(b => (
              <Card key={b.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{b.class?.name}</p>
                  <p className="text-sm text-zinc-400">
                    {new Date(b.class!.datetime).toLocaleString('ro-RO', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                  <p className="text-sm text-zinc-500">{b.class?.instructor} · {b.class?.location}</p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => cancelBooking.mutate({ bookingId: b.id, memberId: profile!.id })}
                  loading={cancelBooking.isPending}
                >
                  Anulează
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Trecute</h2>
        {past.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nicio rezervare trecută.</p>
        ) : (
          <div className="space-y-2">
            {past.map(b => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-zinc-300">{b.class?.name}</p>
                  <p className="text-xs text-zinc-500">{b.class && new Date(b.class.datetime).toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
                <Badge color={b.status === 'attended' ? 'green' : b.status === 'cancelled' ? 'red' : 'zinc'}>
                  {b.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
