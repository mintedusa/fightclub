import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Class } from '../types'

export function useUpcomingClasses() {
  return useQuery({
    queryKey: ['classes', 'upcoming'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*, bookings_count:bookings(count)')
        .gte('datetime', new Date().toISOString())
        .eq('is_cancelled', false)
        .order('datetime')
      if (error) throw error
      return (data ?? []).map(c => ({
        ...c,
        bookings_count: (c.bookings_count as unknown as { count: number }[])[0]?.count ?? 0,
      })) as Class[]
    },
  })
}

export function useAllClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*, bookings_count:bookings(count)')
        .order('datetime', { ascending: false })
      if (error) throw error
      return (data ?? []).map(c => ({
        ...c,
        bookings_count: (c.bookings_count as unknown as { count: number }[])[0]?.count ?? 0,
      })) as Class[]
    },
  })
}

export function useCreateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Class, 'id' | 'is_cancelled' | 'bookings_count'>) => {
      const { error } = await supabase.from('classes').insert({ ...data, is_cancelled: false })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      qc.invalidateQueries({ queryKey: ['trainer-classes'] })
      qc.invalidateQueries({ queryKey: ['trainer-stats'] })
    },
  })
}

export function useCreateClasses() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Class, 'id' | 'is_cancelled' | 'bookings_count'>[]) => {
      const { error } = await supabase
        .from('classes')
        .insert(data.map(c => ({ ...c, is_cancelled: false })))
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      qc.invalidateQueries({ queryKey: ['trainer-classes'] })
      qc.invalidateQueries({ queryKey: ['trainer-stats'] })
    },
  })
}

export function useUpdateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Class> & { id: string }) => {
      const { error } = await supabase.from('classes').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      qc.invalidateQueries({ queryKey: ['trainer-classes'] })
      qc.invalidateQueries({ queryKey: ['trainer-stats'] })
    },
  })
}

export function useTrainerClasses() {
  return useQuery({
    queryKey: ['trainer-classes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (!profile) return []
      const { data, error } = await supabase
        .from('classes')
        .select('*, bookings_count:bookings(count)')
        .eq('instructor', profile.full_name)
        .order('datetime', { ascending: false })
      if (error) throw error
      return (data ?? []).map(c => ({
        ...c,
        bookings_count: (c.bookings_count as unknown as { count: number }[])[0]?.count ?? 0,
      })) as Class[]
    },
  })
}

export function useClassBookings(classId: string) {
  return useQuery({
    queryKey: ['class-bookings', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, member:profiles(full_name, email, phone)')
        .eq('class_id', classId)
        .neq('status', 'cancelled')
        .order('created_at')
      if (error) throw error
      return data
    },
  })
}

export function useSeriesInstances(recurrenceGroupId: string | null | undefined) {
  return useQuery({
    queryKey: ['series-instances', recurrenceGroupId],
    enabled: !!recurrenceGroupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*, bookings_count:bookings(count)')
        .eq('recurrence_group_id', recurrenceGroupId!)
        .order('datetime')
      if (error) throw error
      return (data ?? []).map(c => ({
        ...c,
        bookings_count: (c.bookings_count as unknown as { count: number }[])[0]?.count ?? 0,
      })) as Class[]
    },
  })
}

export function useUpdateClassSeries() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      recurrenceGroupId,
      updates,
    }: {
      recurrenceGroupId: string
      updates: {
        name?: string
        instructor?: string
        time?: string   // "HH:mm"
        capacity?: number
        location?: string
        is_cancelled?: boolean
      }
    }) => {
      // Fetch all instances to update datetimes when time changes
      if (updates.time !== undefined) {
        const { data, error } = await supabase
          .from('classes')
          .select('id, datetime')
          .eq('recurrence_group_id', recurrenceGroupId)
        if (error) throw error

        const [hStr, mStr] = updates.time.split(':')
        const h = parseInt(hStr, 10)
        const m = parseInt(mStr, 10)

        const errors = await Promise.all(
          (data ?? []).map(async inst => {
            const dt = new Date(inst.datetime)
            // setHours uses local timezone — consistent with form input (toLocaleTimeString ro-RO)
            dt.setHours(h, m, 0, 0)
            const { error: updateError } = await supabase
              .from('classes')
              .update({ ...getCommonUpdates(updates), datetime: dt.toISOString() })
              .eq('id', inst.id)
            return updateError
          })
        )
        const firstError = errors.find(Boolean)
        if (firstError) throw firstError
      } else {
        const { error } = await supabase
          .from('classes')
          .update(getCommonUpdates(updates))
          .eq('recurrence_group_id', recurrenceGroupId)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      qc.invalidateQueries({ queryKey: ['trainer-classes'] })
      qc.invalidateQueries({ queryKey: ['series-instances'] })
    },
  })
}

function getCommonUpdates(updates: {
  name?: string
  instructor?: string
  capacity?: number
  location?: string
  is_cancelled?: boolean
}) {
  const result: Record<string, unknown> = {}
  if (updates.name !== undefined) result.name = updates.name
  if (updates.instructor !== undefined) result.instructor = updates.instructor
  if (updates.capacity !== undefined) result.capacity = updates.capacity
  if (updates.location !== undefined) result.location = updates.location
  if (updates.is_cancelled !== undefined) result.is_cancelled = updates.is_cancelled
  return result
}
