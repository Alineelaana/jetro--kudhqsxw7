import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getStockLocations } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { type StockLocation } from '@/lib/stock-types'
import { Loader2, Search, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WmsWarehouseMap() {
  const [locations, setLocations] = useState<StockLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<StockLocation | null>(null)

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
      (l.descricao || '').toLowerCase().includes(t) ||
      (l.rua || '').toLowerCase().includes(t)
    )
  })

  const getColor = (l: StockLocation) => {
    if (l.situacao !== 'Ativo') return 'bg-gray-300'
    if (l.tipo === 'Recebimento') return 'bg-blue-200'
    if (l.tipo === 'Expedição') return 'bg-indigo-200'
    if (l.tipo === 'Separação' || l.tipo === 'Picking') return 'bg-purple-200'
    if (l.tipo === 'Quarentena') return 'bg-red-200'
    if (l.tipo === 'Avaria') return 'bg-orange-200'
    return 'bg-emerald-200'
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const grouped = filtered.reduce(
    (acc, l) => {
      const key = l.rua || 'Sem Rua'
      ;(acc[key] = acc[key] || []).push(l)
      return acc
    },
    {} as Record<string, StockLocation[]>,
  )

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar localização..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { c: 'bg-blue-200', l: 'Recebimento' },
          { c: 'bg-emerald-200', l: 'Armazenagem' },
          { c: 'bg-purple-200', l: 'Picking/Separação' },
          { c: 'bg-indigo-200', l: 'Expedição' },
          { c: 'bg-red-200', l: 'Quarentena' },
          { c: 'bg-gray-300', l: 'Inativo' },
        ].map((i) => (
          <span key={i.l} className="flex items-center gap-1">
            <span className={`w-4 h-4 rounded ${i.c}`} /> {i.l}
          </span>
        ))}
      </div>
      <div className="space-y-4">
        {Object.entries(grouped).map(([rua, locs]) => (
          <Card key={rua} className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-[#005B2E] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {rua}
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {locs.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelected(l)}
                    className={cn(
                      'aspect-square rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-all flex items-center justify-center text-[10px] font-bold p-1',
                      getColor(l),
                    )}
                    title={`${l.codigo} - ${l.descricao || ''}`}
                  >
                    {l.codigo}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {selected && (
        <Card className="border-2 border-[#C89B3C]/40">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-[#005B2E] mb-2">{selected.codigo}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Descrição:</span>{' '}
                <span className="font-medium">{selected.descricao || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo:</span>{' '}
                <span className="font-medium">{selected.tipo}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Capacidade:</span>{' '}
                <span className="font-medium">{selected.capacidade || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Situação:</span>{' '}
                <span className="font-medium">{selected.situacao}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Rua:</span>{' '}
                <span className="font-medium">{selected.rua || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Coluna:</span>{' '}
                <span className="font-medium">{selected.coluna || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Nível:</span>{' '}
                <span className="font-medium">{selected.nivel || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Posição:</span>{' '}
                <span className="font-medium">{selected.posicao || '—'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
