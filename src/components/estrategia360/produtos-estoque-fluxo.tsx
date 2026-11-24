// Abas "Produtos", "Estoque" e "Fluxo de Caixa".
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchEstoque, fetchFluxoCaixa, fetchProdutos } from './data'
import { EmptyPanel, IndicatorCard, SearchableTable } from './widgets'
import type { GlobalFilters, StockCompareRow, TopProdutoRow, WeeklyCashFlowRow } from './types'

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtNum = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })

export function ProdutosTab({ filters }: { filters: GlobalFilters }) {
  const { data, isLoading } = useQuery({
    queryKey: ['estrategia360', 'produtos', filters],
    queryFn: () => fetchProdutos(filters),
  })
  const [topPct, setTopPct] = useState(20)
  const top = useMemo<TopProdutoRow[]>(() => {
    const all = data?.topProdutos ?? []
    const take = Math.max(1, Math.round((all.length * topPct) / 100))
    return all.slice(0, take)
  }, [data, topPct])
  if (isLoading) return <EmptyPanel message="Carregando…" />
  const d = data!
  const allZero = d.skusAtivos === 0
  return (
    <div className="space-y-4">
      {allZero ? (
        <EmptyPanel />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <IndicatorCard
              label="SKU's ativos"
              value={fmtNum(d.skusAtivos)}
              drillTo="/admin/produtos"
            />
            <IndicatorCard
              label="Marcas ativas"
              value={fmtNum(d.marcasAtivas)}
              drillTo="/admin/cadastros/marcas"
            />
            <IndicatorCard
              label="Itens com estoque > 0"
              value={`${fmtNum(d.comEstoque)} (${d.pctComEstoque.toFixed(1)}%)`}
              drillTo="/admin/estoque"
            />
            <IndicatorCard
              label="Itens com estoque <= 0"
              value={`${fmtNum(d.semEstoque)} (${d.pctSemEstoque.toFixed(1)}%)`}
              drillTo="/admin/estoque"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <IndicatorCard
              label="Produtos em crítica de cadastro"
              value={fmtNum(d.criticaCadastro)}
              drillTo="/admin/cadastros/produtos"
            />
            <IndicatorCard
              label="Produtos sem foto"
              value={fmtNum(d.semFoto)}
              drillTo="/admin/produtos"
            />
            <IndicatorCard
              label="Vendidos abaixo da tabela"
              value={fmtNum(d.precoAbaixoTabela)}
              drillTo="/admin/comercial/tabelas-preco-descontos"
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Top {topPct}% dos produtos mais vendidos no mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label className="mb-2 block text-xs text-muted-foreground">
                Percentual: {topPct}%
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={topPct}
                  onChange={(e) => setTopPct(Number(e.target.value))}
                  className="mt-1 w-full"
                />
              </label>
              {top.length === 0 ? (
                <EmptyPanel />
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead className="text-right">QTD</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Custo</TableHead>
                        <TableHead className="text-right">Markup</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {top.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell>{p.nome}</TableCell>
                          <TableCell className="text-right tabular-nums">{fmtNum(p.qtd)}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {fmtBRL(p.valor)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {fmtBRL(p.custo)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {p.markup.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export function EstoqueTab({ filters }: { filters: GlobalFilters }) {
  const { data, isLoading } = useQuery({
    queryKey: ['estrategia360', 'estoque', filters],
    queryFn: () => fetchEstoque(filters),
  })
  if (isLoading) return <EmptyPanel message="Carregando…" />
  const { comparativo, skusInativosComEstoque } = data ?? {
    comparativo: [],
    skusInativosComEstoque: [],
  }
  const formas: { forma: string; valor: number; qtdPedidos: number }[] = []
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Estoque Fiscal × WMS × Avarias × Diferença</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchableTable
            rows={comparativo}
            searchKeys={['sku', 'nome']}
            columns={[
              { key: 'sku', label: 'SKU' },
              { key: 'nome', label: 'Produto' },
              {
                key: 'qtdFiscal',
                label: 'Qtd Fiscal',
                align: 'right',
                format: (v) => fmtNum(Number(v)),
              },
              { key: 'qtdWms', label: 'Qtd WMS', align: 'right', format: (v) => fmtNum(Number(v)) },
              {
                key: 'qtdAvarias',
                label: 'Avarias',
                align: 'right',
                format: (v) => fmtNum(Number(v)),
              },
              {
                key: 'qtdDiferenca',
                label: 'Diferença',
                align: 'right',
                format: (v) => fmtNum(Number(v)),
              },
              {
                key: 'precoEntrada',
                label: 'Preço de entrada',
                align: 'right',
                format: (v) => fmtBRL(Number(v)),
              },
              {
                key: 'custoMedio',
                label: 'Custo médio',
                align: 'right',
                format: (v) => fmtBRL(Number(v)),
              },
            ]}
          />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">SKUs inativos com estoque</CardTitle>
          </CardHeader>
          <CardContent>
            {skusInativosComEstoque.length === 0 ? (
              <EmptyPanel />
            ) : (
              <ul className="space-y-1 text-sm">
                {skusInativosComEstoque.map((r) => (
                  <li key={r.sku} className="flex justify-between">
                    <span>
                      {r.sku} — {r.nome}
                    </span>
                    <span className="tabular-nums">{fmtNum(r.estoque)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pedidos por Forma de Pagto</CardTitle>
          </CardHeader>
          <CardContent>
            {formas.length === 0 ? (
              <EmptyPanel />
            ) : (
              <span className="text-sm">{formas.length} formas</span>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function FluxoCaixaTab({ filters }: { filters: GlobalFilters }) {
  const { data, isLoading } = useQuery({
    queryKey: ['estrategia360', 'fluxo-caixa', filters],
    queryFn: () => fetchFluxoCaixa(filters),
  })
  if (isLoading) return <EmptyPanel message="Carregando…" />
  const d = data ?? { estoqueTotal: 0, disponibilidadeTotal: 0, rows: [] as WeeklyCashFlowRow[] }
  const negative = (v: number) => (v < 0 ? 'text-red-600' : undefined)
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <IndicatorCard label="Estoque" value={fmtBRL(d.estoqueTotal)} drillTo="/admin/estoque" />
        <IndicatorCard
          label="Disponibilidade"
          value={fmtBRL(d.disponibilidadeTotal)}
          drillTo="/admin/financeiro"
        />
        <IndicatorCard
          label="Data Base"
          value={filters.diaReferencia.split('-').reverse().join('/')}
        />
      </div>
      {d.rows.length === 0 ? (
        <EmptyPanel />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semana</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Direitos</TableHead>
                <TableHead className="text-right">Direitos Prev.</TableHead>
                <TableHead className="text-right">Obrigação</TableHead>
                <TableHead className="text-right">Obrigação Prev.</TableHead>
                <TableHead className="text-right">Saldo do dia</TableHead>
                <TableHead className="text-right">Acumulado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.semana || '—'}</TableCell>
                  <TableCell>{r.vencimento.split('-').reverse().join('/') || '—'}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtBRL(r.direitos)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtBRL(r.direitosPrev)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{fmtBRL(r.obrigacao)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtBRL(r.obrigacaoPrev)}
                  </TableCell>
                  <TableCell className={`text-right tabular-nums ${negative(r.saldoDia)}`}>
                    {fmtBRL(r.saldoDia)}
                  </TableCell>
                  <TableCell className={`text-right tabular-nums ${negative(r.acumulado)}`}>
                    {fmtBRL(r.acumulado)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
