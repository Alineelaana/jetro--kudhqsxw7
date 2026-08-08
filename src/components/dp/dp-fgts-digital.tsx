import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DpLoading, DpTable, DpStatusBadge } from '@/components/dp/dp-shared'
import { getFgtsByCompetencia } from '@/services/dp-enterprise'
import { useRealtime } from '@/hooks/use-realtime'
import { Search, Calculator, AlertTriangle } from 'lucide-react'

const fmt = (v: string) =>
  v ? parseFloat(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'

export function DpFgtsDigital() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [competencia, setCompetencia] = useState(new Date().toISOString().slice(0, 7))
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setRecords(await getFgtsByCompetencia(competencia))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [competencia])
  useRealtime('dp_fgts_digital', () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return !q || (r.employee_name || '').toLowerCase().includes(q)
  })

  const totals = {
    devido: records.reduce((s, r) => s + (parseFloat(r.valor_devido) || 0), 0),
    pago: records.reduce((s, r) => s + (parseFloat(r.valor_pago) || 0), 0),
    divergencias: records.filter((r) => r.divergencia).length,
  }

  if (loading) return <DpLoading />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">FGTS Digital</h3>
        {totals.diverggencias > 0 && (
          <span className="flex items-center gap-1 text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded">
            <AlertTriangle className="w-4 h-4" /> {totals.divergencias} divergência(s)
          </span>
        )}
      </div>
      <div className="flex gap-3 flex-wrap items-end">
        <div className="space-y-1">
          <Label className="text-xs">Competência</Label>
          <Input
            type="month"
            value={competencia}
            onChange={(e) => setCompetencia(e.target.value)}
            className="w-40 focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar colaborador..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Devido</p>
            <p className="font-bold text-[#005B2E]">{fmt(totals.devido.toString())}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Pago</p>
            <p className="font-bold text-emerald-600">{fmt(totals.pago.toString())}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Divergências</p>
            <p className="font-bold text-red-600">{totals.divergencias}</p>
          </CardContent>
        </Card>
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum registro FGTS para esta competência</p>
          </CardContent>
        </Card>
      ) : (
        <DpTable
          headers={[
            'Colaborador',
            'Tipo',
            'Base',
            'Alíquota',
            'Devido',
            'Pago',
            'Vencimento',
            'Guia',
            'Situação',
          ]}
        >
          {filtered.map((r) => (
            <tr
              key={r.id}
              className={`border-b border-border hover:bg-[#005B2E]/5 ${r.divergencia ? 'bg-red-50/50' : ''}`}
            >
              <td className="px-3 py-3 font-medium">{r.employee_name || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.tipo || '—'}</td>
              <td className="px-3 py-3 text-xs">{fmt(r.base_calculo)}</td>
              <td className="px-3 py-3 text-xs">{r.aliquota || '—'}%</td>
              <td className="px-3 py-3 font-bold text-[#005B2E]">{fmt(r.valor_devido)}</td>
              <td className="px-3 py-3 text-xs">{fmt(r.valor_pago)}</td>
              <td className="px-3 py-3 text-xs">{r.data_vencimento || '—'}</td>
              <td className="px-3 py-3 text-xs font-mono">{r.guia_numero || '—'}</td>
              <td className="px-3 py-3">
                <DpStatusBadge status={r.situacao} />
              </td>
            </tr>
          ))}
        </DpTable>
      )}
    </div>
  )
}
