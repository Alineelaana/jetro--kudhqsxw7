import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, GitBranch, ArrowDown, ArrowUp, ShieldAlert } from 'lucide-react'
import { TraceabilityRecallDialog } from '@/components/industry/traceability-recall-dialog'
import { getTraceability } from '@/services/industrial-extended'
import { useRealtime } from '@/hooks/use-realtime'

export function TraceabilityPanel() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [recallOpen, setRecallOpen] = useState(false)

  const load = async () => {
    try {
      setRecords(await getTraceability())
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('industrial_traceability', () => load())

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    if (!term) return true
    return [
      r.lot_number,
      r.serial_number,
      r.operator_name,
      r.expand?.product_id?.name,
      r.expand?.production_order_id?.order_number,
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(term))
  })

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <GitBranch className="w-6 h-6 text-[#005B2E]" />
        <h2 className="text-xl font-black text-foreground">Rastreabilidade</h2>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por lote, serial, operador, produto, OP..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Button
              onClick={() => setRecallOpen(true)}
              variant="outline"
              className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 font-bold shrink-0"
            >
              <ShieldAlert className="w-4 h-4 mr-2" />
              Recall / Auditoria
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-[#01361D] text-white">
                  <th className="text-left px-3 py-2 font-bold">Direcao</th>
                  <th className="text-left px-3 py-2 font-bold">OP</th>
                  <th className="text-left px-3 py-2 font-bold">Produto</th>
                  <th className="text-left px-3 py-2 font-bold">Materia-prima</th>
                  <th className="text-left px-3 py-2 font-bold">Lote</th>
                  <th className="text-left px-3 py-2 font-bold">Serial</th>
                  <th className="text-left px-3 py-2 font-bold">Operador</th>
                  <th className="text-left px-3 py-2 font-bold">Recurso</th>
                  <th className="text-left px-3 py-2 font-bold">Qtd</th>
                  <th className="text-left px-3 py-2 font-bold">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2">
                      {r.direction === 'entrada' ? (
                        <ArrowDown className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowUp className="w-4 h-4 text-blue-600" />
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {r.expand?.production_order_id?.order_number || '—'}
                    </td>
                    <td className="px-3 py-2">{r.expand?.product_id?.name || '—'}</td>
                    <td className="px-3 py-2">{r.expand?.raw_material_id?.name || '—'}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {r.lot_number || '—'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{r.serial_number || '—'}</td>
                    <td className="px-3 py-2">{r.operator_name || '—'}</td>
                    <td className="px-3 py-2">{r.expand?.resource_id?.name || '—'}</td>
                    <td className="px-3 py-2 font-bold">{r.quantity || '—'}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {r.timestamp ? new Date(r.timestamp).toLocaleString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-6 text-muted-foreground">
                      Nenhum registro de rastreabilidade encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">{filtered.length} registro(s) encontrado(s)</p>
      <TraceabilityRecallDialog open={recallOpen} onOpenChange={setRecallOpen} />
    </div>
  )
}
