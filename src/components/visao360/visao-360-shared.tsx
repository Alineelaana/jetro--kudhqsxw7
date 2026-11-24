import { useMemo, useState } from 'react'
import { Search, FileSpreadsheet, Printer, Eye, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ------------------------------------------------------------------
// Filtros compartilhados do rodapé
// ------------------------------------------------------------------
export interface Visao360Filters {
  origem: string
  marca: string
  dia: string // yyyy-mm-dd
  mesAno: string // MM/yyyy
}

// ------------------------------------------------------------------
// Formatação pt-BR
// ------------------------------------------------------------------
export const fmtNum = (n: number, d = 0) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('pt-BR', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })

export const fmtBRL = (n: number) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

export const fmtPct = (n: number) =>
  `${(Number.isFinite(n) ? n : 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`

export const fmtInt = (n: number) => fmtNum(Math.round(n))

export function toNum(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  if (v === null || v === undefined) return 0
  const s = String(v).trim().replace(/[R$\s]/g, '')
  if (!s) return 0
  const norm = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s
  const n = Number(norm)
  return Number.isFinite(n) ? n : 0
}

export function parseDateSafe(v?: string | null): Date | null {
  if (!v) return null
  const s = String(v).trim()
  if (!s) return null
  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (br) return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]))
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

export const fmtDateBR = (d: Date | null) =>
  d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` : '—'

export const dateOnly = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate())

export function sameDay(a: Date | null, b: Date): boolean {
  if (!a) return false
  return (
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  )
}

export function inMonth(d: Date | null, mesAno: string): boolean {
  if (!d) return false
  const [m, y] = mesAno.split('/')
  return d.getMonth() === Number(m) - 1 && d.getFullYear() === Number(y)
}

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function monthLabel(mesAno: string): string {
  const [m, y] = mesAno.split('/')
  const idx = Number(m) - 1
  return MONTH_NAMES_PT[idx] ? `${MONTH_NAMES_PT[idx]} de ${y}` : mesAno
}

/** Semana (domingo a sábado) que contém a data informada. */
export function weekRange(dia: string): { start: Date; end: Date } {
  const d = parseDateSafe(dia) ?? dateOnly(new Date())
  const start = dateOnly(d)
  start.setDate(start.getDate() - start.getDay())
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return { start, end }
}

// ------------------------------------------------------------------
// Filtro por origem (empresa/filial) e marca
// ------------------------------------------------------------------
export interface EmpresaOption {
  id: string
  label: string
  keys: string[]
}

export function buildEmpresaOptions(
  empresas: { id: string; code?: string; name?: string; marca?: string; state?: string }[],
  filiais: { id: string; code?: string; name?: string; empresaName?: string; state?: string }[],
): EmpresaOption[] {
  const opts: EmpresaOption[] = []
  for (const e of empresas) {
    const label = e.code && e.state ? `${e.code}-${e.state}` : e.name || e.code || e.id
    const keys = [e.id, e.code, e.name, e.marca].filter(Boolean).map((k) => String(k).toLowerCase().trim())
    opts.push({ id: `empresa:${e.id}`, label, keys: [...new Set(keys)] })
  }
  for (const f of filiais) {
    const label = f.code && f.state ? `${f.code}-${f.state}` : f.name || f.code || f.id
    const keys = [f.id, f.code, f.name, f.empresaName].filter(Boolean).map((k) => String(k).toLowerCase().trim())
    opts.push({ id: `filial:${f.id}`, label, keys: [...new Set(keys)] })
  }
  return opts
}

export function origemTokens(origem: string, options: EmpresaOption[]): Set<string> {
  if (!origem || origem === 'TODOS') return new Set()
  const opt = options.find((o) => o.id === origem)
  return new Set(opt ? opt.keys : [])
}

function recKeys(rec: Record<string, unknown>): string[] {
  const fields = ['empresa_id', 'filial_id', 'company', 'empresa', 'branch', 'empresa_name']
  const out: string[] = []
  for (const f of fields) {
    const v = rec[f]
    if (v) out.push(String(v).toLowerCase().trim())
  }
  return out
}

export function recMatchesOrigem(rec: Record<string, unknown>, tokens: Set<string>): boolean {
  if (tokens.size === 0) return true
  return recKeys(rec).some((k) => tokens.has(k))
}

export function recMatchesMarca(rec: Record<string, unknown>, marca: string): boolean {
  if (!marca || marca === 'TODAS') return true
  const m = String(rec.marca ?? rec.brand ?? '').trim().toLowerCase()
  if (!m) return true // registros sem marca identificada permanecem no cálculo
  return m === marca.toLowerCase()
}

// ------------------------------------------------------------------
// Tabela padrão (cabeçalho escuro, zebra, Procurar, exportar, imprimir)
// ------------------------------------------------------------------
export interface Col {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  fmt?: (v: unknown, row: Record<string, unknown>) => string
  num?: boolean // formata número com vermelho quando negativo
  money?: boolean
  pct?: boolean
}

interface TableProps {
  columns: Col[]
  rows: Record<string, unknown>[]
  exportName: string
  emptyMessage?: string
  maxHeightClass?: string
  footerRow?: Record<string, unknown> | null
}

function cellText(col: Col, row: Record<string, unknown>): string {
  const raw = row[col.key]
  if (col.fmt) return col.fmt(raw, row)
  if (col.money) return fmtBRL(toNum(raw))
  if (col.pct) return fmtPct(toNum(raw))
  if (col.num) return fmtNum(toNum(raw), toNum(raw) % 1 === 0 ? 0 : 2)
  return raw === null || raw === undefined || raw === '' ? '—' : String(raw)
}

function cellIsNegative(col: Col, row: Record<string, unknown>): boolean {
  if (!(col.money || col.num || col.pct)) return false
  return toNum(row[col.key]) < 0
}

export function VisaoDataTable({
  columns,
  rows,
  exportName,
  emptyMessage = 'Nenhum registro encontrado para os filtros aplicados.',
  maxHeightClass = 'max-h-[420px]',
  footerRow = null,
}: TableProps) {
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => columns.some((c) => cellText(c, r).toLowerCase().includes(q)))
  }, [rows, columns, query])

  const exportCsv = () => {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`
    const lines = [columns.map((c) => esc(c.label)).join(';')]
    for (const r of filtered) lines.push(columns.map((c) => esc(cellText(c, r))).join(';'))
    if (footerRow) lines.push(columns.map((c) => esc(cellText(c, footerRow))).join(';'))
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportName}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const printTable = () => {
    const w = window.open('', '_blank', 'width=1100,height=700')
    if (!w) return
    const head = columns.map((c) => `<th>${c.label}</th>`).join('')
    const body = filtered
      .map(
        (r) =>
          `<tr>${columns
            .map((c) => `<td class="${c.align === 'right' ? 'r' : ''}">${cellText(c, r)}</td>`)
            .join('')}</tr>`,
      )
      .join('')
    const foot = footerRow
      ? `<tfoot><tr>${columns.map((c) => `<td class="${c.align === 'right' ? 'r' : ''}">${cellText(c, footerRow)}</td>`).join('')}</tr></tfoot>`
      : ''
    w.document.write(
      `<html><head><title>${exportName}</title><style>
        body{font-family:Arial,sans-serif;padding:16px}
        table{border-collapse:collapse;width:100%}
        th{background:#2d2b55;color:#fff;padding:8px;text-align:left}
        td{padding:6px 8px;border-bottom:1px solid #e5e7eb}
        tr:nth-child(even) td{background:#f7f7fb}
        .r{text-align:right}
        tfoot td{font-weight:bold;background:#efeefb}
      </style></head><body><h2>${exportName}</h2><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody>${foot}</table></body></html>`,
    )
    w.document.close()
    w.focus()
    w.print()
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" title="Exportar (CSV)" onClick={exportCsv}>
            <FileSpreadsheet className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Imprimir" onClick={printTable}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Visualizar" onClick={() => setPreview(true)}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Procurar:</span>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 w-56"
            placeholder="Filtrar linhas..."
          />
        </div>
      </div>
      <div className={cn('overflow-auto rounded-md border', maxHeightClass)}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-[#2d2b55] text-white">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    'px-3 py-2 font-semibold whitespace-nowrap',
                    c.align === 'right' && 'text-right',
                    c.align === 'center' && 'text-center',
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {filtered.map((r, i) => (
              <tr key={String(r.__id ?? i)} className={cn(i % 2 === 1 && 'bg-muted/40')}>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      'px-3 py-1.5 whitespace-nowrap',
                      c.align === 'right' && 'text-right',
                      c.align === 'center' && 'text-center',
                      cellIsNegative(c, r) && 'text-red-600',
                    )}
                  >
                    {cellText(c, r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footerRow && (
            <tfoot className="bg-[#efeefb] font-semibold">
              <tr>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      'px-3 py-2 whitespace-nowrap',
                      c.align === 'right' && 'text-right',
                      c.align === 'center' && 'text-center',
                      cellIsNegative(c, footerRow) && 'text-red-600',
                    )}
                  >
                    {cellText(c, footerRow)}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Visualização: {exportName}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#2d2b55] text-white">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className={cn('px-2 py-1.5 text-left', c.align === 'right' && 'text-right')}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={String(r.__id ?? i)} className={cn(i % 2 === 1 && 'bg-muted/40')}>
                    {columns.map((c) => (
                      <td key={c.key} className={cn('px-2 py-1', c.align === 'right' && 'text-right')}>
                        {cellText(c, r)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ------------------------------------------------------------------
// Lista de indicadores com drill-down (lupa)
// ------------------------------------------------------------------
export interface IndicatorItem {
  label: string
  value: string | number
  drill?: () => void
  drillTitle?: string
  drillColumns?: Col[]
  drillRows?: Record<string, unknown>[]
}

export function IndicatorList({ items }: { items: IndicatorItem[] }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<IndicatorItem | null>(null)

  const openDrill = (item: IndicatorItem) => {
    if (!item.drillRows) return
    setCurrent(item)
    setOpen(true)
  }

  return (
    <>
      <div className="divide-y rounded-md border bg-background">
        {items.map((it, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm text-foreground">{it.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm tabular-nums text-muted-foreground">{it.value}</span>
              {it.drillRows && (
                <button
                  type="button"
                  onClick={() => openDrill(it)}
                  title="Detalhar"
                  className="rounded bg-[#2d2b55] p-1 text-white hover:bg-[#3b3873]"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <DrillDialog
        open={open}
        onOpenChange={setOpen}
        title={current?.drillTitle ?? current?.label ?? 'Detalhamento'}
        columns={current?.drillColumns ?? []}
        rows={current?.drillRows ?? []}
      />
    </>
  )
}

export function DrillDialog({
  open,
  onOpenChange,
  title,
  columns,
  rows,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  columns: Col[]
  rows: Record<string, unknown>[]
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#2d2b55] text-white">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={cn('px-2 py-1.5 text-left whitespace-nowrap', c.align === 'right' && 'text-right')}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-2 py-4 text-center text-muted-foreground">
                    Nenhum registro no período.
                  </td>
                </tr>
              )}
              {rows.map((r, i) => (
                <tr key={String(r.__id ?? i)} className={cn(i % 2 === 1 && 'bg-muted/40')}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        'px-2 py-1 whitespace-nowrap',
                        c.align === 'right' && 'text-right',
                        cellIsNegative(c, r) && 'text-red-600',
                      )}
                    >
                      {cellText(c, r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ------------------------------------------------------------------
// Faixa escura "Empresas Processadas"
// ------------------------------------------------------------------
export function DarkBand({ children }: { children: React.ReactNode }) {
  return <div className="rounded-t-md bg-[#2d2b55] px-4 py-3 text-sm font-semibold text-white">{children}</div>
}

// ------------------------------------------------------------------
// Ícone de refresh das abas
// ------------------------------------------------------------------
export function TabRefreshIcon({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      title="Recarregar dados desta aba"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="ml-1 text-inherit opacity-80 hover:opacity-100"
    >
      <RefreshCw className="inline h-3.5 w-3.5" />
    </button>
  )
}

// ------------------------------------------------------------------
// Gauge (velocímetro) — Objetivos × Resultados
// ------------------------------------------------------------------
export function Gauge({
  value,
  max,
  label,
  sub,
}: {
  value: number
  max: number
  label: string
  sub?: string
}) {
  const pct = max > 0 ? value / max : 0
  const shown = Math.min(pct, 1)
  const angle = -90 + shown * 180
  const arcLen = Math.PI * 45
  return (
    <div className="flex flex-col items-center rounded-md border bg-background p-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <svg viewBox="0 0 120 75" className="my-1 h-24 w-40">
        <path d="M15,60 A45,45 0 0 1 105,60" fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M15,60 A45,45 0 0 1 105,60"
          fill="none"
          stroke="#2d2b55"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={arcLen}
          strokeDashoffset={arcLen * (1 - shown)}
        />
        <line
          x1="60"
          y1="60"
          x2="60"
          y2="22"
          stroke="#1f2937"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${angle} 60 60)`}
        />
        <circle cx="60" cy="60" r="4" fill="#1f2937" />
      </svg>
      <span className="text-sm font-semibold tabular-nums">{fmtPct(pct * 100)}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  )
}

// ------------------------------------------------------------------
// Helpers de itens json dos pedidos
// ------------------------------------------------------------------
export interface ItemLike {
  quantity?: number | string
  qtd?: number | string
  total?: number | string
  valor?: number | string
  price?: number | string
  unit_price?: number | string
  custo?: number | string
  cost_price?: number | string
  brand?: string
  marca?: string
  product_name?: string
  name?: string
  code?: string
}

export function parseItems(raw: unknown): ItemLike[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as ItemLike[]
  try {
    const parsed = JSON.parse(String(raw))
    return Array.isArray(parsed) ? (parsed as ItemLike[]) : []
  } catch {
    return []
  }
}
