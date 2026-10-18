import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getDeliveries, updateDelivery } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { DELIVERY_STATUS, type LogisticsDelivery } from '@/lib/logistics-types'
import { canUpdateDeliveries } from '@/lib/logistics-permissions'
import { useAuth } from '@/hooks/use-auth'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { Search, Loader2, Package } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  Programada: 'bg-blue-100 text-blue-700',
  'Em Trânsito': 'bg-cyan-100 text-cyan-700',
  'Saiu para Entrega': 'bg-indigo-100 text-indigo-700',
  Entregue: 'bg-emerald-100 text-emerald-700',
  Cancelada: 'bg-red-100 text-red-700',
  Devolvida: 'bg-orange-100 text-orange-700',
}

export function LogisticsDeliveries() {
  const { user } = useAuth()
  const role = user?.role as string
  const [records, setRecords] = useState<LogisticsDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = async () => {
    try {
      setRecords(await getDeliveries())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_deliveries', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    const matchSearch =
      !t ||
      (r.cliente || '').toLowerCase().includes(t) ||
      (r.numero_entrega || '').toLowerCase().includes(t) ||
      (r.pedido || '').toLowerCase().includes(t)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateDelivery(id, { status })
      toast({ title: 'Status atualizado' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
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
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar entrega..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {DELIVERY_STATUS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-muted-foreground">{filtered.length} entrega(s)</p>
      {records.length === 0 ? (
        <Card className="border-2 border-dashed">
          <div className="px-3 py-12 text-center text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
            Nenhuma entrega encontrada
          </div>
        </Card>
      ) : (
        <JetroTable
          screenId="logistica.entregas"
          columns={[
            {
              id: 'numero_entrega',
              header: 'Entrega',
              accessorKey: 'numero_entrega',
              dataType: 'text',
              defaultWidth: 120,
              cell: ({ value }) => (
                <span className="font-mono text-xs font-bold text-[#C89B3C]">
                  {String(value || '—')}
                </span>
              ),
            },
            {
              id: 'cliente',
              header: 'Cliente',
              accessorKey: 'cliente',
              dataType: 'text',
              defaultWidth: 200,
              cell: ({ value }) => <span className="font-medium">{String(value || '—')}</span>,
            },
            {
              id: 'rota',
              header: 'Rota',
              accessorKey: 'rota',
              dataType: 'text',
              defaultWidth: 150,
              cell: ({ value }) => <span>{String(value || '—')}</span>,
            },
            {
              id: 'veiculo',
              header: 'Veículo',
              accessorKey: 'veiculo',
              dataType: 'text',
              defaultWidth: 120,
              cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
            },
            {
              id: 'motorista',
              header: 'Motorista',
              accessorKey: 'motorista',
              dataType: 'text',
              defaultWidth: 160,
              cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
            },
            {
              id: 'data_prevista',
              header: 'Prevista',
              accessorKey: 'data_prevista',
              dataType: 'date',
              defaultWidth: 110,
              cell: ({ value }) => (
                <span className="text-xs">
                  {value ? new Date(String(value)).toLocaleDateString('pt-BR') : '—'}
                </span>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              accessorKey: 'status',
              dataType: 'text',
              align: 'center',
              defaultWidth: 130,
              cell: ({ value }) => (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[String(value || '')] || 'bg-gray-100 text-gray-600'}`}
                >
                  {String(value || '—')}
                </span>
              ),
            },
            ...(canUpdateDeliveries(role)
              ? [
                  {
                    id: 'actions',
                    header: 'Ação',
                    align: 'center' as const,
                    sortable: false,
                    hideable: false,
                    resizable: false,
                    draggable: false,
                    defaultWidth: 140,
                    cell: ({ row }: { row: LogisticsDelivery }) => (
                      <div className="flex justify-center">
                        <Select onValueChange={(v) => handleStatus(row.id, v)}>
                          <SelectTrigger className="h-7 w-32 text-xs focus-visible:ring-[#005B2E]">
                            <SelectValue placeholder="Alterar" />
                          </SelectTrigger>
                          <SelectContent>
                            {DELIVERY_STATUS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
          data={filtered}
          emptyMessage="Nenhuma entrega corresponde aos filtros."
          exportTitle="Entregas — Jetro ERP"
          exportFilename="entregas-jetro.xlsx"
        />
      )}
    </div>
  )
}
