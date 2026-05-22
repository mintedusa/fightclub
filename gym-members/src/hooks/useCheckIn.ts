import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { CheckIn } from '../types'

export function useTodayCheckIns() {
  const today = new Date().toISOString().split('T')[0]
  return useQuery({
    queryKey: ['checkins', 'today'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkins')
        .select('*, member:profiles(full_name, email)')
        .gte('checked_in_at', `${today}T00:00:00`)
        .order('checked_in_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useMemberCheckIns(memberId: string, limit = 30) {
  return useQuery({
    queryKey: ['checkins', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('member_id', memberId)
        .order('checked_in_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data as CheckIn[]
    },
  })
}

export function useCreateCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ member_id, checked_in_by }: { member_id: string; checked_in_by: string }) => {
      // Server-side guard: verify active subscription before inserting check-in
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('member_id', member_id)
        .eq('status', 'active')
        .maybeSingle()
      if (subError) throw subError
      if (!sub) throw new Error('Membrul nu are abonament activ.')
      const { error } = await supabase.from('checkins').insert({ member_id, checked_in_by })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checkins'] }),
  })
}
