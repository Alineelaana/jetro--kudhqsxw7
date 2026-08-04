import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DollarSign,
  UserPlus,
  UserMinus,
  Calendar,
  Clock,
  FileText,
  Download,
  FileWarning,
  BarChart3,
  HardHat,
} from 'lucide-react'
import { toast } from 'sonner'
import { exportCsv } from '@/lib/csv-export'

const REPORTS = [
  { key: 'folha', label: 'Folha de Pagamento', icon: DollarSign },
  { key: 'encargos', label: 'Encargos Trabalhistas', icon: BarChart3 },
  { key: 'admissoes', label: 'Admissões', icon: UserPlus },
  { key: 'desligamentos', label: 'Desligamentos', icon: UserMinus },
  { key: 'ferias', label: 'Férias', icon: Calendar },
  { key: 'afastamentos', label: 'Afastamentos', icon: FileWarning },
  { key: 'horas_extras', label: 'Horas Extras', icon: Clock },
  { key: 'banco_horas', label: 'Banco de Horas', icon: Clock },
  { key: 'faltas_atrasos', label: 'Faltas e Atrasos', icon: Clock },
  { key: '13_salario', label: '13º Salário', icon: DollarSign },
  { key: 'esocial', label: 'eSocial', icon: FileText },
  { key: 'exames', label: 'Exames Ocupacionais', icon: FileWarning },
  { key: 'epis', label: 'EPIs e Uniformes', icon: HardHat },
  { key: 'documentos', label: 'Documentos Obrigatórios', icon: FileText },
]

export function DpReports() {
  const handleExport = (reportKey: string, reportLabel: string) => {
    exportCsv(
      `relatorio_dp_${reportKey}`,
      ['Relatório', 'Data Geração', 'Filtro'],
      [[reportLabel, new Date().toLocaleString('pt-BR'), 'Todos']],
    )
    toast.success(`Relatório "${reportLabel}" exportado`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Relatórios DP</h3>
        <FileText className="w-5 h-5 text-[#005B2E]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORTS.map((r) => {
          const Icon = r.icon
          return (
            <Card
              key={r.key}
              className="border-2 border-[#005B2E]/20 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-lg bg-[#005B2E]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#005B2E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{r.label}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExport(r.key, r.label)}
                  className="text-[#005B2E] border-[#005B2E]/30 hover:bg-[#005B2E]/10"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Exportar
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
