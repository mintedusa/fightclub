import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import { useMembers, useCreateMember } from '../../hooks/useMembers'

export function AdminMembers() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const { data: members, isLoading } = useMembers(search)
  const createMember = useCreateMember()

  const [form, setForm] = useState({ email: '', full_name: '', phone: '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    try {
      const result = await createMember.mutateAsync(form)
      setCreated({ email: form.email, password: result?.tempPassword ?? '' })
      setForm({ email: '', full_name: '', phone: '' })
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Eroare la creare.')
    }
  }

  function handleClose() {
    setOpen(false)
    setCreated(null)
    setFormError(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Membri</h1>
        <Button onClick={() => { setOpen(true); setCreated(null) }}>
          <UserPlus className="h-4 w-4" /> Adaugă membru
        </Button>
      </div>

      <Input
        placeholder="Caută după nume, email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {isLoading ? (
        <p className="text-zinc-500 text-sm">Se încarcă...</p>
      ) : (
        <Table
          data={members ?? []}
          emptyMessage="Niciun membru găsit."
          columns={[
            { key: 'name', header: 'Nume', render: m => <span className="font-medium">{m.full_name}</span> },
            { key: 'email', header: 'Email', render: m => <span className="text-zinc-400">{m.email}</span> },
            { key: 'phone', header: 'Telefon', render: m => m.phone ?? '—' },
            {
              key: 'actions', header: '', render: m => (
                <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/members/${m.id}`)}>
                  Detalii →
                </Button>
              ),
            },
          ]}
        />
      )}

      <Modal open={open} onClose={handleClose} title="Adaugă membru nou">
        {created ? (
          <div className="space-y-4">
            <p className="text-green-400 text-sm font-medium">Cont creat cu succes!</p>
            <div className="rounded-lg bg-zinc-800 p-4 space-y-2">
              <p className="text-xs text-zinc-400">Email</p>
              <p className="text-white font-mono">{created.email}</p>
              <p className="text-xs text-zinc-400 mt-3">Parolă temporară</p>
              <p className="text-red-400 font-mono text-lg font-bold tracking-wider">{created.password}</p>
            </div>
            <p className="text-xs text-zinc-500">Comunică aceste date membrului. El le poate schimba din portal după prima logare.</p>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Închide</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Nume complet" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Telefon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            {formError && <p className="text-sm text-red-400">{formError}</p>}
            <div className="flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={handleClose}>Anulează</Button>
              <Button type="submit" loading={createMember.isPending}>Trimite invitație</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
