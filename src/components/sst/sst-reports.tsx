import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  FileText,
  Download,
  AlertTriangle,
  Shield,
  ClipboardCheck,
  HardHat,
  FileWarning,
  Activity,
  Syringe,
  Award,
  BarChart3,
  FileCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { exportCsv } from '@/lib/csv-export'

const REPORTS = [
  { key: 'acidentes', label: 'Acidentes de Trabalho', icon: AlertTriangle },
  { key: 'incidentes', label: 'Incidentes', icon: Activity },
  { key: 'cat', label: 'CAT', icon: FileWarning },
  { key: 'epis', label: 'Gestão de EPIs', icon: Shield },
  { key: 'epcs', label: 'Gestão de EPCs', icon: Shield },
  { key: 'aso', label: 'ASO', icon: FileCheck },
  { key: 'pcmso', label: 'PCMSO', icon: FileText },
  { key: 'pgr', label: 'PGR', icon: FileWarning },
  { key: 'nao_conformidades', label: 'Não Conformidades', icon: AlertTriangle },
  { key: 'inspecoes', label: 'Inspeções', icon: ClipboardCheck },
  { key: 'auditorias', label: 'Auditorias Internas', icon: ClipboardCheck },
  { key: 'treinamentos', label: 'Treinamentos Obrigatórios', icon: HardHat },
  { key: 'vacinacao', label: 'Vacinação', icon: Syringe },
  { key: 'certificados', label: 'Certificados', icon: Award },
  { key: 'indicadores', label: 'Indicadores SST', icon: BarChart3 },
]

export function SstReports() {
  const handleExport = (reportKey: string, reportLabel: string) => {
    exportCsv(
      `relatorio_sst_${reportKey}`,
      ['Relatório', 'Data Geração', 'Filtro'],
      [[reportLabel, new Date().toLocaleString('pt-BR'), 'Todos']],
    )
    toast.success(`Relatório "${reportLabel}" exportado`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Relatórios SST</h3>
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
