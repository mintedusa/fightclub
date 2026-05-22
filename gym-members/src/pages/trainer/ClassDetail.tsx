import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { useClassBookings, useTrainerClasses } from '../../hooks/useClasses'

type BookingWithMember = {
  id: string
  status: string
  class_id: string
  created_at: string
  member: {
    full_name: string
    email: string
    phone: string | null
  } | null
}

export function TrainerClassDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: trainerClasses } = useTrainerClasses()
  const ownsClass = trainerClasses?.some(c => c.id === id)
  const { data: rawBookings, isLoading } = useClassBookings(id!)
  const bookings = rawBookings as unknown as BookingWithMember[] | undefined

  // Redirect if trainer doesn't own this class (once classes have loaded)
  if (trainerClasses && !ownsClass) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/trainer/classes')}>
          <ArrowLeft className="h-4 w-4" /> Înapoi
        </Button>
        <p className="text-red-400 text-sm">Clasă negăsită sau nu ești instructorul acestei clase.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/trainer/classes')}>
          <ArrowLeft className="h-4 w-4" /> Înapoi
        </Button>
        <h1 className="text-2xl font-bold text-white">Membri înscriși</h1>
      </div>

      {isLoading ? (
        <p className="text-zinc-500 text-sm">Se încarcă...</p>
      ) : (
        <Table
          data={bookings ?? []}
          emptyMessage="Niciun membru înscris."
          columns={[
            { key: 'name', header: 'Nume', render: b => <span className="font-medium">{b.member?.full_name}</span> },
            { key: 'email', header: 'Email', render: b => <span className="text-zinc-400">{b.member?.email}</span> },
            { key: 'phone', header: 'Telefon', render: b => b.member?.phone ?? '—' },
            { key: 'status', header: 'Status', render: b => b.status === 'attended' ? <Badge color="green">Prezent</Badge> : <Badge color="red">Înscris</Badge> },
          ]}
        />
      )}
    </div>
  )
}
