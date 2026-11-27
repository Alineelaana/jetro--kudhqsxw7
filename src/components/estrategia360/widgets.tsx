// Componentes visuais compartilhados das abas da tela "Visão estratégica em 360°".
import { useMemo, useState, type ReactNode } from 'react'
import { Search, ZoomIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

// Painel vazio / carregando: cada aba mostra este estado quando não há dados.
export function EmptyPanel({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[160px] items-center justify-center rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
      {message ?? 'Sem dados para os filtros selecionados.'}
    </div>
  )
}

// Cartão de indicador: com lupa (drill-down) quando há rota de destino.
export function IndicatorCard({
  label,
  value,
  drillTo,
  hint,
}: {
  label: string
  value: ReactNode
  drillTo?: string
  hint?: string
}) {
  const navigate = useNavigate()
  const clickable = Boolean(drillTo)
  const handleDrill = () => {
    if (drillTo) navigate(drillTo)
  }
  return (
    <Card
      className={cn(
        clickable &&
          'cursor-pointer transition-colors hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
      )}
      onClick={clickable ? handleDrill : undefined}
    >
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{label}</span>
          {clickable && (
            <button
              type="button"
              aria-label={`Abrir ${label}`}
              onClick={(ev) => {
                ev.stopPropagation()
                handleDrill()
              }}
              className="rounded p-0.5 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring hover:text-foreground"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}

// Tabela simples com busca por texto (linhas livremente tipadas).
export function SearchableTable({
  rows,
  columns,
  searchKeys,
  emptyMessage,
}: {
  rows: any[]
  columns: {
    key: string
    label: string
    align?: 'left' | 'right'
    format?: (value: any) => string
  }[]
  searchKeys: string[]
  emptyMessage?: string
}) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase()
    if (!t) return rows
    return rows.filter((row) =>
      searchKeys.some((k) =>
        String(row[k] ?? '')
          .toLowerCase()
          .includes(t),
      ),
    )
  }, [rows, search, searchKeys])

  return (
    <div className="space-y-2">
      <div className="relative max-w-xs">
        <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar…"
          className="h-8 pl-7 text-sm"
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyPanel message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.key} className={cn(c.align === 'right' && 'text-right')}>
                    {c.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell
                      key={c.key}
                      className={cn('tabular-nums', c.align === 'right' && 'text-right')}
                    >
                      {c.format ? c.format(row[c.key]) : String(row[c.key] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
