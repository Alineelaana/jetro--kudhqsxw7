// Abas "Objetivo", "Faturamento" e "Marcas".
import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useFaturamento, useMarcas, useObjetivo } from './index'
import { EmptyPanel, IndicatorCard, SearchableTable } from './widgets'
import type { GlobalFilters, MarcasRow } from './types'

const fmtNum = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function ObjetivoTab({ filters }: { filters: GlobalFilters }) {
  const { data, isLoading } = useObjetivo(filters)
  if (isLoading) return <EmptyPanel message="Carregando…" />
  const d = data ?? { unidadesRealizadas: 0, valorRealizado: 0 }
  const temDados = d.unidadesRealizadas > 0 || d.valorRealizado > 0
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IndicatorCard
          label="Unidades realizadas no mês"
          value={fmtNum(d.unidadesRealizadas)}
          drillTo="/admin/comercial/pedidos-faturamento"
        />
        <IndicatorCard
          label="Valor realizado no mês"
          value={fmtBRL(d.valorRealizado)}
          drillTo="/admin/comercial/pedidos-faturamento"
        />
        <IndicatorCard label="Mês de referência" value={filters.mesAnoReferencia} />
      </div>
      {!temDados && <EmptyPanel />}
    </div>
  )
}

export function FaturamentoTab({ filters }: { filters: GlobalFilters }) {
  const { data, isLoading } = useFaturamento(filters)
  if (isLoading) return <EmptyPanel message="Carregando…" />
  const d = data!
  const temDados = d.nfesHoje > 0 || d.valorMes > 0
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IndicatorCard
          label="NF-e emitidas hoje"
          value={fmtNum(d.nfesHoje)}
          drillTo="/admin/fiscal/documentos-fiscais"
        />
        <IndicatorCard
          label="Clientes faturados hoje"
          value={fmtNum(d.clientesHoje)}
          drillTo="/admin/fiscal/documentos-fiscais"
        />
        <IndicatorCard
          label="Unidades faturadas hoje"
          value={fmtNum(d.unidadesHoje)}
          drillTo="/admin/fiscal/documentos-fiscais"
        />
        <IndicatorCard
          label="Valor faturado hoje"
          value={fmtBRL(d.valorHoje)}
          drillTo="/admin/fiscal/documentos-fiscais"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <IndicatorCard
          label="Faturamento da semana"
          value={fmtBRL(d.faturamentoSemana)}
          drillTo="/admin/fiscal/documentos-fiscais"
        />
        <IndicatorCard
          label="Romaneios"
          value={fmtNum(d.romaneios)}
          drillTo="/admin/logistica/romaneios"
        />
        <IndicatorCard
          label="Devoluções"
          value={fmtNum(d.devolucoes)}
          drillTo="/admin/comercial/contratos-devolucoes"
        />
        <IndicatorCard
          label="Valor faturado no mês"
          value={fmtBRL(d.valorMes)}
          drillTo="/admin/fiscal/documentos-fiscais"
        />
      </div>
      {!temDados && <EmptyPanel />}
    </div>
  )
}

export function MarcasTab({ filters }: { filters: GlobalFilters }) {
  const { data, isLoading } = useMarcas(filters)
  const [pct, setPct] = useState(20)
  const rows = data ?? []
  const top = useMemo(() => {
    if (rows.length === 0) return []
    const take = Math.max(1, Math.round((rows.length * pct) / 100))
    return rows.slice(0, take)
  }, [rows, pct])
  if (isLoading) return <EmptyPanel message="Carregando…" />
  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <EmptyPanel />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top {pct}% das marcas do mês</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="mb-2 block text-xs text-muted-foreground">
              Percentual: {pct}%
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
            <SearchableTable
              rows={top}
              searchKeys={['marca']}
              columns={[
                { key: 'marca', label: 'Marca' },
                { key: 'nf', label: 'NF', align: 'right', format: (v) => fmtNum(Number(v)) },
                { key: 'un', label: 'UN', align: 'right', format: (v) => fmtNum(Number(v)) },
                { key: 'total', label: 'Total', align: 'right', format: (v) => fmtBRL(Number(v)) },
                { key: 'media', label: 'Média', align: 'right', format: (v) => fmtBRL(Number(v)) },
                { key: 'custo', label: 'Custo', align: 'right', format: (v) => fmtBRL(Number(v)) },
                {
                  key: 'markup',
                  label: 'Markup',
                  align: 'right',
                  format: (v) => Number(v).toFixed(2),
                },
                {
                  key: 'participacaoPct',
                  label: 'Participação',
                  align: 'right',
                  format: (v) => `${Number(v).toFixed(1)}%`,
                },
              ]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
