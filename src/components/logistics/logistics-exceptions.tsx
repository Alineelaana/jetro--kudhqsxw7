import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getLogisticsExceptions, type LogisticsException } from '@/services/logistics-orchestration'
import { useRealtime } from '@/hooks/use-realtime'
import { AlertTriangle, Loader2, Activity, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const SEVERITY_COLORS: Record<string, string> = {
  Alta: 'bg-red-100 text-red-700',
  Crítica: 'bg-red-200 text-red-800',
  Média: 'bg-amber-100 text-amber-700',
  Baixa: 'bg-blue-100 text-blue-700',
}

const MODULE_COLORS: Record<string, string> = {
  WMS: 'bg-indigo-100 text-indigo-700',
  Transporte: 'bg-cyan-100 text-cyan-700',
  Logística: 'bg-[#005B2E]/10 text-[#005B2E]',
}

export function LogisticsExceptions() {
  const [exceptions, setExceptions] = useState<LogisticsException[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setExceptions(await getLogisticsExceptions())
    } catch {
      setExceptions([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_deliveries', () => load())
  useRealtime('logistics_occurrences', () => load())
  useRealtime('wms_operational_alerts', () => load())
  useRealtime('wms_separations', () => load())
  useRealtime('transport_journeys', () => load())

  const filtered = exceptions.filter((e) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      e.type.toLowerCase().includes(t) ||
      e.description.toLowerCase().includes(t) ||
      e.module.toLowerCase().includes(t)
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
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-2 border-red-200 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-lg font-bold">
                {exceptions.filter((e) => e.severity === 'Alta' || e.severity === 'Crítica').length}
              </p>
              <p className="text-xs text-muted-foreground">Críticas/Altas</p>
            </div>
          </div>
        </Card>
        <Card className="border-2 border-amber-200 p-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-lg font-bold">
                {exceptions.filter((e) => e.severity === 'Média').length}
              </p>
              <p className="text-xs text-muted-foreground">Médias</p>
            </div>
          </div>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#005B2E]" />
            <div>
              <p className="text-lg font-bold">{exceptions.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar exceção..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <Card className="border-2 border-dashed col-span-2">
            <CardContent className="py-16 text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-bold">Nenhuma exceção encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((e) => (
            <Card key={e.id} className="border-2 border-[#005B2E]/20 shadow-md p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-sm">{e.type}</p>
                  <p className="text-xs text-muted-foreground mt-1">{e.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${SEVERITY_COLORS[e.severity] || 'bg-gray-100'}`}
                  >
                    {e.severity}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${MODULE_COLORS[e.module] || 'bg-gray-100'}`}
                  >
                    {e.module}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                <span>Entidade: {e.entity}</span>
                <span>{e.created ? new Date(e.created).toLocaleString('pt-BR') : ''}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
