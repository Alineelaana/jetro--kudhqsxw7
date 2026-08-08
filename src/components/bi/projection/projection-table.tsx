import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Search } from 'lucide-react'
import { fmtCurrency, fmtPct, getStatusInfo, type DimensionRow } from '@/lib/projection-utils'

interface Props {
  rows: DimensionRow[]
  dimensionLabel: string
  onRowClick?: (name: string) => void
}

export function ProjectionTable({ rows, dimensionLabel, onRowClick }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'faturado' | 'projecao' | 'pct_meta' | 'name'>('faturado')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    let r = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter((row) => row.name.toLowerCase().includes(q))
    }
    return [...r].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else cmp = (a[sortKey] as number) - (b[sortKey] as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, search, sortKey, sortDir])

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <Card className="border-2 border-[#005B2E]/20">
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[#005B2E]">Análise por {dimensionLabel}</h3>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-8 w-40 h-8 text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                  {dimensionLabel}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer"
                  onClick={() => toggleSort('pct_meta')}
                >
                  % Meta
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer"
                  onClick={() => toggleSort('faturado')}
                >
                  Faturado
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer"
                  onClick={() => toggleSort('projecao')}
                >
                  Projeção
                </TableHead>
                <TableHead className="text-right">% Proj.</TableHead>
                <TableHead className="text-right">Dif. Meta</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((r, i) => {
                  const st = getStatusInfo(r.status)
                  return (
                    <TableRow
                      key={i}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onRowClick?.(r.name)}
                    >
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-right">
                        {r.meta > 0 ? fmtPct(r.pct_meta) : '—'}
                      </TableCell>
                      <TableCell className="text-right text-[#005B2E]">
                        {fmtCurrency(r.faturado)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {fmtCurrency(r.projecao)}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.meta > 0 ? fmtPct(r.pct_projetado) : '—'}
                      </TableCell>
                      <TableCell
                        className={`text-right ${r.diferenca >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                      >
                        {fmtCurrency(r.diferenca)}
                      </TableCell>
                      <TableCell className="text-center">
                        {st.icon} {st.label}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Sem dados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
