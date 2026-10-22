import * as XLSX from 'xlsx'
import { generateRhDpSstPdf } from '@/lib/rh-dp-pdf-export'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from 'sonner'

export interface ExportActionsProps {
  title: string
  subtitle?: string
  headers: string[]
  data: (string | number | boolean | null | undefined)[][]
  filenamePrefix?: string
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExportActions({
  title,
  subtitle,
  headers,
  data,
  filenamePrefix = 'export',
  className = '',
  size = 'sm',
}: ExportActionsProps) {
  const handleExportExcel = () => {
    try {
      if (!data || data.length === 0) {
        toast.error('Nenhum dado para exportar')
        return
      }

      const rows = [
        headers,
        ...data.map((row) =>
          row.map((val) => (val === null || val === undefined ? '' : String(val))),
        ),
      ]
      const ws = XLSX.utils.aoa_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Dados')

      const dateStr = new Date().toISOString().slice(0, 10)
      XLSX.writeFile(wb, `${filenamePrefix}_${dateStr}.xlsx`)
      toast.success('Planilha Excel gerada com sucesso!')
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao gerar planilha Excel')
    }
  }

  const handleExportPdf = () => {
    try {
      if (!data || data.length === 0) {
        toast.error('Nenhum dado para exportar')
        return
      }

      generateRhDpSstPdf(
        {
          title,
          module: 'HURAM',
          headers,
          rows: data.map((row) =>
            row.map((val) => (val === null || val === undefined ? '' : String(val))),
          ),
          summary: subtitle ? [{ label: 'Descrição', value: subtitle }] : undefined,
        },
        'Usuário HURAM',
      )
      toast.success('Documento PDF gerado com sucesso!')
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao gerar documento PDF')
    }
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Button
        variant="outline"
        size={size}
        onClick={handleExportExcel}
        className="h-8 text-xs font-medium border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
        title="Exportar para planilha Excel (.xlsx)"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
        Excel
      </Button>

      <Button
        variant="outline"
        size={size}
        onClick={handleExportPdf}
        className="h-8 text-xs font-medium border-red-600/30 text-red-700 hover:bg-red-50 hover:text-red-800"
        title="Exportar para documento PDF"
      >
        <FileText className="w-3.5 h-3.5 mr-1 text-red-600" />
        PDF
      </Button>
    </div>
  )
}
