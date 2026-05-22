import { useState } from 'react'
import { Search, CheckCircle } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useMembers } from '../../hooks/useMembers'
import { useMemberSubscription } from '../../hooks/useSubscriptions'
import { useCreateCheckIn, useTodayCheckIns } from '../../hooks/useCheckIn'
import { useAuthContext } from '../../contexts/AuthContext'
import { getDaysRemaining, getSubscriptionStatusColor } from '../../lib/utils'
import type { Profile } from '../../types'

type CheckInWithMember = {
  id: string
  checked_in_at: string
  member: { full_name: string; email: string } | null
}

function MemberCheckInCard({ member, adminId }: { member: Profile; adminId: string }) {
  const { data: sub } = useMemberSubscription(member.id)
  const checkIn = useCreateCheckIn()
  const [done, setDone] = useState(false)

  const days = sub ? getDaysRemaining(sub.end_date) : null
  const color = sub ? getSubscriptionStatusColor(sub.status, days!) : 'red'

  async function handleCheckIn() {
    await checkIn.mutateAsync({ member_id: member.id, checked_in_by: adminId })
    setDone(true)
  }

  return (
    <Card className="flex items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-white">{member.full_name}</p>
        <p className="text-sm text-zinc-400">{member.email}</p>
        <div className="mt-1">
          {sub ? (
            <Badge color={color}>{sub.plan?.name} · {days} zile rămase</Badge>
          ) : (
            <Badge color="red">Fără abonament activ</Badge>
          )}
        </div>
      </div>
      {done ? (
        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
          <CheckCircle className="h-5 w-5" /> Check-in OK
        </div>
      ) : (
        <Button onClick={handleCheckIn} loading={checkIn.isPending} disabled={!sub}>
          Check-in
        </Button>
      )}
    </Card>
  )
}

export function AdminCheckIn() {
  const { profile } = useAuthContext()
  const [search, setSearch] = useState('')
  const { data: members } = useMembers(search)
  const { data: todayCheckIns } = useTodayCheckIns()

  const results = search.trim().length >= 2 ? members ?? [] : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Check-in</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md pl-10 pr-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Caută după nume sau email (minim 2 caractere)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map(m => (
            <MemberCheckInCard key={m.id} member={m} adminId={profile!.id} />
          ))}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Check-in-uri azi ({todayCheckIns?.length ?? 0})</h2>
        <div className="space-y-2">
          {(todayCheckIns as unknown as CheckInWithMember[])?.map(c => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm">
              <span className="text-white font-medium">{c.member?.full_name}</span>
              <span className="text-zinc-400">{new Date(c.checked_in_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
          {todayCheckIns?.length === 0 && <p className="text-zinc-500 text-sm">Nicio intrare înregistrată azi.</p>}
        </div>
      </div>
    </div>
  )
}
