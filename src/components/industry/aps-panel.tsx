import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CalendarClock, AlertTriangle, RefreshCw } from 'lucide-react'
import { getApsSuggestions, getCapacityLoad } from '@/services/pcp'
import { toast } from '@/hooks/use-toast'

export function ApsPanel() {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [capacity, setCapacity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      const [s, c] = await Promise.all([getApsSuggestions(), getCapacityLoad()])
      setSuggestions(s.suggestions || [])
      setCapacity(c)
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const s = await getApsSuggestions()
      setSuggestions(s.suggestions || [])
      const c = await getCapacityLoad()
      setCapacity(c)
      toast({ title: 'APS recalculado' })
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setRefreshing(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarClock className="w-6 h-6 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">APS & Cronograma Finito</h2>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Recalcular
        </Button>
      </div>
      {capacity && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-2 border-[#005B2E]/10">
            <CardContent className="py-3">
              <p className="text-xl font-black">{capacity.total_resources}</p>
              <p className="text-xs text-muted-foreground">Recursos</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-[#005B2E]/10">
            <CardContent className="py-3">
              <p className="text-xl font-black text-red-600">{capacity.bottlenecks}</p>
              <p className="text-xs text-muted-foreground">Gargalos</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-[#005B2E]/10">
            <CardContent className="py-3">
              <p className="text-xl font-black">{suggestions.length}</p>
              <p className="text-xs text-muted-foreground">Ordens a Programar</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-[#005B2E]/10">
            <CardContent className="py-3">
              <p className="text-xl font-black text-[#005B2E]">
                {capacity.resources?.filter((r: any) => r.utilization > 85).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Sobrecarga</p>
            </CardContent>
          </Card>
        </div>
      )}
      {capacity?.resources && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-3">Carga por Recurso</h3>
            <div className="space-y-2">
              {capacity.resources.map((r: any) => (
                <div
                  key={r.resource_id}
                  className="flex items-center gap-3 p-2 bg-muted/30 rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{r.resource_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.committed_hours}h / {r.available_hours}h
                    </p>
                  </div>
                  <div className="w-32 bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${r.is_bottleneck ? 'bg-red-500' : 'bg-[#005B2E]'}`}
                      style={{ width: `${Math.min(r.utilization, 100)}%` }}
                    />
                  </div>
                  <Badge
                    className={
                      r.is_bottleneck
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }
                  >
                    {r.utilization}%
                  </Badge>
                  {r.is_bottleneck && <AlertTriangle className="w-4 h-4 text-red-600" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <h3 className="font-bold text-[#005B2E] mb-3">Ordens a Programar</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-[#01361D] text-white">
                  <th className="text-left px-3 py-2 font-bold">Ordem</th>
                  <th className="text-left px-3 py-2 font-bold">Operacoes</th>
                  <th className="text-left px-3 py-2 font-bold">Duracao Total</th>
                  <th className="text-left px-3 py-2 font-bold">Inicio Sugerido</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((s, i) => (
                  <tr key={i} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-medium">{s.order_number}</td>
                    <td className="px-3 py-2">{s.operations?.length || 0}</td>
                    <td className="px-3 py-2">{s.total_duration_minutes}min</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(s.suggested_start).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
                {suggestions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-muted-foreground">
                      Nenhuma ordem a programar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
