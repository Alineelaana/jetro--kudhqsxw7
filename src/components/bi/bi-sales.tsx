import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Loader2,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Percent,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { getSalesAnalytics } from '@/services/bi-analytics'
import { logBIAudit } from '@/services/bi'
import { useBIFilters } from './bi-filters'
import { BiStatCard } from './bi-stat-card'
import { useRealtime } from '@/hooks/use-realtime'
import type { SalesAnalyticsData } from '@/lib/bi-types'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function BiSales() {
  const { filters } = useBIFilters()
  const [data, setData] = useState<SalesAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setData(await getSalesAnalytics(filters))
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [filters])
  useEffect(() => {
    logBIAudit('view', '', 'Visualizacao: Analytics de Vendas')
  }, [])
  useRealtime('sales_orders', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!data)
    return <p className="text-center py-6 text-muted-foreground">Erro ao carregar dados.</p>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <BiStatCard
          icon={DollarSign}
          label="Receita Total"
          value={`R$ ${fmt(data.revenue)}`}
          color="text-[#005B2E]"
        />
        <BiStatCard
          icon={ShoppingCart}
          label="Total de Pedidos"
          value={String(data.total)}
          color="text-blue-600"
        />
        <BiStatCard
          icon={TrendingUp}
          label="Ticket Médio"
          value={`R$ ${fmt(data.ticketMedio)}`}
          color="text-purple-600"
        />
        <BiStatCard
          icon={Percent}
          label="Taxa de Conversão"
          value={`${fmt(data.conversionRate)}%`}
          color="text-emerald-600"
        />
        <BiStatCard
          icon={CheckCircle}
          label="Aprovados"
          value={String(data.approved)}
          color="text-green-600"
        />
        <BiStatCard
          icon={XCircle}
          label="Cancelados"
          value={String(data.cancelled)}
          color="text-red-600"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <h3 className="font-bold text-[#005B2E] mb-3">Ranking de Vendedores</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.vendedorRanking.length > 0 ? (
                data.vendedorRanking.map((v, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell className="text-right">{v.count}</TableCell>
                    <TableCell className="text-right text-[#005B2E]">R$ {fmt(v.value)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Sem dados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <h3 className="font-bold text-[#005B2E] mb-3">Principais Clientes</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topClients.length > 0 ? (
                data.topClients.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-right">{c.count}</TableCell>
                    <TableCell className="text-right text-[#005B2E]">R$ {fmt(c.value)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Sem dados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
