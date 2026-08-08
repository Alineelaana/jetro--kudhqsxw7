import { Button } from '@/components/ui/button'
import { FileDown, FileText, Image as ImageIcon, Printer } from 'lucide-react'
import { exportBICsv, exportBIPdf, exportBIImage, exportBIPrint } from '@/lib/bi-export'

interface Props {
  title: string
  headers: string[]
  rows: (string | number)[][]
  userName: string
}

export function ControladoriaExportBar({ title, headers, rows, userName }: Props) {
  return (
    <div className="flex gap-1 flex-wrap">
      <Button
        size="sm"
        variant="outline"
        onClick={() => exportBICsv(title, headers, rows, userName)}
      >
        <FileDown className="w-3.5 h-3.5 mr-1" /> CSV
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => exportBIPdf(title, headers, rows, userName)}
      >
        <FileText className="w-3.5 h-3.5 mr-1" /> PDF
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => exportBIImage(title, headers, rows, userName)}
      >
        <ImageIcon className="w-3.5 h-3.5 mr-1" /> Imagem
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => exportBIPrint(title, headers, rows, userName)}
      >
        <Printer className="w-3.5 h-3.5 mr-1" /> Imprimir
      </Button>
    </div>
  )
}
