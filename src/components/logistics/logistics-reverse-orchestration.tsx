import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getReverseOperations, updateReverseOperation } from '@/services/logistics'
import { getSalesReturns } from '@/services/sales'
import { getPurchaseReturns } from '@/services/purchasing'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { canApproveReverse } from '@/lib/logistics-permissions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Loader2, RotateCcw, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { REVERSE_LOGISTICS_STATUS } from '@/lib/logistics-types'

const STATUS_COLORS: Record<string, string> = {
  Solicitada: 'bg-amber-100 text-amber-700',
  Aprovada: 'bg-blue-100 text-blue-700',
  'Coleta Agendada': 'bg-cyan-100 text-cyan-700',
  Coletada: 'bg-indigo-100 text-indigo-700',
  'Em Conferência': 'bg-purple-100 text-purple-700',
  'Entrada no Estoque': 'bg-teal-100 text-teal-700',
  'Tratamento Fiscal': 'bg-orange-100 text-orange-700',
  Finalizada: 'bg-emerald-100 text-emerald-700',
  Cancelada: 'bg-red-100 text-red-700',
}

export function LogisticsReverseOrchestration() {
  const { user } = useAuth()
  const role = user?.role as string
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [salesReturns, setSalesReturns] = useState<Record<string, unknown>[]>([])
  const [purchaseReturns, setPurchaseReturns] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const [ops, sr, pr] = await Promise.all([
        getReverseOperations().catch(() => []),
        getSalesReturns().catch(() => []),
        getPurchaseReturns().catch(() => []),
      ])
      setRecords(ops)
      setSalesReturns(sr as unknown as Record<string, unknown>[])
      setPurchaseReturns(pr as unknown as Record<string, unknown>[])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_reverse_operations', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      String(r.numero_operacao || '')
        .toLowerCase()
        .includes(t) ||
      String(r.cliente_fornecedor || '')
        .toLowerCase()
        .includes(t)
    )
  })

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateReverseOperation(id, { status })
      toast.success('Status atualizado')
      load()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-2 border-[#005B2E]/20 p-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#005B2E]" />
            <div>
              <p className="text-lg font-bold">{records.length}</p>
              <p className="text-xs text-muted-foreground">Operações de Reversa</p>
            </div>
          </div>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-lg font-bold">{salesReturns.length}</p>
              <p className="text-xs text-muted-foreground">Devoluções de Vendas</p>
            </div>
          </div>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-lg font-bold">{purchaseReturns.length}</p>
              <p className="text-xs text-muted-foreground">Devoluções de Compras</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar operação..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Operação</th>
                <th className="text-left px-3 py-2 font-bold">Cliente/Fornecedor</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Tipo</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                {canApproveReverse(role) && (
                  <th className="text-center px-3 py-2 font-bold">Ação</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center text-muted-foreground">
                    <RotateCcw className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Nenhuma operação de logística reversa
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={i} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-mono text-xs font-bold text-[#C89B3C]">
                      {r.numero_operacao}
                    </td>
                    <td className="px-3 py-2 font-medium">{r.cliente_fornecedor || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell">{r.tipo_operacao || '—'}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status as string] || 'bg-gray-100'}`}
                      >
                        {r.status as string}
                      </span>
                    </td>
                    {canApproveReverse(role) && (
                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          <Select onValueChange={(v) => handleStatus(r.id as string, v)}>
                            <SelectTrigger className="h-7 w-36 text-xs focus-visible:ring-[#005B2E]">
                              <SelectValue placeholder="Alterar" />
                            </SelectTrigger>
                            <SelectContent>
                              {REVERSE_LOGISTICS_STATUS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    )}
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
