import { useState } from 'react'
import { Download, FileText, Image, FileSpreadsheet, Printer, FileCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useCorporateDocuments } from '@/hooks/use-corporate-documents'
import {
  FORMAT_LABELS,
  ALL_FORMATS,
  type ExportFormat,
  type DocumentSection,
} from '@/lib/corporate-document-engine/types'
import { toast } from 'sonner'

interface CorporateExportBarProps {
  title: string
  module: string
  documentType: string
  sections: DocumentSection[]
  recordCount?: number
  filters?: Record<string, string>
  formats?: ExportFormat[]
  className?: string
}

const FORMAT_ICONS: Partial<Record<ExportFormat, typeof FileText>> = {
  pdf: FileText,
  print: Printer,
  png: Image,
  jpg: Image,
  csv: FileSpreadsheet,
  excel: FileSpreadsheet,
  html: FileCode,
}

export function CorporateExportBar({
  title,
  module,
  documentType,
  sections,
  recordCount,
  filters,
  formats = ['pdf', 'excel', 'csv', 'png', 'print'],
  className,
}: CorporateExportBarProps) {
  const { generate } = useCorporateDocuments()
  const [loading, setLoading] = useState<ExportFormat | null>(null)

  const handleExport = async (format: ExportFormat) => {
    setLoading(format)
    try {
      const result = await generate({
        title,
        module,
        documentType,
        format,
        sections,
        recordCount,
        filters,
      })
      if (result.success) {
        toast.success(`${FORMAT_LABELS[format]} gerado com sucesso`)
      } else {
        toast.error(result.error || 'Erro ao gerar documento')
      }
    } catch {
      toast.error('Erro ao gerar documento')
    } finally {
      setLoading(null)
    }
  }

  const availableFormats = ALL_FORMATS.filter((f) => formats.includes(f))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading !== null} className={cn(className)}>
          <Download className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Gerando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Corporate Document Engine</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableFormats.map((format) => {
          const Icon = FORMAT_ICONS[format] || FileText
          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              disabled={loading !== null}
            >
              <Icon className="w-3.5 h-3.5 mr-2" />
              {FORMAT_LABELS[format]}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
