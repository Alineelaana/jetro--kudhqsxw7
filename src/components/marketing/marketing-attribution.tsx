import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Link2 } from 'lucide-react'
import { getMkAttributions } from '@/services/marketing'
import type { MkResultAttribution } from '@/lib/marketing-types'
import { useRealtime } from '@/hooks/use-realtime'

export function MarketingAttribution() {
  const [items, setItems] = useState<MkResultAttribution[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setItems(await getMkAttributions())
    } catch {
      setItems([])
    }
    setLoading(false)
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useRealtime('mk_result_attributions', () => load())

  const totalRevenue = items.reduce((s, a) => s + (parseFloat(a.revenue) || 0), 0)
  const byMethod = items.reduce(
    (acc, a) => {
      acc[a.attribution_method] = (acc[a.attribution_method] || 0) + (parseFloat(a.revenue) || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[#005B2E]">Atribuição de Resultado</h2>
      <p className="text-xs text-muted-foreground">
        Campanha → Lead → Oportunidade → Pedido → Faturamento — leads permanecem no CRM
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-[#005B2E]">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Receita Atribuída</p>
            <p className="text-lg font-bold text-[#005B2E]">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-[#005B2E]">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Atribuições</p>
            <p className="text-lg font-bold text-[#005B2E]">{items.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-[#005B2E]">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Direta</p>
            <p className="text-lg font-bold text-green-600">
              R$ {(byMethod.direta || 0).toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-[#005B2E]">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Correlacionada</p>
            <p className="text-lg font-bold text-amber-600">
              R$ {(byMethod.correlacionada || 0).toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      </div>
      {items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Link2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma atribuição registrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2">Campanha</th>
                <th className="text-left px-3 py-2">Canal</th>
                <th className="text-left px-3 py-2">Lead</th>
                <th className="text-left px-3 py-2">Pedido</th>
                <th className="text-left px-3 py-2">Receita</th>
                <th className="text-left px-3 py-2">Método</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2">{a.campaign_name || '—'}</td>
                  <td className="px-3 py-2 text-xs">{a.channel || '—'}</td>
                  <td className="px-3 py-2 text-xs">{a.lead_name || '—'}</td>
                  <td className="px-3 py-2 text-xs">{a.order_number || '—'}</td>
                  <td className="px-3 py-2 font-semibold text-[#005B2E]">R$ {a.revenue || '0'}</td>
                  <td className="px-3 py-2 text-xs">{a.attribution_method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
