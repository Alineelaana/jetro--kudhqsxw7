import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Loader2, History } from 'lucide-react'
import { getProductHistory } from '@/services/products'
import type { Product } from '@/lib/product-types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

interface AuditEntry {
  id: string
  action: string
  user_name: string
  created: string
  target_summary: string
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Criado',
  update: 'Editado',
  delete: 'Excluído',
  activate: 'Ativado',
  deactivate: 'Inativado',
  duplicate: 'Duplicado',
}

export function ProductHistoryDialog({ open, onOpenChange, product }: Props) {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && product) {
      setLoading(true)
      getProductHistory(product.id)
        .then((res) => setEntries((res.items as unknown as AuditEntry[]) || []))
        .catch(() => setEntries([]))
        .finally(() => setLoading(false))
    }
  }, [open, product])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E] flex items-center gap-2">
            <History className="w-5 h-5" /> Histórico do Produto
          </DialogTitle>
          {product && (
            <p className="text-sm text-muted-foreground">
              {product.name} — Código: {product.code}
            </p>
          )}
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum registro encontrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[#005B2E]">
                        {ACTION_LABELS[e.action] || e.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(e.created).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm">
                      Por: <span className="font-semibold">{e.user_name || 'Sistema'}</span>
                    </p>
                    {e.target_summary && e.target_summary !== product?.id && (
                      <p className="text-xs text-muted-foreground mt-0.5">{e.target_summary}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
