import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getStockLocations } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { type StockLocation } from '@/lib/stock-types'
import { Loader2, Search, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WmsOccupation() {
  const [locations, setLocations] = useState<StockLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setLocations(await getStockLocations())
    } catch {
      setLocations([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('stock_locations', () => load())

  const filtered = locations.filter((l) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (l.codigo || '').toLowerCase().includes(t) ||
      (l.descricao || '').toLowerCase().includes(t)
    )
  })

  const getOccupationPercent = (l: StockLocation) => {
    if (!l.capacidade || l.capacidade === 0) return 0
    const used = Array.isArray(l.produtos_armazenados) ? l.produtos_armazenados.length : 0
    return Math.min(100, Math.round((used / l.capacidade) * 100))
  }

  const alerts = filtered.filter((l) => {
    const pct = getOccupationPercent(l)
    return pct >= 80 || (l.situacao !== 'Ativo' && l.capacidade > 0)
  })

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      {alerts.length > 0 && (
        <Card className="border-2 border-amber-400 bg-amber-50">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">
              {alerts.length} localização(ões) com alerta de ocupação
            </span>
          </CardContent>
        </Card>
      )}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar localização..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Código</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Descrição</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Tipo</th>
                <th className="text-right px-3 py-2 font-bold">Capacidade</th>
                <th className="text-right px-3 py-2 font-bold">Ocupação</th>
                <th className="text-left px-3 py-2 font-bold">Situação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const pct = getOccupationPercent(l)
                const used = Array.isArray(l.produtos_armazenados)
                  ? l.produtos_armazenados.length
                  : 0
                return (
                  <tr key={l.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">{l.codigo}</td>
                    <td className="px-3 py-2 text-xs hidden md:table-cell">{l.descricao || '—'}</td>
                    <td className="px-3 py-2 text-xs hidden md:table-cell">{l.tipo}</td>
                    <td className="px-3 py-2 text-right">{l.capacidade || 0}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              pct >= 80
                                ? 'bg-red-500'
                                : pct >= 50
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-500',
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded',
                          l.situacao === 'Ativo'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600',
                        )}
                      >
                        {l.situacao}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
