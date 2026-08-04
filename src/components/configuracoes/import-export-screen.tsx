import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Download, Upload } from 'lucide-react'
import { getImportExportHistory, exportToCsv } from '@/services/configuracoes'
import { useRealtime } from '@/hooks/use-realtime'

export function ImportExportScreen() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      setRecords(await getImportExportHistory())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('import_export_history', () => load())

  const handleExport = () => {
    exportToCsv(records, 'import_export_history.csv')
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
        <h2 className="text-xl font-black text-foreground">Importação e Exportação</h2>
        <Button
          onClick={handleExport}
          variant="outline"
          className="border-[#005B2E] text-[#005B2E]"
        >
          <Download className="w-4 h-4 mr-2" /> Exportar Histórico
        </Button>
      </div>
      {records.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Nenhum registro de importação ou exportação encontrado.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-4 py-3 font-bold">Tipo</th>
                  <th className="text-left px-4 py-3 font-bold">Entidade</th>
                  <th className="text-left px-4 py-3 font-bold hidden md:table-cell">Formato</th>
                  <th className="text-left px-4 py-3 font-bold hidden md:table-cell">Usuário</th>
                  <th className="text-left px-4 py-3 font-bold hidden lg:table-cell">Data</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${r.operation === 'import' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}
                      >
                        {r.operation === 'import' ? 'Importação' : 'Exportação'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{r.entity || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{r.format || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{r.user_name || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
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
