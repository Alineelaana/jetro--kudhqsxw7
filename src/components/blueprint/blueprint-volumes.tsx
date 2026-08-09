import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Plus, BookOpen, Pencil, Trash2 } from 'lucide-react'
import { getVolumes, createVolume, updateVolume, deleteVolume } from '@/services/blueprint'
import type { BlueprintVolume } from '@/lib/blueprint-types'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { canEditBlueprint } from '@/lib/blueprint-permissions'
import { useAuth } from '@/hooks/use-auth'

export function BlueprintVolumes() {
  const { user } = useAuth()
  const [volumes, setVolumes] = useState<BlueprintVolume[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BlueprintVolume | null>(null)
  const [form, setForm] = useState({ code: '', title: '', description: '', display_order: 1 })
  const canEdit = canEditBlueprint(user?.role as string)

  const load = useCallback(async () => {
    try {
      setVolumes(await getVolumes())
    } catch {
      /* noop */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('blueprint_volumes', () => load())

  const handleSave = async () => {
    try {
      if (editing) {
        await updateVolume(editing.id, form)
        toast.success('Volume atualizado')
      } else {
        await createVolume({ ...form, active: true, locale: 'pt-BR' } as Partial<BlueprintVolume>)
        toast.success('Volume criado')
      }
      setDialogOpen(false)
      setEditing(null)
      setForm({ code: '', title: '', description: '', display_order: 1 })
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteVolume(id)
      toast.success('Volume excluído')
      load()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Volumes</h3>
        {canEdit && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-[#005B2E] hover:bg-[#01361D] text-white"
                onClick={() => {
                  setEditing(null)
                  setForm({
                    code: '',
                    title: '',
                    description: '',
                    display_order: volumes.length + 1,
                  })
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Novo Volume
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Editar Volume' : 'Novo Volume'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Código</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Título *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  />
                </div>
                <Button
                  onClick={handleSave}
                  className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white"
                >
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {volumes.map((vol) => (
          <Card key={vol.id} className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#005B2E]" />
                  <div>
                    <p className="font-bold">{vol.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {vol.code} · Ordem {vol.display_order}
                    </p>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditing(vol)
                        setForm({
                          code: vol.code,
                          title: vol.title,
                          description: vol.description,
                          display_order: vol.display_order,
                        })
                        setDialogOpen(true)
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => handleDelete(vol.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              {vol.description && (
                <p className="text-sm text-muted-foreground mt-2">{vol.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
