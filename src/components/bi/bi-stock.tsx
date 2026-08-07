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
import { Badge } from '@/components/ui/badge'
import { Loader2, Package, AlertTriangle, XCircle, DollarSign, Bell, BellRing } from 'lucide-react'
import { getStockAnalytics } from '@/services/bi-analytics'
import { logBIAudit } from '@/services/bi'
import { useBIFilters } from './bi-filters'
import { BiStatCard } from './bi-stat-card'
import { useRealtime } from '@/hooks/use-realtime'
import type { StockAnalyticsData } from '@/lib/bi-types'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function BiStock() {
  const { filters } = useBIFilters()
  const [data, setData] = useState<StockAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setData(await getStockAnalytics(filters))
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [filters])
  useEffect(() => {
    logBIAudit('view', '', 'Visualizacao: Analytics de Estoque')
  }, [])
  useRealtime('products', () => load())
  useRealtime('stock_alerts', () => load())

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
          icon={Package}
          label="Total de Produtos"
          value={String(data.totalProducts)}
          color="text-blue-600"
        />
        <BiStatCard
          icon={AlertTriangle}
          label="Estoque Baixo"
          value={String(data.lowStock)}
          color="text-amber-600"
        />
        <BiStatCard
          icon={XCircle}
          label="Sem Estoque"
          value={String(data.outOfStock)}
          color="text-red-600"
        />
        <BiStatCard
          icon={DollarSign}
          label="Valor em Estoque"
          value={`R$ ${fmt(data.totalStockValue)}`}
          color="text-[#005B2E]"
        />
        <BiStatCard
          icon={Bell}
          label="Total de Alertas"
          value={String(data.alerts)}
          color="text-purple-600"
        />
        <BiStatCard
          icon={BellRing}
          label="Alertas Não Resolvidos"
          value={String(data.unresolvedAlerts)}
          color="text-red-600"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <h3 className="font-bold text-[#005B2E] mb-3">Produtos com Estoque Baixo</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Mínimo</TableHead>
                <TableHead className="text-center">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lowStockItems.length > 0 ? (
                data.lowStockItems.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{p.name || '—'}</TableCell>
                    <TableCell className="text-right">{String(p.stock ?? 0)}</TableCell>
                    <TableCell className="text-right">{String(p.min_stock ?? 0)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={Number(p.stock) <= 0 ? 'destructive' : 'secondary'}>
                        {Number(p.stock) <= 0 ? 'Sem estoque' : 'Estoque baixo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum produto com estoque baixo
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
