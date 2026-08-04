import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import type { Product } from '@/lib/product-types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
}

export function ProductLabelsDialog({ open, onOpenChange, products }: Props) {
  const handlePrint = () => {
    const labels = products
      .map(
        (p) => `
      <div class="label">
        <div class="label-name">${(p.name || '').replace(/</g, '&lt;')}</div>
        <div class="label-code">Código: ${p.code || '—'}</div>
        <div class="label-ean">EAN: ${p.ean || '—'}</div>
        <div class="label-price">R$ ${p.price || '—'}</div>
      </div>`,
      )
      .join('')
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Etiquetas</title><style>
      @page{size:A4;margin:10mm}
      body{font-family:Arial,sans-serif}
      .labels{display:flex;flex-wrap:wrap;gap:5mm}
      .label{width:70mm;height:30mm;border:1px solid #005B2E;border-radius:3mm;padding:2mm;display:flex;flex-direction:column;justify-content:center}
      .label-name{font-size:11px;font-weight:bold;color:#005B2E;line-height:1.2;margin-bottom:1mm}
      .label-code{font-size:9px;color:#333}.label-ean{font-size:9px;color:#333}.label-price{font-size:14px;font-weight:bold;color:#01361D;margin-top:1mm}
    </style></head><body><div class="labels">${labels}</div><script>window.onload=function(){setTimeout(function(){window.print()},300)}</script></body></html>`
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E]">Imprimir Etiquetas</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {products.length} produto(s) selecionado(s) para impressão de etiquetas.
          </p>
          {products.length === 0 && (
            <p className="text-sm text-destructive">
              Selecione produtos na lista para imprimir etiquetas.
            </p>
          )}
          {products.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {products.map((p) => (
                <div key={p.id} className="text-sm p-2 rounded border border-border bg-muted/30">
                  {p.code} — {p.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            disabled={products.length === 0}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Printer className="w-4 h-4 mr-2" /> Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
