import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getReverseOperations } from '@/services/logistics'
import { getPurchaseRequests } from '@/services/purchasing'
import { useRealtime } from '@/hooks/use-realtime'
import { Search, Loader2, PackageSearch } from 'lucide-react'

export function LogisticsCollections() {
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [purchaseReqs, setPurchaseReqs] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const [ops, reqs] = await Promise.all([
        getReverseOperations().catch(() => []),
        getPurchaseRequests().catch(() => []),
      ])
      setRecords(ops)
      setPurchaseReqs(reqs as unknown as Record<string, unknown>[])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_reverse_operations', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      String(r.numero_operacao || '')
        .toLowerCase()
        .includes(t) ||
      String(r.cliente_fornecedor || '')
        .toLowerCase()
        .includes(t)
    )
  })

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20 p-3">
        <p className="text-xs text-muted-foreground">
          <PackageSearch className="w-3 h-3 inline mr-1" />
          {purchaseReqs.length} solicitação(ões) de compra podem gerar necessidade de coleta
        </p>
      </Card>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar coleta..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Operação</th>
                <th className="text-left px-3 py-2 font-bold">Cliente/Fornecedor</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Tipo</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Origem</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center text-muted-foreground">
                    <PackageSearch className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Nenhuma coleta encontrada
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={i} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-mono text-xs font-bold text-[#C89B3C]">
                      {r.numero_operacao}
                    </td>
                    <td className="px-3 py-2 font-medium">{r.cliente_fornecedor || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell">{r.tipo_operacao || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs">{r.origem || '—'}</td>
                    <td className="px-3 py-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {r.status as string}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
