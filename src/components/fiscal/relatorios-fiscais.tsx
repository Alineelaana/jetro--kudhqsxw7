import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { exportCsv } from '@/lib/csv-export'
import { FileText, Download, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'

const REPORTS = [
  {
    key: 'entradas',
    label: 'Notas de Entrada',
    cols: ['Fornecedor', 'Número', 'Valor', 'Status', 'Data'],
  },
  {
    key: 'saidas',
    label: 'Notas de Saída',
    cols: ['Cliente', 'Número', 'Valor', 'Status', 'Data'],
  },
  {
    key: 'cancelados',
    label: 'Cancelados/Rejeitados',
    cols: ['Documento', 'Número', 'Motivo', 'Data'],
  },
  { key: 'icms', label: 'Apuração ICMS', cols: ['Período', 'Débitos', 'Créditos', 'A Recolher'] },
  {
    key: 'pis_cofins',
    label: 'PIS/COFINS',
    cols: ['Período', 'Débitos', 'Créditos', 'A Recolher'],
  },
  { key: 'iss', label: 'ISS', cols: ['Período', 'Município', 'Débitos', 'Créditos', 'A Recolher'] },
  { key: 'cbs_ibs', label: 'CBS/IBS', cols: ['Período', 'CBS', 'IBS', 'Créditos', 'Débitos'] },
  { key: 'seletivo', label: 'Imposto Seletivo', cols: ['Produto', 'Período', 'Alíquota', 'Valor'] },
  {
    key: 'creditos',
    label: 'Créditos/Débitos Reforma',
    cols: ['Documento', 'CBS', 'IBS', 'Seletivo', 'Saldo'],
  },
  {
    key: 'comparativo',
    label: 'Comparativo Tributário',
    cols: ['Produto', 'Atual', 'Transição', 'Pós-Reforma', 'Diferença'],
  },
  {
    key: 'correcoes',
    label: 'Cartas de Correção',
    cols: ['Nota', 'Correção', 'Protocolo', 'Data'],
  },
  { key: 'manifestacao', label: 'Manifestações', cols: ['Documento', 'Emitente', 'Tipo', 'Data'] },
  { key: 'sped', label: 'SPED', cols: ['Tipo', 'Período', 'Status', 'Recibo'] },
  {
    key: 'livros',
    label: 'Livros Fiscais',
    cols: ['Tipo', 'Período', 'Débitos', 'Créditos', 'Saldo'],
  },
]

export function RelatoriosFiscais() {
  const handleExportCsv = (report: (typeof REPORTS)[0]) => {
    exportCsv(`relatorio_fiscal_${report.key}`, report.cols, [report.cols.map((c) => '—')])
    toast.success(`Relatório ${report.label} exportado (CSV)`)
  }

  const handleExportPdf = (report: (typeof REPORTS)[0]) => {
    const win = window.open('', '_blank')
    if (!win) {
      toast.error('Pop-up bloqueado')
      return
    }
    win.document.write(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatório ${report.label}</title><style>body{font-family:Arial;padding:20px}h1{color:#005B2E}table{width:100%;border-collapse:collapse}th{background:#005B2E;color:#fff;padding:8px}td{border:1px solid #ddd;padding:6px}</style></head><body><h1>Relatório Fiscal — ${report.label}</h1><p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p><table><tr>${report.cols.map((c) => `<th>${c}</th>`).join('')}</tr></table></body></html>`,
    )
    win.document.close()
    setTimeout(() => win.print(), 500)
    toast.success(`Relatório ${report.label} exportado (PDF)`)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Relatórios Fiscais</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORTS.map((r) => (
          <Card
            key={r.key}
            className="border-2 border-[#005B2E]/20 hover:shadow-lg transition-shadow"
          >
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-[#005B2E]" />
                <span className="font-bold text-sm">{r.label}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportCsv(r)}
                  className="border-[#005B2E] text-[#005B2E] flex-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Excel
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportPdf(r)}
                  className="border-[#C89B3C] text-[#C89B3C] flex-1"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
