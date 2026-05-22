import { useState } from 'react'
import { useAuthContext } from '../../contexts/AuthContext'
import { useUpdateMember } from '../../hooks/useMembers'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { ChangePasswordForm } from '../../components/ui/ChangePasswordForm'

export function TrainerProfile() {
  const { profile } = useAuthContext()
  const updateMember = useUpdateMember()
  const [form, setForm] = useState({ full_name: profile?.full_name ?? '', phone: profile?.phone ?? '' })
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await updateMember.mutateAsync({ id: profile!.id, ...form })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-2xl font-bold text-white">Profilul meu</h1>
      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nume complet" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
          <Input label="Telefon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <Input label="Email" value={profile?.email ?? ''} disabled className="opacity-60" />
          {saved && <p className="text-sm text-green-400">Profil actualizat.</p>}
          <Button type="submit" loading={updateMember.isPending}>Salvează</Button>
        </form>
      </Card>
      <ChangePasswordForm />
    </div>
  )
}
