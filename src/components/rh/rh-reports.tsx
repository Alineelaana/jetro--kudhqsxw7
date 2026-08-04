import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Users,
  UserPlus,
  UserMinus,
  TrendingUp,
  Clock,
  Calendar,
  DollarSign,
  Gift,
  GraduationCap,
  FileWarning,
  BarChart3,
  Building2,
  Briefcase,
  FileText,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { exportCsv } from '@/lib/csv-export'

const REPORTS = [
  { key: 'ativos', label: 'Colaboradores Ativos', icon: Users },
  { key: 'por_departamento', label: 'Colaboradores por Departamento', icon: Building2 },
  { key: 'por_cargo', label: 'Colaboradores por Cargo', icon: Briefcase },
  { key: 'admissoes', label: 'Admissões', icon: UserPlus },
  { key: 'desligamentos', label: 'Desligamentos', icon: UserMinus },
  { key: 'turnover', label: 'Turnover', icon: TrendingUp },
  { key: 'absenteismo', label: 'Absenteísmo', icon: Clock },
  { key: 'horas_extras', label: 'Horas Extras', icon: Clock },
  { key: 'banco_horas', label: 'Banco de Horas', icon: Clock },
  { key: 'faltas_atrasos', label: 'Faltas e Atrasos', icon: Clock },
  { key: 'ferias', label: 'Férias', icon: Calendar },
  { key: 'folha', label: 'Folha de Pagamento', icon: DollarSign },
  { key: 'beneficios', label: 'Benefícios', icon: Gift },
  { key: 'treinamentos', label: 'Treinamentos', icon: GraduationCap },
  { key: 'documentos', label: 'Documentos Pendentes', icon: FileWarning },
  { key: 'custos_colaborador', label: 'Custos por Colaborador', icon: BarChart3 },
  { key: 'custos_departamento', label: 'Custos por Departamento', icon: Building2 },
  { key: 'custos_centro_custo', label: 'Custos por Centro de Custo', icon: BarChart3 },
]

export function RhReports() {
  const handleExport = (reportKey: string, reportLabel: string) => {
    const headers = ['Relatório', 'Data Geração', 'Filtro']
    const rows: (string | number)[][] = [[reportLabel, new Date().toLocaleString('pt-BR'), 'Todos']]
    exportCsv(`relatorio_rh_${reportKey}`, headers, rows)
    toast.success(`Relatório "${reportLabel}" exportado`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Relatórios de RH</h3>
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
