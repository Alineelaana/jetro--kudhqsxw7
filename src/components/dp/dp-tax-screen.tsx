import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { DpLoading, DpTable } from '@/components/dp/dp-shared'
import { simulatePayroll, type PayrollSimulation } from '@/services/rh-payroll'
import { Loader2, Calculator, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { generateRhDpSstPdf } from '@/lib/rh-dp-pdf-export'

const TAX_INFO: Record<string, { title: string; rate: string }> = {
  fgts: { title: 'FGTS', rate: '8%' },
  inss: { title: 'INSS', rate: 'Progressivo' },
  irrf: { title: 'IRRF', rate: 'Progressivo' },
}

export function DpTaxScreen({ taxType }: { taxType: 'fgts' | 'inss' | 'irrf' }) {
  const info = TAX_INFO[taxType]
  const [competencia, setCompetencia] = useState(new Date().toISOString().slice(0, 7))
  const [sim, setSim] = useState<PayrollSimulation | null>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      setSim(await simulatePayroll(competencia))
    } catch {
      toast.error('Erro ao calcular')
      setSim(null)
    }
    setLoading(false)
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const getTaxValue = (i: PayrollSimulation['items'][0]) =>
    taxType === 'fgts' ? i.fgts : taxType === 'inss' ? i.inss.value : i.irrf.value
  const getTaxBracket = (i: PayrollSimulation['items'][0]) =>
    taxType === 'fgts' ? '8%' : taxType === 'inss' ? i.inss.bracketLabel : i.irrf.bracketLabel
  const getTotal = () =>
    taxType === 'fgts' ? sim!.total_fgts : taxType === 'inss' ? sim!.total_inss : sim!.total_irrf

  const handleExport = () => {
    if (!sim) return
    const rows = sim.items.map((i) => [
      i.employee_name,
      i.cargo,
      i.departamento,
      fmt(i.salario_base),
      fmt(getTaxValue(i)),
      competencia,
    ])
    generateRhDpSstPdf(
      {
        title: `Relatório ${info.title} — ${competencia}`,
        module: 'DP',
        headers: [
          'Colaborador',
          'Cargo',
          'Departamento',
          'Salário Base',
          info.title,
          'Competência',
        ],
        rows,
        summary: [
          { label: 'Total', value: fmt(getTotal()) },
          { label: 'Colaboradores', value: sim.items.length },
        ],
      },
      'Sistema',
    )
    toast.success('Relatório PDF gerado')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1">
          <Label className="text-xs">Competência</Label>
          <Input
            type="month"
            value={competencia}
            onChange={(e) => setCompetencia(e.target.value)}
            className="w-40 focus-visible:ring-[#005B2E]"
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
          )}{' '}
          Calcular
        </Button>
        {sim && (
          <Button
            variant="outline"
            onClick={handleExport}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <FileText className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
        )}
      </div>
      {loading ? (
        <DpLoading />
      ) : sim ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Total {info.title}</p>
                <p className="font-bold text-[#005B2E]">{fmt(getTotal())}</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Total Bruto</p>
                <p className="font-bold">{fmt(sim.total_bruto)}</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Colaboradores</p>
                <p className="font-bold">{sim.items.length}</p>
              </CardContent>
            </Card>
          </div>
          <DpTable
            headers={['Colaborador', 'Cargo', 'Departamento', 'Salário Base', info.title, 'Faixa']}
          >
            {sim.items.map((i) => (
              <tr key={i.employee_id} className="border-b border-border hover:bg-[#005B2E]/5">
                <td className="px-3 py-3 font-medium">{i.employee_name}</td>
                <td className="px-3 py-3 text-xs">{i.cargo}</td>
                <td className="px-3 py-3 text-xs">{i.departamento}</td>
                <td className="px-3 py-3">{fmt(i.salario_base)}</td>
                <td className="px-3 py-3 font-bold text-[#005B2E]">{fmt(getTaxValue(i))}</td>
                <td className="px-3 py-3 text-xs">{getTaxBracket(i)}</td>
              </tr>
            ))}
          </DpTable>
        </>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Selecione uma competência e clique em Calcular</p>
            <p className="text-sm text-muted-foreground mt-1">
              Os valores serão calculados com base nas tabelas tributárias configuradas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
