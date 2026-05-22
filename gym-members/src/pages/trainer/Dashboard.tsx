import { useTrainerStats } from '../../hooks/useTrainerStats'
import { useTrainerClasses } from '../../hooks/useClasses'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuthContext } from '../../contexts/AuthContext'

export function TrainerDashboard() {
  const { profile } = useAuthContext()
  const { data: stats } = useTrainerStats()
  const { data: classes } = useTrainerClasses()

  const upcoming = (classes ?? [])
    .filter(c => !c.is_cancelled && new Date(c.datetime) > new Date())
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bună, {profile?.full_name}!</h1>
        <p className="text-zinc-400 text-sm mt-1">Iată un rezumat al activității tale</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-zinc-400">Total clase</p>
          <p className="text-3xl font-bold text-white mt-1">{stats?.totalClasses ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-400">Clase viitoare</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{stats?.upcomingClasses ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-400">Total înscrieri active</p>
          <p className="text-3xl font-bold text-white mt-1">{stats?.totalEnrolled ?? 0}</p>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Următoarele clase</h2>
        {upcoming.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nicio clasă viitoare programată.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map(cls => (
              <Card key={cls.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{cls.name}</p>
                    <p className="text-sm text-zinc-400">
                      {new Date(cls.datetime).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' })}
                      {' · '}{cls.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">{cls.bookings_count ?? 0} / {cls.capacity}</p>
                    <Badge color="green">Activă</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
