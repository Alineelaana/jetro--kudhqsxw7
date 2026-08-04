import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Download, Upload, Search } from 'lucide-react'
import { getImportExportHistory, exportToCsv } from '@/services/configuracoes'
import { useRealtime } from '@/hooks/use-realtime'

export function ImportExportScreen() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [operationFilter, setOperationFilter] = useState('all')
  const [formatFilter, setFormatFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const filters: Record<string, string> = {}
      if (operationFilter !== 'all') filters.operation = operationFilter
      if (formatFilter !== 'all') filters.format = formatFilter
      setRecords(await getImportExportHistory(Object.keys(filters).length ? filters : undefined))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [operationFilter, formatFilter])
  useRealtime('import_export_history', () => load())

  const filtered = records.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (r.user_name || '').toLowerCase().includes(q) ||
      (r.entity || '').toLowerCase().includes(q) ||
      (r.module || '').toLowerCase().includes(q)
    )
  })

  const handleExport = () => {
    exportToCsv(filtered, 'historico_import_export.csv', {
      module: 'Configurações > Importação e Exportação',
      format: 'csv',
      filters: { operation: operationFilter, format: formatFilter, search },
    })
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
        <h2 className="text-xl font-black text-foreground">Importação e Exportação</h2>
        <Button
          onClick={handleExport}
          variant="outline"
          className="border-[#005B2E] text-[#005B2E]"
        >
          <Download className="w-4 h-4 mr-2" /> Exportar Histórico
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por usuário, entidade ou módulo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={operationFilter}
          onChange={(e) => setOperationFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Todas operações</option>
          <option value="import">Importação</option>
          <option value="export">Exportação</option>
        </select>
        <select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Todos formatos</option>
          <option value="csv">CSV</option>
          <option value="excel">Excel</option>
          <option value="pdf">PDF</option>
          <option value="xml">XML</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Nenhum registro encontrado.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Tipo</th>
                  <th className="text-left px-3 py-3 font-bold">Entidade</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Módulo</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Formato</th>
                  <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Registros</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Usuário</th>
                  <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${r.operation === 'import' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}
                      >
                        {r.operation === 'import' ? 'Importação' : 'Exportação'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium">{r.entity || '—'}</td>
                    <td className="px-3 py-3 hidden md:table-cell text-muted-foreground">
                      {r.module || '—'}
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">{r.format || '—'}</td>
                    <td className="px-3 py-3 hidden lg:table-cell">{r.record_count ?? '—'}</td>
                    <td className="px-3 py-3 hidden md:table-cell">{r.user_name || '—'}</td>
                    <td className="px-3 py-3 hidden lg:table-cell text-muted-foreground">
                      {r.created ? new Date(r.created).toLocaleString('pt-BR') : '—'}
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
