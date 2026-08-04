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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { getProducts } from '@/services/products'
import type { Product } from '@/lib/product-types'
import type { OrderItem } from '@/lib/purchasing-types'
import { toast } from 'sonner'

interface PreviewItem extends OrderItem {
  status: 'ok' | 'warning' | 'error'
  message: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (items: OrderItem[]) => void
}

function parseLine(line: string, delim: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (char === delim && !inQuotes) {
      result.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  result.push(current.trim())
  return result
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text
    .trim()
    .split('\n')
    .filter((l) => l.trim())
  if (lines.length < 2) return []
  const delim = lines[0].includes(';') ? ';' : ','
  const headers = parseLine(lines[0], delim).map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1).map((line) => {
    const values = parseLine(line, delim)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = (values[i] || '').trim()
    })
    return row
  })
}

function getField(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined) return row[k]
  }
  return ''
}

function parseBrNumber(str: string): number {
  if (!str) return 0
  const cleaned = str
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '')
  return parseFloat(cleaned) || 0
}

export function PurchaseOrderImportDialog({ open, onOpenChange, onConfirm }: Props) {
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<PreviewItem[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast.error('Selecione um arquivo')
      return
    }
    setLoading(true)
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (!rows.length) {
        toast.error('Arquivo vazio ou inválido. Use formato CSV.')
        setLoading(false)
        return
      }
      const products = await getProducts()
      const productMap = new Map<string, Product>()
      products.forEach((p) => {
        if (p.code) productMap.set(p.code.toLowerCase(), p)
      })
      const items: PreviewItem[] = rows.map((row) => {
        const code = getField(row, ['codigo', 'code', 'codigo_do_produto'])
        const product = getField(row, [
          'produto',
          'product',
          'descricao',
          'descrição',
          'description',
          'name',
          'nome',
        ])
        const qty = parseBrNumber(getField(row, ['quantidade', 'quantity', 'qtd', 'qty', 'qtde']))
        const price = parseBrNumber(
          getField(row, [
            'valor_unitario',
            'valor_unitário',
            'unit_price',
            'preco',
            'preço',
            'price',
            'valor_unit',
            'vlr_unit',
          ]),
        )
        const disc = parseBrNumber(getField(row, ['desconto', 'discount', 'desc']) || '0')
        const totalStr = getField(row, ['total', 'valor_total', 'vlr_total'])
        const total = totalStr ? parseBrNumber(totalStr) : qty * price - disc
        const matched = productMap.get(code.toLowerCase())
        const productName = matched?.name || product
        let status: PreviewItem['status'] = 'ok'
        let message = ''
        if (!code) {
          status = 'error'
          message = 'Código não informado'
        } else if (!matched) {
          status = 'warning'
          message = 'Código não encontrado'
        }
        if (qty <= 0) {
          status = 'error'
          message = message ? `${message}, qtd inválida` : 'Quantidade inválida'
        }
        if (price < 0) {
          status = 'error'
          message = message ? `${message}, valor inválido` : 'Valor inválido'
        }
        return {
          code,
          product: productName,
          quantity: String(qty),
          unit_price: price.toFixed(2),
          discount: disc.toFixed(2),
          total: total.toFixed(2),
          status,
          message,
        }
      })
      setPreview(items)
      setFileName(file.name)
    } catch {
      toast.error('Erro ao ler arquivo. Use formato CSV.')
    }
    setLoading(false)
  }

  const handleConfirm = () => {
    const valid = preview.filter((i) => i.status !== 'error')
    if (!valid.length) {
      toast.error('Nenhum item válido para importar')
      return
    }
    const items: OrderItem[] = valid.map(({ status, message, ...rest }) => rest)
    onConfirm(items)
    setPreview([])
    setFileName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleClose = (v: boolean) => {
    if (!v) {
      setPreview([])
      setFileName('')
      if (fileRef.current) fileRef.current.value = ''
    }
    onOpenChange(v)
  }

  const validCount = preview.filter((i) => i.status !== 'error').length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E]">
            Importar Planilha (XLS/CSV)
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg border border-border text-sm text-muted-foreground">
            <p className="font-semibold mb-1">Formato CSV com colunas:</p>
            <p className="text-xs">
              Código, Produto/Descrição, Quantidade, Valor Unitário, Desconto, Valor Total
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Arquivo CSV</Label>
            <Input
              ref={fileRef}
              type="file"
              accept=".csv,.xls"
              onChange={handleFile}
              className="focus-visible:ring-[#005B2E]"
            />
            {fileName && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3" />
                {fileName}
              </p>
            )}
          </div>
          {preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold">
                  Prévia dos Dados ({preview.length} itens)
                </Label>
                <div className="flex gap-3 text-xs">
                  <span className="text-green-600">
                    ✅ {preview.filter((i) => i.status === 'ok').length}
                  </span>
                  <span className="text-amber-600">
                    ⚠️ {preview.filter((i) => i.status === 'warning').length}
                  </span>
                  <span className="text-red-600">
                    ❌ {preview.filter((i) => i.status === 'error').length}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="text-left p-2">Código</th>
                      <th className="text-left p-2">Produto</th>
                      <th className="text-right p-2">Qtd</th>
                      <th className="text-right p-2">Vlr Unit</th>
                      <th className="text-right p-2">Desc</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((it, i) => (
                      <tr
                        key={i}
                        className={
                          it.status === 'error'
                            ? 'bg-red-50'
                            : it.status === 'warning'
                              ? 'bg-amber-50'
                              : ''
                        }
                      >
                        <td className="p-2">{it.code || '—'}</td>
                        <td className="p-2">{it.product || '—'}</td>
                        <td className="p-2 text-right">{it.quantity}</td>
                        <td className="p-2 text-right">{it.unit_price}</td>
                        <td className="p-2 text-right">{it.discount}</td>
                        <td className="p-2 text-right font-bold">{it.total}</td>
                        <td className="p-2">
                          <span className="flex items-center gap-1">
                            {it.status === 'ok' && (
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                            )}
                            {it.status === 'warning' && (
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            )}
                            {it.status === 'error' && <XCircle className="w-3 h-3 text-red-600" />}
                            {it.message || 'OK'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.some((i) => i.status === 'error') && (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Linhas com erro (❌) não serão importadas. Itens com aviso (⚠️) serão importados
                    mas o código não foi encontrado no cadastro de produtos.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || preview.length === 0}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Importar {preview.length > 0 ? `(${validCount} itens)` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
