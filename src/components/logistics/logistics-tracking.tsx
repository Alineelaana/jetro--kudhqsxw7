import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getTracking } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { TRACKING_STATUS } from '@/lib/logistics-types'
import { Search, Loader2, MapPin, Activity } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Em Trânsito': 'bg-cyan-100 text-cyan-700',
  'Saiu para Entrega': 'bg-indigo-100 text-indigo-700',
  Entregue: 'bg-emerald-100 text-emerald-700',
  'Ocorrência Registrada': 'bg-red-100 text-red-700',
}

export function LogisticsTracking() {
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setRecords(await getTracking())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_tracking', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    const veiculo = String(r.veiculo || '').toLowerCase()
    const motorista = String(r.motorista || '').toLowerCase()
    const cliente = String(r.cliente || '').toLowerCase()
    return !t || veiculo.includes(t) || motorista.includes(t) || cliente.includes(t)
  })

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar rastreamento..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <div className="py-16 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum rastreamento ativo</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((r, i) => {
            const status = String(r.status || '—')
            const linhaTempo = (r.linha_tempo as Array<{ evento: string; data: string }>) || []
            return (
              <Card key={i} className="border-2 border-[#005B2E]/20 shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-[#005B2E]">{r.veiculo || '—'}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.motorista || '—'} • {r.rota || '—'}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {status}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Cliente:</span> {r.cliente || '—'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Última localização:</span>{' '}
                    {r.ultima_localizacao || '—'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Próxima parada:</span>{' '}
                    {r.proxima_parada || '—'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Previsão:</span>{' '}
                    {r.previsao_chegada || '—'}
                  </p>
                </div>
                {linhaTempo.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Linha do tempo
                    </p>
                    <div className="space-y-1">
                      {linhaTempo.slice(-5).map((t, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs">
                          <Activity className="w-3 h-3 text-[#005B2E]" />
                          <span>{t.evento}</span>
                          <span className="text-muted-foreground ml-auto">
                            {t.data ? new Date(t.data).toLocaleString('pt-BR') : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
