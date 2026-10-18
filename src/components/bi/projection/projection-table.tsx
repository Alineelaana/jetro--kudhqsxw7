import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { fmtCurrency, fmtPct, getStatusInfo, type DimensionRow } from '@/lib/projection-utils'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'

interface Props {
  rows: DimensionRow[]
  dimensionLabel: string
  onRowClick?: (name: string) => void
}

export function ProjectionTable({ rows, dimensionLabel, onRowClick }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((row) => row.name.toLowerCase().includes(q))
  }, [rows, search])

  const columns: JetroColumnDef<DimensionRow>[] = [
    {
      id: 'name',
      header: dimensionLabel,
      accessorKey: 'name',
      dataType: 'text',
      defaultWidth: 200,
      cell: ({ value }) => <span className="font-medium">{String(value || '—')}</span>,
    },
    {
      id: 'pct_meta',
      header: '% Meta',
      accessorKey: 'pct_meta',
      dataType: 'percent',
      align: 'right',
      defaultWidth: 100,
      getSortValue: (row) => row.pct_meta,
      cell: ({ row }) => (
        <span className="font-medium">{row.meta > 0 ? fmtPct(row.pct_meta) : '—'}</span>
      ),
    },
    {
      id: 'faturado',
      header: 'Faturado',
      accessorKey: 'faturado',
      dataType: 'currency',
      align: 'right',
      defaultWidth: 130,
      getSortValue: (row) => row.faturado,
      cell: ({ row }) => (
        <span className="text-[#005B2E] font-medium">{fmtCurrency(row.faturado)}</span>
      ),
    },
    {
      id: 'projecao',
      header: 'Projeção',
      accessorKey: 'projecao',
      dataType: 'currency',
      align: 'right',
      defaultWidth: 130,
      getSortValue: (row) => row.projecao,
      cell: ({ row }) => <span className="font-bold">{fmtCurrency(row.projecao)}</span>,
    },
    {
      id: 'pct_projetado',
      header: '% Proj.',
      accessorKey: 'pct_projetado',
      dataType: 'percent',
      align: 'right',
      defaultWidth: 100,
      getSortValue: (row) => row.pct_projetado,
      cell: ({ row }) => <span>{row.meta > 0 ? fmtPct(row.pct_projetado) : '—'}</span>,
    },
    {
      id: 'diferenca',
      header: 'Dif. Meta',
      accessorKey: 'diferenca',
      dataType: 'currency',
      align: 'right',
      defaultWidth: 120,
      getSortValue: (row) => row.diferenca,
      cell: ({ row }) => (
        <span
          className={
            row.diferenca >= 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'
          }
        >
          {fmtCurrency(row.diferenca)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      dataType: 'text',
      align: 'center',
      defaultWidth: 140,
      getSortValue: (row) => getStatusInfo(row.status).label,
      cell: ({ row }) => {
        const st = getStatusInfo(row.status)
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium">
            <span>{st.icon}</span>
            <span>{st.label}</span>
          </span>
        )
      },
    },
  ]

  return (
    <Card className="border-2 border-[#005B2E]/20">
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#005B2E]">Análise por {dimensionLabel}</h3>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-8 w-40 h-8 text-sm focus-visible:ring-[#005B2E]"
            />
          </div>
        </div>

        <JetroTable
          screenId={`bi.projecao.${dimensionLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
          columns={columns}
          data={filtered}
          onRowClick={(row) => onRowClick?.(row.name)}
          emptyMessage="Nenhum dado encontrado para esta dimensão."
          exportTitle={`Projeção de Vendas — Análise por ${dimensionLabel}`}
          exportFilename={`projecao-${dimensionLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}.xlsx`}
        />
      </CardContent>
    </Card>
  )
}
