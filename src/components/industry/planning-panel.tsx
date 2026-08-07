import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Brain, TrendingUp, Package, AlertTriangle, RefreshCw } from 'lucide-react'
import { getMrpSuggestions } from '@/services/industrial-extended'
import { getProductionOrders } from '@/services/production-orders'
import type { MrpSuggestion } from '@/lib/industrial-extended-types'
import { toast } from '@/hooks/use-toast'

const PRIORITY_COLORS: Record<string, string> = {
  baixa: 'bg-gray-100 text-gray-600',
  media: 'bg-blue-100 text-blue-700',
  alta: 'bg-amber-100 text-amber-700',
  critica: 'bg-red-100 text-red-700',
}
const ACTION_LABELS: Record<string, string> = {
  comprar: 'Comprar',
  produzir: 'Produzir',
  transferir: 'Transferir',
  nenhum: 'Sem acao',
}

export function PlanningPanel() {
  const [suggestions, setSuggestions] = useState<MrpSuggestion[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      const [s, o] = await Promise.all([getMrpSuggestions(), getProductionOrders()])
      setSuggestions(s || [])
      setOrders(o)
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
      const s = await getMrpSuggestions()
      setSuggestions(s || [])
      toast({ title: 'MRP recalculado' })
    } catch {
      toast({ title: 'Erro ao recalcular MRP', variant: 'destructive' })
    }
    setRefreshing(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const plannedOrders = orders.filter(
    (o) => o.status === 'planejada' || o.status === 'rascunho',
  ).length
  const inProduction = orders.filter((o) => o.status === 'em_producao').length
  const criticalNeeds = suggestions.filter((s) => s.priority === 'critica').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">Planejamento & MRP</h2>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="focus-visible:ring-[#005B2E]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Recalcular
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-2 border-[#005B2E]/10">
          <CardContent className="py-3 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-xl font-black">{plannedOrders}</p>
              <p className="text-xs text-muted-foreground">Ordens Planejadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/10">
          <CardContent className="py-3 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-xl font-black">{inProduction}</p>
              <p className="text-xs text-muted-foreground">Em Producao</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/10">
          <CardContent className="py-3 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-xl font-black">{criticalNeeds}</p>
              <p className="text-xs text-muted-foreground">Necessidades Criticas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/10">
          <CardContent className="py-3 flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#005B2E]" />
            <div>
              <p className="text-xl font-black">{suggestions.length}</p>
              <p className="text-xs text-muted-foreground">Sugestoes MRP</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <h3 className="font-bold text-[#005B2E] mb-3">Sugestoes do MRP</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-[#01361D] text-white">
                  <th className="text-left px-3 py-2 font-bold">Item</th>
                  <th className="text-left px-3 py-2 font-bold">Necessidade</th>
                  <th className="text-left px-3 py-2 font-bold">Estoque</th>
                  <th className="text-left px-3 py-2 font-bold">Nec. Liquida</th>
                  <th className="text-left px-3 py-2 font-bold">Acao</th>
                  <th className="text-left px-3 py-2 font-bold">Prioridade</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((s, i) => (
                  <tr key={i} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-medium">{s.product_name}</td>
                    <td className="px-3 py-2">{s.required_quantity}</td>
                    <td className="px-3 py-2">{s.available_stock}</td>
                    <td className="px-3 py-2 font-bold text-[#005B2E]">{s.net_need}</td>
                    <td className="px-3 py-2">
                      {ACTION_LABELS[s.suggested_action] || s.suggested_action}
                    </td>
                    <td className="px-3 py-2">
                      <Badge className={PRIORITY_COLORS[s.priority]}>{s.priority}</Badge>
                    </td>
                  </tr>
                ))}
                {suggestions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-muted-foreground">
                      Nenhuma sugestao no momento. Clique em "Recalcular" para executar o MRP.
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
