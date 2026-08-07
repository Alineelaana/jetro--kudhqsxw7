import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getERPIntegrationData } from '@/services/crm-enterprise'
import { useRealtime } from '@/hooks/use-realtime'
import { Loader2, DollarSign, ShoppingCart, Truck, AlertTriangle } from 'lucide-react'

export function CrmErpIntegrationPanel() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getERPIntegrationData>> | null>(null)
  const load = async () => setData(await getERPIntegrationData())
  useEffect(() => {
    load()
  }, [])
  useRealtime('financial_receivables', () => load())
  useRealtime('sales_orders', () => load())
  useRealtime('logistics_deliveries', () => load())

  if (!data)
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 text-[#005B2E] animate-spin" />
      </div>
    )

  const cards = [
    {
      label: 'Recebíveis Totais',
      value: `R$ ${data.totalReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: '#22c55e',
    },
    { label: 'Títulos em Atraso', value: data.overdueCount, icon: AlertTriangle, color: '#ef4444' },
    { label: 'Pedidos de Venda', value: data.totalOrders, icon: ShoppingCart, color: '#3b82f6' },
    { label: 'Entregas Pendentes', value: data.pendingDeliveries, icon: Truck, color: '#f59e0b' },
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[#005B2E]">Integração ERP — Dados em Tempo Real</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Card key={c.label} className="border-2" style={{ borderColor: `${c.color}33` }}>
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${c.color}1A` }}
              >
                <c.icon className="w-4 h-4" style={{ color: c.color }} />
              </div>
              <div>
                <p className="text-lg font-black">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {data.recentOrders.length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader>
            <CardTitle className="text-base">Pedidos Recentes (ERP Comercial)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentOrders.map((o: Record<string, unknown>, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm border-b last:border-b-0 pb-2 last:pb-0"
                >
                  <div>
                    <span className="font-bold">{o.order_number}</span>
                    <span className="text-muted-foreground ml-2">{o.client_name || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{o.status}</span>
                    <span className="font-bold">
                      R${' '}
                      {(parseFloat(o.total_value as string) || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
