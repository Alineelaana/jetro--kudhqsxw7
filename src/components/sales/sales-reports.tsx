import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSalesOrders } from '@/services/sales'
import { type SalesOrder } from '@/lib/sales-types'
import { BarChart3, Download, Loader2, FileSpreadsheet } from 'lucide-react'
import { exportCsv } from '@/lib/csv-export'

export function SalesReports() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSalesOrders()
      .then((data) => setOrders(data as unknown as SalesOrder[]))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const totalValue = orders.reduce(
    (sum, o) => sum + (parseFloat(String(o.total_value).replace(',', '.')) || 0),
    0,
  )

  const handleExport = () => {
    const headers = [
      'Nº Pedido',
      'Cliente',
      'Vendedor',
      'Status',
      'Valor Total (R$)',
      'Data Entrega',
      'Data Criação',
    ]
    const rows = orders.map((o) => [
      o.order_number || '',
      o.client_name || '',
      o.salesperson_name || '',
      o.status || '',
      o.total_value || '0',
      o.delivery_date || '',
      o.created ? new Date(o.created).toLocaleDateString('pt-BR') : '',
    ])
    exportCsv('relatorio_vendas', headers, rows)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#005B2E]" />
          <h3 className="text-lg font-bold">Relatórios de Vendas</h3>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10"
        >
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground uppercase">
              Total de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-[#005B2E]">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground uppercase">
              Faturamento Consolidado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-[#005B2E]">
              {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground uppercase">
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-[#005B2E]">
              {(orders.length > 0 ? totalValue / orders.length : 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-[#005B2E]/20">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#005B2E]" />
            Resumo dos Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#005B2E]/5 border-b border-border">
                  <th className="text-left p-2 font-bold">Nº Pedido</th>
                  <th className="text-left p-2 font-bold">Cliente</th>
                  <th className="text-left p-2 font-bold">Vendedor</th>
                  <th className="text-left p-2 font-bold">Status</th>
                  <th className="text-right p-2 font-bold">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 20).map((o) => (
                  <tr key={o.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-2 font-mono font-medium">{o.order_number || '—'}</td>
                    <td className="p-2">{o.client_name || '—'}</td>
                    <td className="p-2">{o.salesperson_name || '—'}</td>
                    <td className="p-2">{o.status || '—'}</td>
                    <td className="p-2 text-right font-bold">
                      {parseFloat(String(o.total_value).replace(',', '.') || '0').toLocaleString(
                        'pt-BR',
                        { style: 'currency', currency: 'BRL' },
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      Nenhum pedido registrado.
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
