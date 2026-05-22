import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import { useMembers, useCreateMember } from '../../hooks/useMembers'

type Tab = 'members' | 'trainers'

export function AdminMembers() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('members')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const { data: people, isLoading } = useMembers(search, tab === 'members' ? 'member' : 'trainer')
  const createMember = useCreateMember()

  const [form, setForm] = useState({ email: '', full_name: '', phone: '', password: '', role: 'member' as 'member' | 'trainer' })
  const [formError, setFormError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ email: string; role: string } | null>(null)

  function openAdd() {
    setForm({ email: '', full_name: '', phone: '', password: '', role: tab === 'members' ? 'member' : 'trainer' })
    setCreated(null)
    setFormError(null)
    setOpen(true)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    try {
      await createMember.mutateAsync(form)
      setCreated({ email: form.email, role: form.role })
      setForm({ email: '', full_name: '', phone: '', password: '', role: tab === 'members' ? 'member' : 'trainer' })
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Eroare la creare.')
    }
  }

  function handleClose() {
    setOpen(false)
    setCreated(null)
    setFormError(null)
    setForm({ email: '', full_name: '', phone: '', password: '', role: tab === 'members' ? 'member' : 'trainer' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {tab === 'members' ? 'Membri' : 'Traineri'}
        </h1>
        <Button onClick={openAdd}>
          <UserPlus className="h-4 w-4" />
          {tab === 'members' ? 'Adaugă membru' : 'Adaugă trainer'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-700">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'members' ? 'text-white border-b-2 border-red-500' : 'text-zinc-400 hover:text-zinc-200'}`}
          onClick={() => { setTab('members'); setSearch('') }}
        >
          Membri
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'trainers' ? 'text-white border-b-2 border-red-500' : 'text-zinc-400 hover:text-zinc-200'}`}
          onClick={() => { setTab('trainers'); setSearch('') }}
        >
          Traineri
        </button>
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
          data={people ?? []}
          emptyMessage={tab === 'members' ? 'Niciun membru găsit.' : 'Niciun trainer găsit.'}
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

      <Modal open={open} onClose={handleClose} title={tab === 'members' ? 'Adaugă membru nou' : 'Adaugă trainer nou'}>
        {created ? (
          <div className="space-y-4">
            <p className="text-green-400 text-sm font-medium">
              Cont {created.role === 'trainer' ? 'trainer' : 'membru'} creat cu succes!
            </p>
            <div className="rounded-lg bg-zinc-800 p-4">
              <p className="text-xs text-zinc-400">Email</p>
              <p className="text-white font-mono">{created.email}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Închide</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Nume complet" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Telefon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input label="Parolă" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
            {formError && <p className="text-sm text-red-400">{formError}</p>}
            <div className="flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={handleClose}>Anulează</Button>
              <Button type="submit" loading={createMember.isPending}>Creează cont</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
