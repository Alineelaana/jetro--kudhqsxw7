import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAtendimentos } from '@/services/atendimento'
import { useRealtime } from '@/hooks/use-realtime'
import {
  ATENDIMENTO_STATUS,
  STATUS_BADGE_COLORS,
  type AtendimentoRecord,
} from '@/lib/atendimento-types'
import { Search, Loader2, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AtendimentoList({ statusFilter }: { statusFilter: string }) {
  const [records, setRecords] = useState<AtendimentoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusSel, setStatusSel] = useState(
    statusFilter === 'pendente' ? 'pendente' : statusFilter,
  )

  const buildFilter = () => {
    if (statusSel === 'pendente') {
      return 'status = "Aguardando Atendimento" || status = "Aguardando Cliente" || status = "Aguardando Outro Setor"'
    }
    if (statusSel === 'all') return ''
    return `status = "${statusSel}"`
  }

  const load = async () => {
    try {
      setRecords(await getAtendimentos(buildFilter()))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [statusSel])
  useRealtime('service_centers', () => load())

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    return (
      !term ||
      (r.protocol || '').toLowerCase().includes(term) ||
      (r.client_name || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por protocolo ou cliente..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={statusSel} onValueChange={setStatusSel}>
              <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {ATENDIMENTO_STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
                <SelectItem value="pendente">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">{filtered.length} registro(s)</p>
        </CardContent>
      </Card>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum atendimento encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Protocolo</th>
                  <th className="text-left px-3 py-3 font-bold">Cliente</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Prioridade</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">SLA</th>
                  <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Abertura</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const isOverdue =
                    r.data_hora_limite &&
                    new Date(r.data_hora_limite).getTime() < Date.now() &&
                    !r.sla_cumprido &&
                    r.status !== 'Finalizado' &&
                    r.status !== 'Cancelado'
                  return (
                    <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                      <td className="px-3 py-2">
                        <Link
                          to={`/admin/atendimento/detalhe/${r.id}`}
                          className="text-[#005B2E] font-bold hover:underline"
                        >
                          {r.protocol}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{r.client_name || '—'}</td>
                      <td className="px-3 py-2 hidden md:table-cell">{r.prioridade || '—'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded',
                            STATUS_BADGE_COLORS[r.status] || '',
                          )}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 hidden lg:table-cell">
                        {isOverdue ? (
                          <span className="text-xs font-bold text-red-600">Vencido</span>
                        ) : r.sla_cumprido ? (
                          <span className="text-xs font-bold text-green-600">Cumprido</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 hidden lg:table-cell">
                        {r.created ? new Date(r.created).toLocaleString('pt-BR') : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
