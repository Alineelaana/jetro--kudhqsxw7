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
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'

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

  const columns: JetroColumnDef<AtendimentoRecord>[] = [
    {
      id: 'protocol',
      header: 'Protocolo',
      accessorKey: 'protocol',
      dataType: 'text',
      defaultWidth: 160,
      cell: ({ row }) => (
        <Link
          to={`/admin/atendimento/detalhe/${row.id}`}
          className="text-[#005B2E] font-bold hover:underline"
        >
          {row.protocol}
        </Link>
      ),
    },
    {
      id: 'client_name',
      header: 'Cliente',
      accessorKey: 'client_name',
      dataType: 'text',
      defaultWidth: 220,
      cell: ({ row }) => <span>{row.client_name || '—'}</span>,
    },
    {
      id: 'prioridade',
      header: 'Prioridade',
      accessorKey: 'prioridade',
      dataType: 'text',
      defaultWidth: 130,
      cell: ({ row }) => <span>{row.prioridade || '—'}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      dataType: 'text',
      defaultWidth: 160,
      cell: ({ row }) => (
        <span
          className={cn(
            'text-xs font-bold px-2 py-0.5 rounded inline-block',
            STATUS_BADGE_COLORS[row.status] || '',
          )}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: 'sla',
      header: 'SLA',
      dataType: 'text',
      defaultWidth: 120,
      getSortValue: (row) => {
        const isOverdue =
          row.data_hora_limite &&
          new Date(row.data_hora_limite).getTime() < Date.now() &&
          !row.sla_cumprido &&
          row.status !== 'Finalizado' &&
          row.status !== 'Cancelado'
        return isOverdue ? '1_Vencido' : row.sla_cumprido ? '2_Cumprido' : '3_Pendente'
      },
      cell: ({ row }) => {
        const isOverdue =
          row.data_hora_limite &&
          new Date(row.data_hora_limite).getTime() < Date.now() &&
          !row.sla_cumprido &&
          row.status !== 'Finalizado' &&
          row.status !== 'Cancelado'
        return isOverdue ? (
          <span className="text-xs font-bold text-red-600">Vencido</span>
        ) : row.sla_cumprido ? (
          <span className="text-xs font-bold text-green-600">Cumprido</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )
      },
    },
    {
      id: 'created',
      header: 'Abertura',
      accessorKey: 'created',
      dataType: 'date',
      defaultWidth: 160,
      cell: ({ row }) => (
        <span>{row.created ? new Date(row.created).toLocaleString('pt-BR') : '—'}</span>
      ),
    },
  ]

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
        <JetroTable
          screenId="atendimento.central.list"
          columns={columns}
          data={filtered}
          exportTitle="Central de Atendimentos — HURAM ERP"
          exportFilename="atendimentos-jetro.xlsx"
        />
      )}
    </div>
  )
}
