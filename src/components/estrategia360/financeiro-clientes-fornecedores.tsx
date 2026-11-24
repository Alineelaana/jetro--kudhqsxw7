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
  const temDados = d.titulosReceberAteHoje > 0 || d.titulosPagarAteHoje > 0
  if (!temDados) {
    return (
      <EmptyPanel message="Nenhum título em aberto com vencimento até o Dia Referência para a Origem selecionada." />
    )
  }
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Contas a receber</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IndicatorCard
          label="Total a receber (venc. até o dia)"
          value={fmtBRL(d.titulosReceberTotal)}
          hint={`${fmtNum(d.titulosReceberAteHoje)} títulos em aberto`}
          drillTo="/admin/financeiro/contas-a-receber-cobranca"
        />
        <IndicatorCard
          label="Receber em atraso"
          value={`${fmtNum(d.titulosReceberVencidos)} · ${fmtBRL(d.valorReceberVencido)}`}
          drillTo="/admin/financeiro/contas-a-receber-cobranca"
        />
        <IndicatorCard
          label="Receber a vencer (após o dia)"
          value={`${fmtNum(d.titulosReceberAVencer)} · ${fmtBRL(d.valorReceberAVencer)}`}
          drillTo="/admin/financeiro/contas-a-receber-cobranca"
        />
      </div>
      <h3 className="text-sm font-semibold">Contas a pagar</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IndicatorCard
          label="Total a pagar (venc. até o dia)"
          value={fmtBRL(d.titulosPagarTotal)}
          hint={`${fmtNum(d.titulosPagarAteHoje)} títulos em aberto`}
          drillTo="/admin/financeiro/contas-a-pagar-tesouraria"
        />
        <IndicatorCard
          label="Pagar em atraso"
          value={`${fmtNum(d.titulosPagarVencidos)} · ${fmtBRL(d.valorPagarVencido)}`}
          drillTo="/admin/financeiro/contas-a-pagar-tesouraria"
        />
        <IndicatorCard
          label="Pagar a vencer (após o dia)"
          value={`${fmtNum(d.titulosPagarAVencer)} · ${fmtBRL(d.valorPagarAVencer)}`}
          drillTo="/admin/financeiro/contas-a-pagar-tesouraria"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Títulos em aberto (não quitados nem cancelados) das coleções de contas a receber e a pagar,
        posicionados no Dia Referência dos filtros.
      </p>
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
  if (d.totalFornecedores === 0) {
    return (
      <div className="space-y-4">
        <EmptyPanel message="Nenhum fornecedor cadastrado para a Origem selecionada no cadastro unificado de Parceiros." />
        <p className="text-xs text-muted-foreground">
          Verbas (acordos comerciais): sem dados disponíveis — não há coleção de verbas/acordos no
          HURAM ainda.
        </p>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IndicatorCard
          label="Fornecedores cadastrados"
          value={fmtNum(d.totalFornecedores)}
          hint="Cadastro unificado de Parceiros (flag fornecedor)"
          drillTo="/admin/cadastros/parceiros"
        />
        <IndicatorCard label="Fornecedores ativos" value={fmtNum(d.ativos)} />
        <IndicatorCard
          label="Compras do período"
          value={d.comprasPeriodo > 0 ? fmtBRL(d.comprasPeriodo) : 'R$ 0,00'}
          hint={
            d.comprasPeriodo > 0
              ? `Mês de referência ${filters.mesAnoReferencia}`
              : 'Sem entradas no mês de referência'
          }
          drillTo="/admin/fiscal/compras-entradas"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Verbas (acordos comerciais): sem dados disponíveis — não há coleção de verbas/acordos no
        HURAM ainda.
      </p>
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
