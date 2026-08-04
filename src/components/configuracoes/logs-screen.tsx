import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Search, Download } from 'lucide-react'
import { listConfigPaged, exportToCsv } from '@/services/configuracoes'
import { useRealtime } from '@/hooks/use-realtime'

export function LogsScreen() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await listConfigPaged('audit_logs', 1, 100)
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
    return !search || text.includes(search.toLowerCase())
  })

  const handleExport = () => {
    exportToCsv(filtered, 'audit_logs.csv')
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
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-foreground">Logs de Auditoria</h2>
        <Button
          onClick={handleExport}
          variant="outline"
          className="border-[#005B2E] text-[#005B2E]"
        >
          <Download className="w-4 h-4 mr-2" /> Exportar
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nos logs..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
          <p className="text-sm text-muted-foreground mb-3">{filtered.length} registro(s)</p>
        </CardContent>
      </Card>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum log encontrado.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-4 py-3 font-bold">Usuário</th>
                  <th className="text-left px-4 py-3 font-bold">Ação</th>
                  <th className="text-left px-4 py-3 font-bold hidden md:table-cell">Módulo</th>
                  <th className="text-left px-4 py-3 font-bold hidden lg:table-cell">Resumo</th>
                  <th className="text-left px-4 py-3 font-bold hidden md:table-cell">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-4 py-3 font-medium">{l.user_name || '—'}</td>
                    <td className="px-4 py-3">{l.action || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{l.module || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell max-w-xs truncate">
                      {l.target_summary || '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {l.created ? new Date(l.created).toLocaleString('pt-BR') : '—'}
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
