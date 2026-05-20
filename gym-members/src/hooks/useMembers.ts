import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export function useMembers(search?: string) {
  return useQuery({
    queryKey: ['members', search],
    queryFn: async () => {
      let q = supabase.from('profiles').select('*').eq('role', 'member').order('full_name')
      if (search) q = q.ilike('full_name', `%${search}%`)
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

function generateTempPassword() {
  const words = ['Gym', 'Club', 'Fight', 'Sport', 'Power']
  const word = words[Math.floor(Math.random() * words.length)]
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${word}${num}!`
}

export function useCreateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { email: string; full_name: string; phone?: string }) => {
      const tempPassword = generateTempPassword()

      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: tempPassword,
        options: { data: { full_name: data.full_name } },
      })
      if (signUpError) throw signUpError

      await supabase.rpc('admin_confirm_user', { user_email: data.email })

      if (data.phone) {
        await supabase.from('profiles').update({ phone: data.phone }).eq('email', data.email)
      }

      return { tempPassword }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  })
}

export function useUpdateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      const { error } = await supabase.from('profiles').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['members'] })
      qc.invalidateQueries({ queryKey: ['member', id] })
    },
  })
}
