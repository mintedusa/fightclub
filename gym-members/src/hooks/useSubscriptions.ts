import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Subscription, SubscriptionPlan } from '../types'

export function useMemberSubscription(memberId: string) {
  return useQuery({
    queryKey: ['subscription', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('member_id', memberId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as (Subscription & { plan: SubscriptionPlan }) | null
    },
  })
}

export function useMemberSubscriptionHistory(memberId: string) {
  return useQuery({
    queryKey: ['subscriptions', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as (Subscription & { plan: SubscriptionPlan })[]
    },
  })
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price')
      if (error) throw error
      return data as SubscriptionPlan[]
    },
  })
}

export function useAllPlans() {
  return useQuery({
    queryKey: ['plans', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subscription_plans').select('*').order('price')
      if (error) throw error
      return data as SubscriptionPlan[]
    },
  })
}

export function useAssignSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      member_id: string
      plan_id: string
      start_date: string
      end_date: string
      amount_paid: number
      notes?: string
    }) => {
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('member_id', data.member_id)
        .eq('status', 'active')

      const { error } = await supabase.from('subscriptions').insert({ ...data, status: 'active' })
      if (error) throw error
    },
    onSuccess: (_d, { member_id }) => {
      qc.invalidateQueries({ queryKey: ['subscription', member_id] })
      qc.invalidateQueries({ queryKey: ['subscriptions', member_id] })
    },
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<SubscriptionPlan, 'id'>) => {
      const { error } = await supabase.from('subscription_plans').insert(data)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SubscriptionPlan> & { id: string }) => {
      const { error } = await supabase.from('subscription_plans').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  })
}
