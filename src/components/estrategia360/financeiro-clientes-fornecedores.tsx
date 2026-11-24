// Abas "Financeiro", "Clientes" e "Fornecedores / Verbas".
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useClientes, useFinanceiro, useFornecedores } from './index'
import { EmptyPanel, IndicatorCard } from './widgets'
import type { GlobalFilters } from './types'

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtNum = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })

export function FinanceiroTab({ filters }: { filters: GlobalFilters }) {
  const { data, isLoading } = useFinanceiro(filters)
  if (isLoading) return <EmptyPanel message="Carregando…" />
  const d = data!
  const temDados = d.titulosReceberTotal > 0 || d.titulosPagarTotal > 0
  if (!temDados) return <EmptyPanel />
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Contas a receber</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IndicatorCard
          label="Total a receber"
          value={fmtBRL(d.titulosReceberTotal)}
          drillTo="/admin/financeiro/receber"
        />
        <IndicatorCard
          label="Títulos em atraso"
          value={fmtNum(d.titulosReceberVencidos)}
          drillTo="/admin/financeiro/receber"
        />
      </div>
      <h3 className="text-sm font-semibold">Contas a pagar</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IndicatorCard
          label="Total a pagar"
          value={fmtBRL(d.titulosPagarTotal)}
          drillTo="/admin/financeiro/pagar"
        />
        <IndicatorCard
          label="Títulos em atraso"
          value={fmtNum(d.titulosPagarVencidos)}
          drillTo="/admin/financeiro/pagar"
        />
      </div>
    </div>
  )
}

export function ClientesTab({ filters }: { filters: GlobalFilters }) {
  const { data, isLoading } = useClientes(filters)
  if (isLoading) return <EmptyPanel message="Carregando…" />
  const d = data!
  const temDados = d.titulosAtrasados > 0 || d.titulosAVencer > 0 || d.valorAtrasado > 0
  if (!temDados) return <EmptyPanel />
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Títulos de clientes</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IndicatorCard
          label="Títulos atrasados"
          value={`${fmtNum(d.titulosAtrasados)} · ${fmtBRL(d.valorAtrasado)}`}
          drillTo="/admin/financeiro/receber"
        />
        <IndicatorCard
          label="Títulos a vencer"
          value={`${fmtNum(d.titulosAVencer)} · ${fmtBRL(d.valorAVencer)}`}
          drillTo="/admin/financeiro/receber"
        />
        <IndicatorCard
          label="Títulos liberados"
          value={fmtNum(d.titulosLiberados)}
          drillTo="/admin/financeiro/receber"
        />
      </div>
      <h3 className="text-sm font-semibold">Ranking — clientes que mais compraram no mês</h3>
      {d.ranking.length === 0 ? (
        <EmptyPanel />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total comprado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.ranking.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.nome}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtBRL(r.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export function FornecedoresTab({ filters }: { filters: GlobalFilters }) {
  const { data, isLoading } = useFornecedores(filters)
  if (isLoading) return <EmptyPanel message="Carregando…" />
  const d = data!
  if (d.totalFornecedores === 0) return <EmptyPanel />
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IndicatorCard
          label="Fornecedores cadastrados"
          value={fmtNum(d.totalFornecedores)}
          drillTo="/admin/cadastros/fornecedores"
        />
        <IndicatorCard label="Fornecedores ativos" value={fmtNum(d.ativos)} />
        <IndicatorCard
          label="Compras do período"
          value={fmtBRL(d.comprasPeriodo)}
          drillTo="/admin/fiscal/compras-entradas"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Top fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          {d.topFornecedores.length === 0 ? (
            <EmptyPanel />
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Compras</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.topFornecedores.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.nome}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtBRL(r.compras)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
