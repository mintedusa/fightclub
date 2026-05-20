import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [activeCount, expiringCount, todayCheckIns] = await Promise.all([
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true })
          .eq('status', 'active').lte('end_date', in7Days),
        supabase.from('checkins').select('id', { count: 'exact', head: true })
          .gte('checked_in_at', `${today}T00:00:00`),
      ])

      return {
        activeMembers: activeCount.count ?? 0,
        expiringCount: expiringCount.count ?? 0,
        todayCheckIns: todayCheckIns.count ?? 0,
      }
    },
  })
}

export function useExpiringSubscriptions() {
  return useQuery({
    queryKey: ['expiring-subscriptions'],
    queryFn: async () => {
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, member:profiles(full_name, email), plan:subscription_plans(name)')
        .eq('status', 'active')
        .lte('end_date', in7Days)
        .order('end_date')
      if (error) throw error
      return data
    },
  })
}
