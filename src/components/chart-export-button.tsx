import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ExportFormat } from '@/lib/chart-export-core'

interface Props {
  onExport: (format: ExportFormat) => void
  className?: string
}

export function ChartExportButton({ onExport, className }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn('h-7 w-7 p-0', className)}>
          <Download className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onExport('png')}>Exportar PNG</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('jpg')}>Exportar JPG</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
