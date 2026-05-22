import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export function useMembers(search?: string, role?: 'member' | 'trainer') {
  return useQuery({
    queryKey: ['members', search, role],
    queryFn: async () => {
      let q = supabase.from('profiles').select('*').neq('role', 'admin').order('full_name')
      if (role) q = q.eq('role', role)
      if (search) {
        // Strip characters that have meaning in PostgREST filter syntax before interpolation
        const safe = search.replace(/[(),"]/g, '').slice(0, 100)
        if (safe) q = q.or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%`)
      }
      const { data, error } = await q
      if (error) throw error
      return data as Profile[]
    },
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['member', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
      if (error) throw error
      return data as Profile
    },
  })
}

export function useCreateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { email: string; full_name: string; phone?: string; password: string; role: 'member' | 'trainer' }) => {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.full_name } },
      })
      if (signUpError) throw signUpError

      await supabase.rpc('admin_confirm_user', { user_email: data.email })

      const profileUpdate: Record<string, unknown> = {}
      if (data.role === 'trainer') profileUpdate.role = 'trainer'
      if (data.phone) profileUpdate.phone = data.phone
      if (Object.keys(profileUpdate).length > 0) {
        const { error: updateError } = await supabase.from('profiles').update(profileUpdate).eq('email', data.email)
        if (updateError) throw updateError
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  })
}

export function useUpdateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      // Strip role from client-side updates — role changes must go through admin RPC or direct DB
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { role: _role, ...safeUpdates } = updates as Partial<Profile>
      const { error } = await supabase.from('profiles').update(safeUpdates).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['members'] })
      qc.invalidateQueries({ queryKey: ['member', id] })
    },
  })
}
