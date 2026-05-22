import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useTrainerStats() {
  return useQuery({
    queryKey: ['trainer-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { totalClasses: 0, upcomingClasses: 0, totalEnrolled: 0 }
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (!profile) return { totalClasses: 0, upcomingClasses: 0, totalEnrolled: 0 }

      const now = new Date().toISOString()

      const [allClasses, upcomingClasses, trainerClassIds] = await Promise.all([
        supabase
          .from('classes')
          .select('id', { count: 'exact', head: true })
          .eq('instructor', profile.full_name),
        supabase
          .from('classes')
          .select('id', { count: 'exact', head: true })
          .eq('instructor', profile.full_name)
          .eq('is_cancelled', false)
          .gte('datetime', now),
        supabase
          .from('classes')
          .select('id')
          .eq('instructor', profile.full_name),
      ])

      const classIds = (trainerClassIds.data ?? []).map(c => c.id)

      const bookings = classIds.length > 0
        ? await supabase
            .from('bookings')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'confirmed')
            .in('class_id', classIds)
        : { count: 0 }

      return {
        totalClasses: allClasses.count ?? 0,
        upcomingClasses: upcomingClasses.count ?? 0,
        totalEnrolled: bookings.count ?? 0,
      }
    },
  })
}
