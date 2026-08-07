import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '@/services/variable-remuneration'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canCreateCampaigns, canDeleteRules } from '@/lib/variable-remuneration-permissions'
import { Plus, Pencil, Trash2, Loader2, Save, Trophy } from 'lucide-react'
import { toast } from 'sonner'

export function VrCampaigns() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setCampaigns(await getCampaigns())
    } catch {
      setCampaigns([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('incentive_campaigns', () => load())

  const openNew = () => {
    setEditing(null)
    setForm({ status: 'rascunho' })
    setDialogOpen(true)
  }
  const openEdit = (c: any) => {
    setEditing(c)
    setForm({ ...c })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateCampaign(editing.id, form)
        toast.success('Campanha atualizada')
      } else {
        await createCampaign(form)
        toast.success('Campanha criada')
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCampaign(id)
      toast.success('Excluída')
      load()
    } catch {
      toast.error('Erro')
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Campanhas de Incentivo</h3>
        {canCreateCampaigns(user?.role) && (
          <Button
            onClick={openNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Campanha
          </Button>
        )}
      </div>
      {campaigns.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma campanha cadastrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <Card key={c.id} className="border-2 border-[#005B2E]/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#C89B3C]" /> {c.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">{c.description || '—'}</p>
                <div className="text-xs">
                  <strong>Período:</strong> {c.start_date || '—'} → {c.end_date || '—'}
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${c.status === 'ativa' ? 'bg-emerald-100 text-emerald-700' : c.status === 'encerrada' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}
                >
                  {c.status}
                </span>
                {canCreateCampaigns(user?.role) && (
                  <div className="flex gap-1 pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(c)}
                      className="text-[#005B2E]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {canDeleteRules(user?.role) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Nova'} Campanha
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <Label>Nome *</Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Data Inicial *</Label>
              <Input
                type="date"
                value={form.start_date || ''}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Data Final *</Label>
              <Input
                type="date"
                value={form.end_date || ''}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Objetivos</Label>
              <Input
                value={form.objectives || ''}
                onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={form.status || 'rascunho'}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['rascunho', 'ativa', 'encerrada', 'cancelada'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}{' '}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
