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
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  closeGoals,
} from '@/services/variable-remuneration'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  canCreateGoals,
  canDeleteRules,
  canCloseGoals,
} from '@/lib/variable-remuneration-permissions'
import {
  GOAL_TYPES,
  parseNum,
  formatCurrency,
  getGoalStatusVisual,
} from '@/lib/variable-remuneration-types'
import { Plus, Pencil, Trash2, Loader2, Save, Search, Lock } from 'lucide-react'
import { toast } from 'sonner'

const FIELDS = [
  { name: 'name', label: 'Nome da Meta', required: true, span: 2 },
  { name: 'description', label: 'Descrição', type: 'textarea' as const, span: 2 },
  { name: 'competencia', label: 'Competência', required: true },
  { name: 'start_date', label: 'Data Inicial', type: 'date' as const, required: true },
  { name: 'end_date', label: 'Data Final', type: 'date' as const, required: true },
  { name: 'responsavel', label: 'Responsável' },
  { name: 'target_value', label: 'Valor da Meta', required: true },
  { name: 'empresa', label: 'Empresa' },
  { name: 'filial', label: 'Filial' },
  { name: 'regiao', label: 'Região' },
  { name: 'canal', label: 'Canal' },
  { name: 'gerente', label: 'Gerente' },
  { name: 'coordenador', label: 'Coordenador' },
  { name: 'supervisor', label: 'Supervisor' },
  { name: 'rca', label: 'RCA' },
  { name: 'vendedor_interno', label: 'Vendedor Interno' },
  { name: 'equipe', label: 'Equipe' },
  { name: 'categoria', label: 'Categoria' },
  { name: 'marca', label: 'Marca' },
  { name: 'industria', label: 'Indústria' },
  { name: 'fornecedor', label: 'Fornecedor' },
]

export function VrGoalsManagement() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [closing, setClosing] = useState(false)

  const load = async () => {
    try {
      setGoals(await getGoals())
    } catch {
      setGoals([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sales_goals', () => load())

  const filtered = goals.filter((g) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return Object.values(g).some((v) =>
      String(v || '')
        .toLowerCase()
        .includes(q),
    )
  })

  const openNew = () => {
    setEditing(null)
    setForm({ status: 'ativa', auto_compose: 'false' })
    setDialogOpen(true)
  }
  const openEdit = (g: any) => {
    setEditing(g)
    setForm({ ...g })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name?.trim() || !form.target_value) {
      toast.error('Nome e valor da meta são obrigatórios')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateGoal(editing.id, form)
        toast.success('Meta atualizada')
      } else {
        await createGoal(form)
        toast.success('Meta criada')
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  const handleClose = async () => {
    setClosing(true)
    try {
      const now = new Date()
      const competencia = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      await closeGoals(competencia)
      toast.success('Metas fechadas com sucesso')
      load()
    } catch {
      toast.error('Erro ao fechar metas')
    }
    setClosing(false)
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
        <h3 className="text-lg font-bold">Gestão de Metas</h3>
        <div className="flex gap-2">
          {canCloseGoals(user?.role) && (
            <Button
              onClick={handleClose}
              disabled={closing}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {closing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}{' '}
              FECHAR METAS
            </Button>
          )}
          {canCreateGoals(user?.role) && (
            <Button
              onClick={openNew}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              <Plus className="w-4 h-4 mr-2" /> Nova Meta
            </Button>
          )}
        </div>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar meta..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((g) => {
          const target = parseNum(g.target_value)
          const realized = parseNum(g.realized_value)
          const pct = target > 0 ? (realized / target) * 100 : 0
          const now = new Date()
          const end = new Date(g.end_date || now)
          const start = new Date(g.start_date || now)
          const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000))
          const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
          const visual = getGoalStatusVisual(target, realized, daysRemaining, totalDays)
          return (
            <Card key={g.id} className="border-2 border-[#005B2E]/20">
              <CardContent className="py-4 px-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{g.name}</span>
                  <span className="text-lg">{visual.icon}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {GOAL_TYPES.find((t) => t.value === g.goal_type)?.label || g.goal_type}
                </p>
                <div className="flex justify-between text-xs">
                  <span>
                    Meta: <strong>R$ {formatCurrency(g.target_value)}</strong>
                  </span>
                  <span className={visual.color}>{pct.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-[#005B2E]' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {g.competencia} • {daysRemaining} dias restantes
                </div>
                {canCreateGoals(user?.role) && (
                  <div className="flex gap-1 pt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(g)}
                      className="text-[#005B2E] h-7 w-7 p-0"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    {canDeleteRules(user?.role) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          deleteGoal(g.id).then(() => {
                            toast.success('Excluída')
                            load()
                          })
                        }
                        className="text-red-600 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">{editing ? 'Editar' : 'Nova'} Meta</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Tipo de Meta *</Label>
              <Select
                value={form.goal_type || ''}
                onValueChange={(v) => setForm({ ...form, goal_type: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Status</Label>
              <Select
                value={form.status || 'ativa'}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['rascunho', 'ativa', 'encerrada', 'concluida', 'cancelada'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {FIELDS.map((f) => (
              <div key={f.name} className={`space-y-1 ${f.span === 2 ? 'sm:col-span-2' : ''}`}>
                <Label className="text-sm font-semibold">
                  {f.label}
                  {f.required ? ' *' : ''}
                </Label>
                {f.type === 'textarea' ? (
                  <Textarea
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    rows={2}
                    className="focus-visible:ring-[#005B2E]"
                  />
                ) : (
                  <Input
                    type={f.type === 'date' ? 'date' : 'text'}
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="focus-visible:ring-[#005B2E]"
                  />
                )}
              </div>
            ))}
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
