import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  getCommissionRules,
  createCommissionRule,
  updateCommissionRule,
  deleteCommissionRule,
  COMMISSION_ROLES,
  type CommissionRule,
} from '@/services/commission-rules'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { useAuthorization } from '@/hooks/use-authorization'
import { canManageCommissionRules } from '@/lib/commercial-responsibles-permissions'
import { Plus, Pencil, Trash2, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'

const ROLE_LABELS: Record<string, string> = {
  RCA: 'RCA',
  Televendas: 'Televendas',
  'Responsavel Comercial Digital': 'Responsável Comercial Digital (B2B/B2C)',
}

const APPLICABILITY_OPTIONS = [
  { value: 'all_sales', label: 'Todas as Vendas' },
  { value: 'digital_channel', label: 'Canal Digital (B2B/B2C)' },
  { value: 'b2b', label: 'Portal B2B' },
  { value: 'b2c', label: 'Portal B2C' },
  { value: 'specific', label: 'Específico' },
]

export function CommissionRulesPanel() {
  const { user } = useAuth()
  const { empresaId, isGlobal } = useAuthorization()
  const canManage = canManageCommissionRules(user?.role)
  const [rules, setRules] = useState<CommissionRule[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<CommissionRule | null>(null)
  const [form, setForm] = useState<Record<string, string | boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setRules(await getCommissionRules())
    } catch {
      setRules([])
    }
    setLoading(false)
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useRealtime('commission_rules', () => load())

  const visibleRules = isGlobal ? rules : rules.filter((r) => !r.empresa || r.empresa === empresaId)

  const openNew = () => {
    setEditing(null)
    setForm({
      role: '',
      percentage: '',
      split_percentage: '',
      priority: '1',
      applicability: 'all_sales',
      active: true,
      empresa: empresaId,
      filial: '',
    })
    setErrors({})
    setDialogOpen(true)
  }

  const openEdit = (r: CommissionRule) => {
    setEditing(r)
    setForm({
      role: r.role,
      percentage: r.percentage,
      split_percentage: r.split_percentage,
      priority: String(r.priority),
      applicability: r.applicability || 'all_sales',
      active: r.active,
      empresa: r.empresa || empresaId,
      filial: r.filial || '',
    })
    setErrors({})
    setDialogOpen(true)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.role) e.role = 'Selecione um papel'
    const pct = parseFloat(form.percentage as string)
    if (!form.percentage || isNaN(pct) || pct < 0) e.percentage = 'Valor deve ser positivo'
    const pri = parseInt(form.priority as string)
    if (isNaN(pri) || pri < 1) e.priority = 'Prioridade deve ser maior ou igual a 1'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const data = {
        role: form.role as string,
        percentage: form.percentage as string,
        split_percentage: (form.split_percentage as string) || '',
        priority: parseInt(form.priority as string),
        applicability: form.applicability as string,
        active: form.active as boolean,
        empresa: (form.empresa as string) || '',
        filial: (form.filial as string) || '',
      }
      if (editing) {
        await updateCommissionRule(editing.id, data)
        toast.success('Regra atualizada')
      } else {
        await createCommissionRule(data)
        toast.success('Regra criada')
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCommissionRule(deleteId)
      toast.success('Regra excluída')
      load()
    } catch {
      toast.error('Erro ao excluir')
    }
    setDeleteId(null)
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
        <div>
          <h3 className="text-lg font-bold">Regras de Comissão por Papel</h3>
          <p className="text-sm text-muted-foreground">
            Configuração de comissões para RCA, Televendas e Responsável Comercial Digital
          </p>
        </div>
        {canManage && (
          <Button
            onClick={openNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Regra
          </Button>
        )}
      </div>
      <JetroTable
        screenId="comissoes.regras"
        columns={[
          {
            id: 'role',
            header: 'Papel',
            accessorKey: 'role',
            dataType: 'text',
            defaultWidth: 200,
            getSortValue: (row: CommissionRule) => ROLE_LABELS[row.role] || row.role,
            cell: ({ row }: { row: CommissionRule }) => (
              <span className="font-medium">{ROLE_LABELS[row.role] || row.role}</span>
            ),
          },
          {
            id: 'percentage',
            header: 'Percentual',
            accessorKey: 'percentage',
            dataType: 'percent',
            align: 'right',
            defaultWidth: 120,
            getSortValue: (row: CommissionRule) => parseFloat(row.percentage) || 0,
            cell: ({ value }: { value: unknown }) => <span>{String(value || '—')}%</span>,
          },
          {
            id: 'split_percentage',
            header: 'Divisão (%)',
            accessorKey: 'split_percentage',
            dataType: 'percent',
            align: 'right',
            defaultWidth: 120,
            getSortValue: (row: CommissionRule) => parseFloat(row.split_percentage || '0') || 0,
            cell: ({ value }: { value: unknown }) => (
              <span>{value ? `${String(value)}%` : '—'}</span>
            ),
          },
          {
            id: 'priority',
            header: 'Prioridade',
            accessorKey: 'priority',
            dataType: 'number',
            align: 'center',
            defaultWidth: 100,
            cell: ({ value }: { value: unknown }) => <span>{String(value || '1')}</span>,
          },
          {
            id: 'applicability',
            header: 'Aplicabilidade',
            accessorKey: 'applicability',
            dataType: 'text',
            defaultWidth: 180,
            getSortValue: (row: CommissionRule) =>
              APPLICABILITY_OPTIONS.find((a) => a.value === row.applicability)?.label ||
              row.applicability ||
              '—',
            cell: ({ row }: { row: CommissionRule }) => (
              <span className="text-xs">
                {APPLICABILITY_OPTIONS.find((a) => a.value === row.applicability)?.label ||
                  row.applicability ||
                  '—'}
              </span>
            ),
          },
          {
            id: 'active',
            header: 'Status',
            accessorKey: 'active',
            dataType: 'boolean',
            align: 'center',
            defaultWidth: 110,
            cell: ({ value }: { value: unknown }) => (
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${value ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
              >
                {value ? 'Ativo' : 'Inativo'}
              </span>
            ),
          },
          ...(canManage
            ? [
                {
                  id: 'actions',
                  header: 'Ações',
                  align: 'center' as const,
                  sortable: false,
                  hideable: false,
                  resizable: false,
                  draggable: false,
                  defaultWidth: 100,
                  cell: ({ row: r }: { row: CommissionRule }) => (
                    <div className="flex gap-0.5 justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(r)}
                        className="text-[#005B2E] hover:bg-[#005B2E]/10 h-7 w-7 p-0"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(r.id)}
                        className="text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ),
                },
              ]
            : []),
        ]}
        data={visibleRules}
        emptyMessage="Nenhuma regra de comissão encontrada."
        exportTitle="Regras de Comissão — Jetro"
        exportFilename="regras-comissao.xlsx"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Nova'} Regra de Comissão
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-sm font-semibold">Papel *</Label>
              <Select
                value={(form.role as string) || ''}
                onValueChange={(v) => setForm({ ...form, role: v })}
                disabled={!!editing}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMISSION_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Percentual de Comissão (%) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={(form.percentage as string) || ''}
                onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
              {errors.percentage && <p className="text-xs text-red-500">{errors.percentage}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Divisão entre Responsáveis (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={(form.split_percentage as string) || ''}
                onChange={(e) => setForm({ ...form, split_percentage: e.target.value })}
                placeholder="Ex: 50"
                className="focus-visible:ring-[#005B2E]"
              />
              <p className="text-xs text-muted-foreground">
                % da comissão total quando há múltiplos responsáveis
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Prioridade *</Label>
              <Input
                type="number"
                min="1"
                value={(form.priority as string) || ''}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
              <p className="text-xs text-muted-foreground">Menor número = maior prioridade</p>
              {errors.priority && <p className="text-xs text-red-500">{errors.priority}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Aplicabilidade</Label>
              <Select
                value={(form.applicability as string) || 'all_sales'}
                onValueChange={(v) => setForm({ ...form, applicability: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICABILITY_OPTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 bg-muted/40 px-4 py-3 rounded-lg border border-border sm:col-span-2">
              <span className="text-sm font-bold">Ativo</span>
              <Switch
                checked={form.active as boolean}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
                className="data-[state=checked]:bg-[#005B2E]"
              />
              <span
                className={`text-sm font-bold ${form.active ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {form.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Regra</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
