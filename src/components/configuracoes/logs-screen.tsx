import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, FileSpreadsheet, FileDown } from 'lucide-react'
import { listConfigPaged } from '@/services/configuracoes'
import { exportAuditExcel, exportAuditPdf } from '@/lib/audit-export'
import { AUDIT_MODULE_OPTIONS } from '@/lib/audit-helpers'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

export function LogsScreen() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fModule, setFModule] = useState('')
  const [fStart, setFStart] = useState('')
  const [fEnd, setFEnd] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await listConfigPaged('audit_logs', 1, 500)
      setLogs(res.items as any[])
    } catch {
      setLogs([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('audit_logs', () => load())

  const filtered = logs.filter((l) => {
    const text =
      `${l.user_name || ''} ${l.action || ''} ${l.module || ''} ${l.target_summary || ''}`.toLowerCase()
    const matchSearch = !search || text.includes(search.toLowerCase())
    const matchModule = !fModule || l.module === fModule
    const matchStart = !fStart || (l.created && new Date(l.created) >= new Date(fStart))
    const matchEnd = !fEnd || (l.created && new Date(l.created) <= new Date(fEnd + 'T23:59:59'))
    return matchSearch && matchModule && matchStart && matchEnd
  })

  const authorName = (user?.name as string) || (user?.email as string) || 'Usuário'

  const activeFilterLabels: string[] = []
  if (search) activeFilterLabels.push(`Busca: "${search}"`)
  if (fModule) {
    const modLabel = AUDIT_MODULE_OPTIONS.find((m) => m.value === fModule)?.label || fModule
    activeFilterLabels.push(`Módulo: ${modLabel}`)
  }
  if (fStart) activeFilterLabels.push(`Data inicial: ${fStart}`)
  if (fEnd) activeFilterLabels.push(`Data final: ${fEnd}`)

  const handleExportExcel = () => {
    exportAuditExcel(filtered, authorName, activeFilterLabels)
  }

  const handleExportPdf = () => {
    exportAuditPdf(filtered, authorName, activeFilterLabels)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-black text-foreground">Logs de Auditoria</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="border-[#005B2E] text-[#005B2E] font-bold"
            disabled={filtered.length === 0}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
          </Button>
          <Button
            onClick={handleExportPdf}
            className="bg-[#C89B3C] hover:bg-[#b8881f] text-white font-bold"
            disabled={filtered.length === 0}
          >
            <FileDown className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Busca</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar nos logs..."
                  className="pl-10 focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Data inicial</Label>
              <Input
                type="date"
                value={fStart}
                onChange={(e) => setFStart(e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Data final</Label>
              <Input
                type="date"
                value={fEnd}
                onChange={(e) => setFEnd(e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Módulo</Label>
              <Select
                value={fModule || 'all'}
                onValueChange={(v) => setFModule(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {AUDIT_MODULE_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} registro(s) exibido(s) de {logs.length} total
          </p>
        </CardContent>
      </Card>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum log encontrado com os filtros aplicados.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-4 py-3 font-bold">Data</th>
                  <th className="text-left px-4 py-3 font-bold">Usuário</th>
                  <th className="text-left px-4 py-3 font-bold">Ação</th>
                  <th className="text-left px-4 py-3 font-bold hidden md:table-cell">Módulo</th>
                  <th className="text-left px-4 py-3 font-bold hidden lg:table-cell">Resumo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      {l.created ? new Date(l.created).toLocaleString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium">{l.user_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#005B2E]/10 text-[#005B2E]">
                        {l.action || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">{l.module || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell max-w-xs truncate">
                      {l.target_summary || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
