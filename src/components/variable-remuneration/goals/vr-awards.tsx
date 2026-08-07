import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
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
import { getAwards, createAward, updateAward, deleteAward } from '@/services/variable-remuneration'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canCreateAwards, canDeleteRules } from '@/lib/variable-remuneration-permissions'
import { AWARD_TYPES, formatCurrency, parseNum } from '@/lib/variable-remuneration-types'
import { Plus, Pencil, Trash2, Loader2, Save, Gift } from 'lucide-react'
import { toast } from 'sonner'

const CRITERIA_OPTIONS = [
  'faturamento',
  'positivacao',
  'mix',
  'margem',
  'ticket_medio',
  'quantidade',
  'industria_foco',
  'marca_foco',
  'produto_foco',
  'crescimento',
  'novos_clientes',
  'reativacao',
  'meta_geral',
  'meta_combinada',
]
const CUMULATIVE_MODES = ['acumulativa', 'nao_acumulativa', 'maior_substitui', 'independente']

export function VrAwards() {
  const { user } = useAuth()
  const [awards, setAwards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setAwards(await getAwards())
    } catch {
      setAwards([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('goal_awards', () => load())

  const openNew = () => {
    setEditing(null)
    setForm({ status: 'rascunho', cumulative_mode: 'acumulativa' })
    setDialogOpen(true)
  }
  const openEdit = (a: any) => {
    setEditing(a)
    setForm({ ...a })
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
        await updateAward(editing.id, form)
        toast.success('Premiação atualizada')
      } else {
        await createAward(form)
        toast.success('Premiação criada')
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const totalPrevisto = awards.reduce((s, a) => s + parseNum(a.previsto), 0)
  const totalConquistado = awards.reduce((s, a) => s + parseNum(a.conquistado), 0)
  const totalPago = awards.reduce((s, a) => s + parseNum(a.pago), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Gestão de Premiações</h3>
        {canCreateAwards(user?.role) && (
          <Button
            onClick={openNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Premiação
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-2 border-[#8b5cf6]/30">
          <CardContent className="py-3 px-4">
            <p className="text-xs text-muted-foreground">Total Previsto</p>
            <p className="text-lg font-black">R$ {formatCurrency(totalPrevisto)}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#f59e0b]/30">
          <CardContent className="py-3 px-4">
            <p className="text-xs text-muted-foreground">Total Conquistado</p>
            <p className="text-lg font-black">R$ {formatCurrency(totalConquistado)}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#22c55e]/30">
          <CardContent className="py-3 px-4">
            <p className="text-xs text-muted-foreground">Total Pago</p>
            <p className="text-lg font-black">R$ {formatCurrency(totalPago)}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Nome</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Tipo</th>
                <th className="text-left px-3 py-3 font-bold">Valor</th>
                <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Conquistado</th>
                <th className="text-left px-3 py-3 font-bold">Status</th>
                <th className="text-center px-3 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {awards.map((a) => (
                <tr key={a.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-3 font-medium">{a.name || '—'}</td>
                  <td className="px-3 py-3 hidden sm:table-cell">
                    {AWARD_TYPES.find((t) => t.value === a.award_type)?.label ||
                      a.award_type ||
                      '—'}
                  </td>
                  <td className="px-3 py-3">R$ {formatCurrency(a.value)}</td>
                  <td className="px-3 py-3 hidden md:table-cell">
                    R$ {formatCurrency(a.conquistado)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${a.status === 'paga' ? 'bg-emerald-100 text-emerald-700' : a.status === 'ativa' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-0.5 justify-center">
                      {canCreateAwards(user?.role) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(a)}
                          className="text-[#005B2E] h-8 w-8 p-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {canDeleteRules(user?.role) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            deleteAward(a.id).then(() => {
                              toast.success('Excluída')
                              load()
                            })
                          }
                          className="text-red-600 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Nova'} Premiação
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
            <div className="space-y-1">
              <Label>Tipo de Premiação</Label>
              <Select
                value={form.award_type || ''}
                onValueChange={(v) => setForm({ ...form, award_type: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {AWARD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Valor</Label>
              <Input
                value={form.value || ''}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Indústria</Label>
              <Input
                value={form.industry || ''}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Modo Acumulação</Label>
              <Select
                value={form.cumulative_mode || 'acumulativa'}
                onValueChange={(v) => setForm({ ...form, cumulative_mode: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUMULATIVE_MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {['rascunho', 'ativa', 'encerrada', 'paga'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Previsto</Label>
              <Input
                value={form.previsto || ''}
                onChange={(e) => setForm({ ...form, previsto: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Conquistado</Label>
              <Input
                value={form.conquistado || ''}
                onChange={(e) => setForm({ ...form, conquistado: e.target.value })}
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
