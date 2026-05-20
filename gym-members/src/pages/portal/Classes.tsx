import { useAuthContext } from '../../contexts/AuthContext'
import { useUpcomingClasses } from '../../hooks/useClasses'
import { useMyBookings, useCreateBooking, useCancelBooking } from '../../hooks/useBookings'
import { useMemberSubscription } from '../../hooks/useSubscriptions'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

export function PortalClasses() {
  const { profile } = useAuthContext()
  const { data: classes } = useUpcomingClasses()
  const { data: myBookings } = useMyBookings(profile!.id)
  const { data: sub } = useMemberSubscription(profile!.id)
  const createBooking = useCreateBooking()
  const cancelBooking = useCancelBooking()

  const myBookingMap = new Map(myBookings?.map(b => [b.class_id, b]) ?? [])
  const hasActiveSub = sub?.status === 'active'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Clase disponibile</h1>
      {!hasActiveSub && (
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg px-4 py-3 text-sm text-yellow-400">
          Ai nevoie de un abonament activ pentru a rezerva clase.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes?.map(cls => {
          const booking = myBookingMap.get(cls.id)
          const isBooked = booking?.status === 'confirmed'
          const isFull = (cls.bookings_count ?? 0) >= cls.capacity
          return (
            <Card key={cls.id}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-white text-lg">{cls.name}</h3>
                {isBooked
                  ? <Badge color="green">Rezervat</Badge>
                  : isFull
                  ? <Badge color="red">Complet</Badge>
                  : <Badge color="zinc">{cls.capacity - (cls.bookings_count ?? 0)} locuri</Badge>}
              </div>
              <p className="text-sm text-zinc-400">{cls.instructor} · {cls.location}</p>
              <p className="text-sm text-zinc-300 mt-1 font-medium">
                {new Date(cls.datetime).toLocaleString('ro-RO', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
              <div className="mt-4">
                {isBooked ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => cancelBooking.mutate({ bookingId: booking!.id, memberId: profile!.id })}
                    loading={cancelBooking.isPending}
                  >
                    Anulează rezervarea
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={isFull || !hasActiveSub}
                    onClick={() => createBooking.mutate({ member_id: profile!.id, class_id: cls.id })}
                    loading={createBooking.isPending}
                  >
                    Rezervă loc
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
        {classes?.length === 0 && <p className="text-zinc-500 text-sm col-span-2">Nicio clasă disponibilă momentan.</p>}
      </div>
    </div>
  )
}
