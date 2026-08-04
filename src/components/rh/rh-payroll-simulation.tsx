import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { simulatePayroll, type PayrollSimulation, type PayrollItem } from '@/services/rh-payroll'
import { rhUpdate } from '@/services/rh'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Calculator, Check, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export function RhPayrollSimulation({
  payrollId,
  competencia,
  onClosed,
}: {
  payrollId?: string
  competencia?: string
  onClosed?: () => void
}) {
  const { user } = useAuth()
  const [comp, setComp] = useState(competencia || new Date().toISOString().slice(0, 7))
  const [sim, setSim] = useState<PayrollSimulation | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [justification, setJustification] = useState('')
  const [closing, setClosing] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      setSim(await simulatePayroll(comp))
    } catch {
      toast.error('Erro ao simular folha')
    }
    setLoading(false)
  }

  const handleClose = async () => {
    if (!payrollId) {
      toast.error('Selecione uma folha para fechar')
      return
    }
    if (!justification.trim()) {
      toast.error('Justificativa obrigatória')
      return
    }
    setClosing(true)
    try {
      const itemsJson =
        sim?.items.map((i) => ({
          employee_id: i.employee_id,
          employee_name: i.employee_name,
          valor_liquido: i.valor_liquido,
          inss_value: i.inss.value,
          irrf_value: i.irrf.value,
          fgts_value: i.fgts,
        })) || []
      await rhUpdate('rh_payroll', payrollId, {
        situacao: 'Fechada',
        itens: itemsJson,
        valor_bruto: String(sim?.total_bruto || 0),
        valor_liquido: String(sim?.total_liquido || 0),
        total_encargos: String(sim?.total_encargos || 0),
        observacoes: 'Fechada por ' + (user?.name || user?.email || 'Admin') + ': ' + justification,
      })
      toast.success('Folha fechada - títulos a pagar gerados')
      onClosed?.()
    } catch {
      toast.error('Erro ao fechar folha')
    }
    setClosing(false)
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Competência</Label>
          <Input
            type="month"
            value={comp}
            onChange={(e) => setComp(e.target.value)}
            className="w-40"
          />
        </div>
        <Button
          onClick={run}
          disabled={loading}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Calculator className="w-4 h-4 mr-2" />
          )}
          Simular
        </Button>
      </div>
      {sim && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Bruto</p>
                <p className="font-bold">{fmt(sim.total_bruto)}</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Líquido</p>
                <p className="font-bold text-[#005B2E]">{fmt(sim.total_liquido)}</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-amber-600/20">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Encargos</p>
                <p className="font-bold text-amber-600">{fmt(sim.total_encargos)}</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-red-600/20">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">FGTS</p>
                <p className="font-bold text-red-600">{fmt(sim.total_fgts)}</p>
              </CardContent>
            </Card>
          </div>
          <Card className="border-2 border-[#005B2E]/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#01361D] text-white">
                    <th className="px-2 py-2 w-8"></th>
                    <th className="text-left px-2 py-2 font-bold">Colaborador</th>
                    <th className="text-right px-2 py-2 font-bold hidden md:table-cell">Base</th>
                    <th className="text-right px-2 py-2 font-bold">INSS</th>
                    <th className="text-right px-2 py-2 font-bold hidden md:table-cell">IRRF</th>
                    <th className="text-right px-2 py-2 font-bold hidden md:table-cell">FGTS</th>
                    <th className="text-right px-2 py-2 font-bold">Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {sim.items.map((item) => (
                    <SimRow
                      key={item.employee_id}
                      item={item}
                      expanded={expanded === item.employee_id}
                      onToggle={() =>
                        setExpanded(expanded === item.employee_id ? null : item.employee_id)
                      }
                      fmt={fmt}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          {payrollId && (
            <div className="space-y-2">
              <Textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Justificativa para fechamento..."
                rows={2}
                className="focus-visible:ring-[#005B2E]"
              />
              <Button
                onClick={handleClose}
                disabled={closing}
                className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                {closing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Confirmar Fechamento e Gerar Títulos
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SimRow({
  item,
  expanded,
  onToggle,
  fmt,
}: {
  item: PayrollItem
  expanded: boolean
  onToggle: () => void
  fmt: (v: number) => string
}) {
  return (
    <>
      <tr className="border-b border-border hover:bg-[#005B2E]/5 cursor-pointer" onClick={onToggle}>
        <td className="px-2 py-2">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </td>
        <td className="px-2 py-2 font-medium">
          {item.employee_name}
          <span className="block text-xs text-muted-foreground">{item.cargo}</span>
        </td>
        <td className="px-2 py-2 text-right hidden md:table-cell">{fmt(item.salario_base)}</td>
        <td className="px-2 py-2 text-right text-amber-600">{fmt(item.inss.value)}</td>
        <td className="px-2 py-2 text-right hidden md:table-cell">{fmt(item.irrf.value)}</td>
        <td className="px-2 py-2 text-right hidden md:table-cell text-red-600">{fmt(item.fgts)}</td>
        <td className="px-2 py-2 text-right font-bold text-[#005B2E]">{fmt(item.valor_liquido)}</td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={7} className="px-4 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Salário Base:</span>{' '}
                <strong>{fmt(item.salario_base)}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Horas Extras:</span>{' '}
                <strong>{fmt(item.horas_extras)}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Ad. Noturno:</span>{' '}
                <strong>{fmt(item.adicional_noturno)}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Faltas:</span>{' '}
                <strong>{fmt(item.faltas_deducao)}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Benefícios:</span>{' '}
                <strong>{fmt(item.beneficios)}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Valor Bruto:</span>{' '}
                <strong>{fmt(item.valor_bruto)}</strong>
              </div>
              <div className="col-span-2 border-t pt-1 mt-1">
                <span className="text-muted-foreground">INSS:</span>{' '}
                <strong>{item.inss.bracketLabel}</strong> {'->'}{' '}
                <strong>{fmt(item.inss.value)}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">IRRF:</span>{' '}
                <strong>{item.irrf.bracketLabel}</strong> {'->'}{' '}
                <strong>{fmt(item.irrf.value)}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">FGTS (8%):</span>{' '}
                <strong>{fmt(item.fgts)}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Dependentes:</span>{' '}
                <strong>{item.dependentes}</strong>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
