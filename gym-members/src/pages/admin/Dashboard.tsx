import { Users, Clock, LogIn } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { useAdminStats, useExpiringSubscriptions } from '../../hooks/useAdminStats'
import { getDaysRemaining, formatDate } from '../../lib/utils'

export function AdminDashboard() {
  const { data: stats } = useAdminStats()
  const { data: expiring } = useExpiringSubscriptions()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-900/30 rounded-lg"><Users className="h-6 w-6 text-green-400" /></div>
            <div>
              <p className="text-3xl font-bold text-white">{stats?.activeMembers ?? '—'}</p>
              <p className="text-sm text-zinc-400">Membri activi</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-900/30 rounded-lg"><Clock className="h-6 w-6 text-yellow-400" /></div>
            <div>
              <p className="text-3xl font-bold text-white">{stats?.expiringCount ?? '—'}</p>
              <p className="text-sm text-zinc-400">Expiră în 7 zile</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-lg"><LogIn className="h-6 w-6 text-blue-400" /></div>
            <div>
              <p className="text-3xl font-bold text-white">{stats?.todayCheckIns ?? '—'}</p>
              <p className="text-sm text-zinc-400">Check-in-uri azi</p>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Abonamente ce expiră în 7 zile</h2>
        <Table
          data={expiring ?? []}
          emptyMessage="Niciun abonament nu expiră în 7 zile."
          columns={[
            { key: 'name', header: 'Membru', render: (r: any) => <span className="font-medium">{r.member.full_name}</span> },
            { key: 'plan', header: 'Plan', render: (r: any) => r.plan.name },
            { key: 'end_date', header: 'Expiră', render: (r: any) => formatDate(r.end_date) },
            {
              key: 'days', header: 'Zile rămase', render: (r: any) => {
                const days = getDaysRemaining(r.end_date)
                return <Badge color={days <= 3 ? 'red' : 'yellow'}>{days} zile</Badge>
              }
            },
          ]}
        />
      </div>
    </div>
  )
}
