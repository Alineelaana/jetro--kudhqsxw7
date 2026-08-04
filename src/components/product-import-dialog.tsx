import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, FileSpreadsheet } from 'lucide-react'
import { createProduct, getNextProductCode } from '@/services/products'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  return lines.slice(1).map((line) => {
    const values = line.split(',')
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = (values[i] || '').trim()
    })
    return row
  })
}

export function ProductImportDialog({ open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast({ title: 'Selecione um arquivo', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (rows.length === 0) {
        toast({ title: 'Arquivo vazio ou inválido', variant: 'destructive' })
        setLoading(false)
        return
      }
      let success = 0
      for (const row of rows) {
        try {
          const { number } = await getNextProductCode()
          const fd = new FormData()
          fd.append('code', number)
          fd.append('name', row.name || row.nome || 'Produto')
          fd.append(
            'description',
            row.description || row.descricao || row.name || row.nome || 'Importado',
          )
          fd.append('ean', row.ean || '')
          fd.append('ncm', row.ncm || '')
          fd.append('brand', row.brand || row.marca || '')
          fd.append('category', row.category || row.categoria || '')
          fd.append('unit', row.unit || row.unidade || 'un')
          fd.append('price', row.price || row.preco || '')
          fd.append('stock', row.stock || row.estoque || '0')
          fd.append('active', 'true')
          await createProduct(fd)
          success++
        } catch {
          /* skip failed row */
        }
      }
      toast({ title: `${success} produto(s) importado(s)` })
      onSuccess()
      onOpenChange(false)
      setFileName('')
    } catch {
      toast({ title: 'Erro ao importar', variant: 'destructive' })
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E]">Importar Planilha</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg border border-border text-sm text-muted-foreground">
            <p className="font-semibold mb-1">Formato CSV com colunas:</p>
            <p className="text-xs">
              name, description, ean, ncm, brand, category, unit, price, stock
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Arquivo CSV</Label>
            <Input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
              className="focus-visible:ring-[#005B2E]"
            />
            {fileName && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3" />
                {fileName}
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={loading}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}{' '}
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
