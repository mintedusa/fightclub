import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Booking } from '../types'

export function useMyBookings(memberId: string) {
  return useQuery({
    queryKey: ['bookings', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, class:classes(*)')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Booking[]
    },
  })
}

export function useClassBookings(classId: string) {
  return useQuery({
    queryKey: ['bookings', 'class', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, member:profiles(*)')
        .eq('class_id', classId)
        .neq('status', 'cancelled')
      if (error) throw error
      return data
    },
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ member_id, class_id }: { member_id: string; class_id: string }) => {
      const { error } = await supabase
        .from('bookings')
        .insert({ member_id, class_id, status: 'confirmed' })
      if (error) throw error
    },
    onSuccess: (_d, { member_id }) => qc.invalidateQueries({ queryKey: ['bookings', member_id] }),
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ bookingId, memberId }: { bookingId: string; memberId: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
      if (error) throw error
      return memberId
    },
    onSuccess: (_d, { memberId }) => qc.invalidateQueries({ queryKey: ['bookings', memberId] }),
  })
}
