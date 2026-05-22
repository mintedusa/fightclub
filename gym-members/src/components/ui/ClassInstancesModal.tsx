import { Modal } from './Modal'
import { Badge } from './Badge'
import { Button } from './Button'
import { useSeriesInstances } from '../../hooks/useClasses'
import { useUpdateClass } from '../../hooks/useClasses'
import type { ClassRow } from '../../types'

interface Props {
  series: ClassRow | null
  onClose: () => void
}

export function ClassInstancesModal({ series, onClose }: Props) {
  const { data: instances, isLoading } = useSeriesInstances(series?.recurrence_group_id)
  const updateClass = useUpdateClass()

  async function handleCancel(id: string) {
    await updateClass.mutateAsync({ id, is_cancelled: true })
  }

  return (
    <Modal open={!!series} onClose={onClose} title={`Instanțe — ${series?.name ?? ''}`}>
      {isLoading ? (
        <p className="text-zinc-400 text-sm">Se încarcă...</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {(instances ?? []).map(inst => (
            <div key={inst.id} className="flex items-center justify-between py-2 border-b border-zinc-700">
              <div className="text-sm text-zinc-300">
                {new Date(inst.datetime).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              <div className="flex items-center gap-3">
                {inst.is_cancelled
                  ? <Badge color="red">Anulată</Badge>
                  : <Badge color="green">Activă</Badge>
                }
                {!inst.is_cancelled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={updateClass.isPending}
                    onClick={() => handleCancel(inst.id)}
                  >
                    Anulează
                  </Button>
                )}
              </div>
            </div>
          ))}
          {(instances ?? []).length === 0 && (
            <p className="text-zinc-400 text-sm text-center py-4">Nicio instanță găsită.</p>
          )}
        </div>
      )}
      <div className="flex justify-end mt-4">
        <Button variant="ghost" onClick={onClose}>Închide</Button>
      </div>
    </Modal>
  )
}
