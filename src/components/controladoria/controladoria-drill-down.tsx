import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { drillDownDRELine } from '@/services/controladoria-analytics'
import { useOrgFilter } from '@/hooks/use-org-filter'

interface Props {
  lineKey: string
  period: string
  onClose: () => void
}

export function ControladoriaDrillDown({ lineKey, period, onClose }: Props) {
  const { filter: orgFilter } = useOrgFilter()
  const [entries, setEntries] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    drillDownDRELine(lineKey, period, orgFilter)
      .then((data) => setEntries(data))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [lineKey, period, orgFilter])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">Drill-down: {lineKey}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-[#005B2E] animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            Nenhum lançamento encontrado para esta linha.
          </p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-2 py-2">Data</th>
                <th className="text-left px-2 py-2">Conta Débito</th>
                <th className="text-left px-2 py-2">Conta Crédito</th>
                <th className="text-left px-2 py-2">Histórico</th>
                <th className="text-right px-2 py-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id as string} className="border-b hover:bg-[#005B2E]/5">
                  <td className="px-2 py-1.5 whitespace-nowrap">
                    {e.data ? new Date(e.data as string).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-2 py-1.5 font-mono">{String(e.conta_debito || '—')}</td>
                  <td className="px-2 py-1.5 font-mono">{String(e.conta_credito || '—')}</td>
                  <td className="px-2 py-1.5">{String(e.historico || '—')}</td>
                  <td className="px-2 py-1.5 text-right font-bold">
                    R${' '}
                    {Number(e.valor || 0).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DialogContent>
    </Dialog>
  )
}
