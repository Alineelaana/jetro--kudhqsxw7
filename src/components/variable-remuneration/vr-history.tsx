import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getApurations } from '@/services/variable-remuneration'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency } from '@/lib/variable-remuneration-types'
import { Loader2, Search, Download, FileText } from 'lucide-react'
import { exportCsv } from '@/lib/csv-export'

export function VrHistory() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = async () => {
    try {
      setRecords(await getApurations())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('commission_apurations', () => load())

  const filtered = records.filter((r) => {
    if (statusFilter !== 'all' && r.situacao !== statusFilter) return false
    const q = search.toLowerCase().trim()
    if (!q) return true
    return Object.values(r).some((v) =>
      String(v || '')
        .toLowerCase()
        .includes(q),
    )
  })

  const handleExport = () => {
    exportCsv(
      'historico_comissoes',
      ['Vendedor', 'Competência', 'Valor', 'Situação', 'Forma Pagamento', 'Data Pagamento'],
      filtered.map((r) => [
        r.vendedor_name || '',
        r.competencia || '',
        formatCurrency(r.commission_value),
        r.situacao || '',
        r.forma_pagamento || '',
        r.payment_date || '',
      ]),
    )
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Histórico de Comissões</h3>
        <Button
          onClick={handleExport}
          variant="outline"
          className="border-[#005B2E] text-[#005B2E]"
        >
          <Download className="w-4 h-4 mr-2" /> Exportar Excel
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 focus-visible:ring-[#005B2E]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas situações</SelectItem>
            <SelectItem value="apurada">Apurada</SelectItem>
            <SelectItem value="aprovada">Aprovada</SelectItem>
            <SelectItem value="paga">Paga</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="bloqueada">Bloqueada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
            <SelectItem value="contestada">Contestada</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Vendedor</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Competência</th>
                <th className="text-left px-3 py-3 font-bold">Valor</th>
                <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Forma Pgto</th>
                <th className="text-left px-3 py-3 font-bold">Situação</th>
                <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Recibo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-3 font-medium">{r.vendedor_name || '—'}</td>
                  <td className="px-3 py-3 hidden sm:table-cell">{r.competencia || '—'}</td>
                  <td className="px-3 py-3 font-bold">R$ {formatCurrency(r.commission_value)}</td>
                  <td className="px-3 py-3 hidden md:table-cell">{r.forma_pagamento || '—'}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${r.situacao === 'paga' ? 'bg-emerald-100 text-emerald-700' : r.situacao === 'pendente' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}
                    >
                      {r.situacao || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    {r.recibo_url ? (
                      <a
                        href={r.recibo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#005B2E] underline"
                      >
                        Ver recibo
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
