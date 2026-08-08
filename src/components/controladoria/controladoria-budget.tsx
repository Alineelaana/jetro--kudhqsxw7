import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Plus, Trash2, FileDown } from 'lucide-react'
import { getBudgetsByPeriod, ctrlCreate, ctrlDelete } from '@/services/controladoria'
import { computeDRE, computeBudgetVsActual } from '@/services/controladoria-analytics'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { canManageBudget } from '@/lib/controladoria-permissions'
import { exportBICsv } from '@/lib/bi-export'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ControladoriaBudget() {
  const { user, userRole } = useAuth()
  const [period, setPeriod] = useState(new Date().toISOString().substring(0, 7))
  const [budgets, setBudgets] = useState<Record<string, unknown>[]>([])
  const [comparison, setComparison] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    try {
      const [budgetData, dre] = await Promise.all([
        getBudgetsByPeriod(period),
        computeDRE(period, 'orcado'),
      ])
      setBudgets(budgetData as Record<string, unknown>[])
      setComparison(await computeBudgetVsActual(period, dre))
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [period])
  useRealtime('controladoria_budgets', () => load())

  const handleCreate = async () => {
    await ctrlCreate('controladoria_budgets', {
      ...form,
      period,
      version_id: '',
      company: '',
      branch: '',
    })
    setOpen(false)
    setForm({})
    load()
  }
  const handleExport = () => {
    const headers = ['Linha DRE', 'Orçado', 'Realizado', 'Variação', 'Variação %']
    const rows = comparison.map((c) => [
      c.label,
      fmt(c.budget),
      fmt(c.actual),
      fmt(c.diff),
      `${fmt(c.diff_pct)}%`,
    ])
    exportBICsv(`Orcado_Realizado_${period}`, headers, rows, (user?.name as string) || 'Usuário')
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Período</label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        {canManageBudget(userRole) && (
          <Button
            size="sm"
            className="bg-[#005B2E] hover:bg-[#01361D]"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleExport}>
          <FileDown className="w-4 h-4 mr-1" /> Exportar
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#005B2E]/20">
                  <th className="text-left py-2 px-2 text-[#005B2E]">Linha DRE</th>
                  <th className="text-right py-2 px-2 text-[#005B2E]">Orçado</th>
                  <th className="text-right py-2 px-2 text-[#005B2E]">Realizado</th>
                  <th className="text-right py-2 px-2 text-[#005B2E]">Variação</th>
                  <th className="text-right py-2 px-2 text-[#005B2E]">Var %</th>
                  {canManageBudget(userRole) && (
                    <th className="text-center py-2 px-2 text-[#005B2E]">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {comparison.map((c) => (
                  <tr key={c.line_key} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="py-2 px-2">{c.label}</td>
                    <td className="py-2 px-2 text-right font-medium">R$ {fmt(c.budget)}</td>
                    <td className="py-2 px-2 text-right">R$ {fmt(c.actual)}</td>
                    <td
                      className={`py-2 px-2 text-right ${c.diff > 0 ? 'text-red-600' : 'text-emerald-600'}`}
                    >
                      R$ {fmt(c.diff)}
                    </td>
                    <td
                      className={`py-2 px-2 text-right ${c.diff_pct > 0 ? 'text-red-600' : 'text-emerald-600'}`}
                    >
                      {fmt(c.diff_pct)}%
                    </td>
                    {canManageBudget(userRole) && (
                      <td className="py-2 px-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const b = budgets.find((b) => b.dre_line_key === c.line_key)
                            if (b) {
                              await ctrlDelete('controladoria_budgets', b.id as string)
                              load()
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Linha DRE</Label>
              <Input
                value={form.dre_line_key || ''}
                onChange={(e) => setForm({ ...form, dre_line_key: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Centro de Custo</Label>
              <Input
                value={form.cost_center || ''}
                onChange={(e) => setForm({ ...form, cost_center: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Centro de Resultado</Label>
              <Input
                value={form.result_center || ''}
                onChange={(e) => setForm({ ...form, result_center: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Valor (R$)</Label>
              <Input
                type="number"
                value={form.value || ''}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <select
                value={form.entry_type || ''}
                onChange={(e) => setForm({ ...form, entry_type: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">—</option>
                <option value="receita">Receita</option>
                <option value="custo">Custo</option>
                <option value="despesa">Despesa</option>
                <option value="investimento">Investimento</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Departamento</Label>
              <Input
                value={form.department || ''}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Observações</Label>
              <Input
                value={form.observations || ''}
                onChange={(e) => setForm({ ...form, observations: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} className="bg-[#005B2E] hover:bg-[#01361D]">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
