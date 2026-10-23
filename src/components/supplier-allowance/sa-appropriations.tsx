import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  SA_COLLECTIONS,
  saGetList,
  appropriateAllowance,
  workflowTransition,
} from '@/services/supplier-allowance'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canAppropriate, canApproveAccrual } from '@/lib/supplier-allowance-permissions'
import { formatBRL } from '@/lib/supplier-allowance-types'
import { Plus, Search, Loader2, Check, X, CheckCircle2, Clock, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import pb from '@/lib/pocketbase/client'

export function SaAppropriations() {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [accruals, setAccruals] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [approving, setApproving] = useState<string | null>(null)
  const [form, setForm] = useState({
    accrual_id: '',
    allocated_value: '',
    reason: 'ajuste_custo_aquisicao',
    product_id: '',
  })

  const load = async () => {
    try {
      const [apps, accs, prods] = await Promise.all([
        pb.collection(SA_COLLECTIONS.appropriations).getFullList({
          sort: '-created',
          expand: 'product,account,accrual',
        }),
        saGetList(SA_COLLECTIONS.accruals),
        pb.collection('products').getFullList({
          filter: 'active = true',
          fields: 'id,name,code,cost_average,cost_price,stock',
          sort: 'name',
        }),
      ])
      setRecords(apps || [])
      setAccruals(accs.filter((a: any) => a.status === 'aprovado') || [])
      setProducts(prods || [])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime(SA_COLLECTIONS.appropriations, () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    const reasonMatch = (r.reason || '').toLowerCase().includes(q)
    const prodName = r.expand?.product?.name || ''
    const prodCode = r.expand?.product?.code || ''
    return (
      !q || reasonMatch || prodName.toLowerCase().includes(q) || prodCode.toLowerCase().includes(q)
    )
  })

  const handleSave = async () => {
    if (!form.accrual_id || !form.allocated_value) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    try {
      await appropriateAllowance({
        accrual_id: form.accrual_id,
        allocated_value: form.allocated_value,
        reason: form.reason,
        product_id: form.product_id || undefined,
      })
      toast.success('Apropriação criada com sucesso')
      setDialogOpen(false)
      setForm({
        accrual_id: '',
        allocated_value: '',
        reason: 'ajuste_custo_aquisicao',
        product_id: '',
      })
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleApprove = async (record: any, approve: boolean) => {
    setApproving(record.id)
    try {
      await workflowTransition({
        entity_collection: SA_COLLECTIONS.appropriations,
        entity_id: record.id,
        action: approve ? 'approve' : 'reject',
        notes: approve ? 'Aprovado via Workflow Engine' : 'Rejeitado via Workflow Engine',
      })
      toast.success(approve ? 'Aprovado via Workflow' : 'Rejeitado via Workflow')

      // Recomendação: ao aprovar apropriação elegível, mostrar toast informativo
      const isEligibleForCost =
        approve &&
        (record.reason || '').toLowerCase().includes('ajuste_custo_aquisicao') &&
        Boolean(record.product || record.product_id)

      if (isEligibleForCost) {
        toast.info('Custo médio do produto será atualizado automaticamente')
      }

      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
    setApproving(null)
  }

  const renderCostStatus = (r: any) => {
    const reason = (r.reason || '').toLowerCase()
    const hasProduct = Boolean(r.product || r.product_id || r.expand?.product)
    const isAjusteCusto = reason.includes('ajuste_custo_aquisicao')
    const isCostApplied = r.cost_applied === true || r.cost_applied === 'true'

    if (isCostApplied) {
      const deductionNum = parseFloat(String(r.unit_cost_deduction || '0').replace(',', '.')) || 0
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-help">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Aplicado ao custo
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 text-white text-xs p-2.5 rounded-md shadow-lg max-w-xs space-y-1">
              <p className="font-bold text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Abatimento Unitário no Custo:
              </p>
              <p className="text-sm font-mono font-bold text-white">
                R${' '}
                {deductionNum.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}{' '}
                / un
              </p>
              {r.cost_history_ref && (
                <p className="text-[10px] text-slate-300 font-mono">
                  Ref. Histórico: {r.cost_history_ref}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    if (r.status === 'aprovado' && hasProduct && isAjusteCusto && !isCostApplied) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 cursor-help">
                <Clock className="w-3 h-3 text-amber-600" />
                Aguarda aplicação ao custo
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 text-white text-xs p-2.5 rounded-md shadow-lg max-w-xs space-y-1">
              <p className="font-bold text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Sincronização Pendente
              </p>
              <p className="text-xs text-slate-200">
                Apropriação aprovada com motivo de ajuste de aquisição. O hook recalculará o custo
                médio e registrará a trilha em `product_cost_history`.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 cursor-help">
              Não afeta custo
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 text-white text-xs p-2.5 rounded-md shadow-lg max-w-xs space-y-1">
            <p className="font-bold text-slate-300 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Classificação Contábil Neutra
            </p>
            <p className="text-xs text-slate-200">
              Verbas classificadas como campanha, marketing, coop ou receita comercial não reduzem o
              custo contábil nem o custo médio de estoque.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
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
        <h3 className="text-lg font-bold">Apropriações</h3>
        {canAppropriate(user?.role) && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Apropriação
          </Button>
        )}
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Valor Alocado</th>
                <th className="text-left px-3 py-3 font-bold">Produto Vinculado</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Motivo</th>
                <th className="text-left px-3 py-3 font-bold">Status Verba</th>
                <th className="text-left px-3 py-3 font-bold">Impacto no Custo</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Data</th>
                <th className="text-center px-3 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma apropriação encontrada
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const prod = r.expand?.product
                  return (
                    <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                      <td className="px-3 py-3 font-bold text-[#005B2E] whitespace-nowrap">
                        R$ {formatBRL(r.allocated_value)}
                      </td>
                      <td className="px-3 py-3">
                        {prod ? (
                          <div>
                            <span
                              className="font-semibold text-foreground text-xs block truncate max-w-[200px]"
                              title={prod.name}
                            >
                              {prod.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              Cód: {prod.code || '—'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Sem produto direto
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell text-xs">
                        <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[11px] text-foreground">
                          {r.reason || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded inline-block ${r.status === 'aprovado' ? 'bg-emerald-100 text-emerald-700' : r.status === 'rejeitado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                        >
                          {r.status || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">{renderCostStatus(r)}</td>
                      <td className="px-3 py-3 hidden sm:table-cell text-xs text-muted-foreground whitespace-nowrap">
                        {r.created ? new Date(r.created).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-3 py-3">
                        {r.status === 'pendente' && canApproveAccrual(user?.role) && (
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={approving === r.id}
                              onClick={() => handleApprove(r, true)}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="Aprovar apropriação"
                            >
                              {approving === r.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={approving === r.id}
                              onClick={() => handleApprove(r, false)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Rejeitar apropriação"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Apropriação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Apuração *</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.accrual_id}
                onChange={(e) => setForm({ ...form, accrual_id: e.target.value })}
              >
                <option value="">Selecione a apuração</option>
                {accruals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.competence_period} — R$ {formatBRL(a.earned_value)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Produto Vinculado (Opcional — para abatimento de custo)</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              >
                <option value="">Nenhum produto vinculado (campanha geral)</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code ? `[${p.code}] ` : ''}
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground mt-1">
                Ao selecionar um produto e motivo `ajuste_custo_aquisicao`, o custo médio será
                deduzido na aprovação.
              </p>
            </div>
            <div>
              <Label>Valor Alocado (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={form.allocated_value}
                onChange={(e) => setForm({ ...form, allocated_value: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Motivo / Finalidade da Verba</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              >
                <option value="ajuste_custo_aquisicao">
                  ajuste_custo_aquisicao (Deduz Custo Médio)
                </option>
                <option value="campanha_promocional">
                  campanha_promocional (Receita Comercial / Não afeta custo)
                </option>
                <option value="marketing_cooperado">
                  marketing_cooperado (Receita Comercial / Não afeta custo)
                </option>
                <option value="encarte_tabloide">
                  encarte_tabloide (Receita Comercial / Não afeta custo)
                </option>
                <option value="inauguracao_loja">
                  inauguracao_loja (Receita Comercial / Não afeta custo)
                </option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
