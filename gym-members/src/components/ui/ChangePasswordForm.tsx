import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Input } from './Input'
import { Button } from './Button'
import { Card } from './Card'

export function ChangePasswordForm() {
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setErrorMsg('Parolele nu coincid.')
      return
    }
    if (form.password.length < 6) {
      setErrorMsg('Parola trebuie să aibă minim 6 caractere.')
      return
    }
    setStatus('saving')
    setErrorMsg(null)
    const { error } = await supabase.auth.updateUser({ password: form.password })
    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      setStatus('done')
      setForm({ password: '', confirm: '' })
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <Card>
      <h2 className="text-base font-semibold text-white mb-4">Schimbă parola</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Parolă nouă"
          type="password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
          minLength={6}
        />
        <Input
          label="Confirmă parola"
          type="password"
          value={form.confirm}
          onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
          required
        />
        {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
        {status === 'done' && <p className="text-sm text-green-400">Parola a fost schimbată cu succes.</p>}
        <Button type="submit" loading={status === 'saving'}>Schimbă parola</Button>
      </form>
    </Card>
  )
}
