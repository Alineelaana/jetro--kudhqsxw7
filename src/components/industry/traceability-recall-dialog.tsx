import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Loader2, GitBranch, ShieldAlert, AlertTriangle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/hooks/use-toast'

interface RecallResult {
  query: string
  records: Array<Record<string, unknown>>
  quality_records: Array<Record<string, unknown>>
  total: number
}

export function TraceabilityRecallDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RecallResult | null>(null)

  const handleSearch = async () => {
    if (!search.trim()) return
    setLoading(true)
    try {
      const res = await pb.send('/backend/v1/industrial/traceability/recall', {
        method: 'POST',
        body: JSON.stringify({ query: search.trim() }),
        headers: { 'Content-Type': 'application/json' },
      })
      setResult(res as RecallResult)
    } catch {
      toast({ title: 'Erro na consulta de recall', variant: 'destructive' })
    }
    setLoading(false)
  }

  const sevColor: Record<string, string> = {
    baixa: 'bg-gray-100 text-gray-600',
    media: 'bg-amber-100 text-amber-700',
    alta: 'bg-orange-100 text-orange-700',
    critica: 'bg-red-100 text-red-700',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#005B2E]" />
            Recall & Auditoria de Rastreabilidade
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por lote ou serial..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#005B2E] hover:bg-[#01361D]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
          </Button>
        </div>
        <ScrollArea className="max-h-[55vh] pr-4">
          {result && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {result.total} registro(s) encontrado(s) para "{result.query}"
              </p>
              {result.records.map((r, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-xs">
                      {String(r.lot_number || r.serial_number || '—')}
                    </Badge>
                    <Badge
                      className={
                        r.direction === 'entrada'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }
                    >
                      {String(r.direction || '—')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <span>
                      Produto:{' '}
                      <strong className="text-foreground">{String(r.product_name || '—')}</strong>
                    </span>
                    <span>
                      Matéria-prima:{' '}
                      <strong className="text-foreground">
                        {String(r.raw_material_name || '—')}
                      </strong>
                    </span>
                    <span>
                      OP:{' '}
                      <strong className="text-foreground">
                        {String(r.production_order_id || '—')}
                      </strong>
                    </span>
                    <span>
                      Recurso:{' '}
                      <strong className="text-foreground">{String(r.resource_name || '—')}</strong>
                    </span>
                    <span>
                      Operador:{' '}
                      <strong className="text-foreground">{String(r.operator_name || '—')}</strong>
                    </span>
                    <span>
                      Qtd: <strong className="text-foreground">{String(r.quantity || '—')}</strong>
                    </span>
                  </div>
                </div>
              ))}
              {result.quality_records.length > 0 && (
                <div className="border-2 border-red-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <h4 className="font-bold text-sm text-red-700">
                      Registros de Qualidade Vinculados
                    </h4>
                  </div>
                  {result.quality_records.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between text-xs border-b border-border pb-1"
                    >
                      <div>
                        <p className="font-medium">
                          {String(q.description || q.operation_name || '—')}
                        </p>
                        <p className="text-muted-foreground">OP: {String(q.order_number || '—')}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {q.severity && (
                          <Badge className={sevColor[q.severity] || ''}>{q.severity}</Badge>
                        )}
                        <Badge variant="outline">
                          {String(q.status || q.quality_status || '—')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {result.records.length === 0 && (
                <div className="text-center py-8">
                  <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum registro encontrado para o lote/serial informado.
                  </p>
                </div>
              )}
            </div>
          )}
          {!result && !loading && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Digite um número de lote ou serial para rastrear a cadeia completa.
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
