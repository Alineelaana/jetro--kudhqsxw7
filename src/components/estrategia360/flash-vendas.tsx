// Aba "Flash de Vendas" — resumo semanal de pedidos.
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useFlashVendas } from './index'
import { EmptyPanel, IndicatorCard } from './widgets'
import type { GlobalFilters } from './types'

const fmtNum = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function FlashVendasTab({ filters }: { filters: GlobalFilters }) {
  const { data, isLoading } = useFlashVendas(filters)
  if (isLoading) return <EmptyPanel message="Carregando…" />
  const rows = data ?? []
  const temDados = rows.some((r) => r.unAtual > 0 || r.valorAtual > 0)
  const totalUn = rows.reduce((acc, r) => acc + r.unAtual, 0)
  const totalValor = rows.reduce((acc, r) => acc + r.valorAtual, 0)
  const totalPedidos = rows.reduce((acc, r) => acc + r.pedidos, 0)
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IndicatorCard label="Unidades na semana" value={fmtNum(totalUn)} />
        <IndicatorCard label="Valor na semana" value={fmtBRL(totalValor)} />
        <IndicatorCard label="Pedidos na semana" value={fmtNum(totalPedidos)} />
        <IndicatorCard
          label="Dia referência"
          value={filters.diaReferencia.split('-').reverse().join('/')}
        />
      </div>
      {!temDados ? (
        <EmptyPanel />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Últimos 7 dias (vs. semana anterior)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dia</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">UN anterior</TableHead>
                    <TableHead className="text-right">UN atual</TableHead>
                    <TableHead className="text-right">Evolução</TableHead>
                    <TableHead className="text-right">Pedidos</TableHead>
                    <TableHead className="text-right">SKUs</TableHead>
                    <TableHead className="text-right">Itens/pedido</TableHead>
                    <TableHead className="text-right">UN/pedido</TableHead>
                    <TableHead className="text-right">Valor anterior</TableHead>
                    <TableHead className="text-right">Valor atual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.diaSemana}</TableCell>
                      <TableCell>
                        {r.data ? r.data.split('-').reverse().join('/') : '—'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(r.unAnterior)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(r.unAtual)}</TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${
                          r.evolucaoPct < 0 ? 'text-red-600' : 'text-green-700'
                        }`}
                      >
                        {r.evolucaoPct.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(r.pedidos)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtNum(r.skus)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.itensPorPedido.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.unPorPedido.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtBRL(r.valorAnterior)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{fmtBRL(r.valorAtual)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
