import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getStockTransfers } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Search, Loader2, ArrowRightLeft } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  Pendente: 'bg-amber-100 text-amber-700',
  'Em Trânsito': 'bg-blue-100 text-blue-700',
  Concluída: 'bg-emerald-100 text-emerald-700',
  Cancelada: 'bg-red-100 text-red-700',
}

export function LogisticsTransfers() {
  const { user } = useAuth()
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setRecords(await getStockTransfers())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('stock_transfers', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      String(r.from_warehouse || '')
        .toLowerCase()
        .includes(t) ||
      String(r.to_warehouse || '')
        .toLowerCase()
        .includes(t)
    )
  })

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar transferência..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Origem</th>
                <th className="text-left px-3 py-2 font-bold">Destino</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Tipo</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Data</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center text-muted-foreground">
                    <ArrowRightLeft className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Nenhuma transferência encontrada
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={i} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-medium">{r.from_warehouse || r.origem || '—'}</td>
                    <td className="px-3 py-2 font-medium">{r.to_warehouse || r.destino || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs">
                      {r.tipo || 'Interna'}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs">
                      {r.created ? new Date(r.created as string).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status as string] || 'bg-gray-100'}`}
                      >
                        {(r.status as string) || '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
