import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getActivities, updateActivity } from '@/services/crm'
import { useRealtime } from '@/hooks/use-realtime'
import { ACTIVITY_TYPES, ACTIVITY_STATUS, type CrmActivity } from '@/lib/crm-types'
import { Plus, Search, Loader2, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { CrmActivityDialog } from '@/components/crm/crm-activity-dialog'
import { cn } from '@/lib/utils'

function getDaysOverdue(date: string, status: string): number {
  if (['Concluída', 'Cancelada', 'Não Realizada'].includes(status) || !date) return 0
  return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000))
}

const STATUS_ICONS: Record<string, typeof Clock> = {
  Agendada: Clock,
  'Em Andamento': Clock,
  Concluída: CheckCircle,
  Reagendada: Clock,
  'Não Realizada': XCircle,
  Cancelada: XCircle,
}

export function CrmActivities() {
  const [records, setRecords] = useState<CrmActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CrmActivity | null>(null)

  const load = async () => {
    try {
      setRecords(await getActivities())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('crm_activities', () => load())

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    const matchSearch =
      !term ||
      (r.title || '').toLowerCase().includes(term) ||
      (r.client_name || '').toLowerCase().includes(term) ||
      (r.responsible_name || '').toLowerCase().includes(term)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleQuickStatus = async (r: CrmActivity, status: string) => {
    try {
      await updateActivity(r.id, { status })
      toast({ title: 'Status atualizado' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Atividade
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar atividade, cliente, responsável..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {ACTIVITY_STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
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
            <p className="text-lg font-bold">Nenhuma atividade encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Atividade</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Tipo</th>
                  <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Cliente</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Resp.</th>
                  <th className="text-left px-3 py-3 font-bold">Data</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Prio.</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold">Atraso</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const days = getDaysOverdue(r.scheduled_date, r.status)
                  const Icon = STATUS_ICONS[r.status] || Clock
                  return (
                    <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                      <td className="px-3 py-2 font-medium">{r.title}</td>
                      <td className="px-3 py-2 hidden md:table-cell text-xs">{r.type}</td>
                      <td className="px-3 py-2 hidden lg:table-cell text-xs">
                        {r.client_name || '—'}
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell text-xs">
                        {r.responsible_name || '—'}
                      </td>
                      <td className="px-3 py-2 text-xs">{r.scheduled_date || '—'}</td>
                      <td className="px-3 py-2 hidden sm:table-cell">
                        <span
                          className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded',
                            r.priority === 'Urgente'
                              ? 'bg-red-100 text-red-700'
                              : r.priority === 'Alta'
                                ? 'bg-orange-100 text-orange-700'
                                : r.priority === 'Normal'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-600',
                          )}
                        >
                          {r.priority || 'Normal'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-1 text-xs font-bold">
                          <Icon className="w-3 h-3" /> {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {days > 0 ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                            <AlertTriangle className="w-3 h-3" /> {days}d
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-0.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditing(r)
                              setDialogOpen(true)
                            }}
                            className="text-[#005B2E] h-8 w-8 p-0"
                          >
                            ✏️
                          </Button>
                          {r.status !== 'Concluída' && r.status !== 'Cancelada' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleQuickStatus(r, 'Concluída')}
                              className="text-green-600 h-8 w-8 p-0"
                              title="Concluir"
                            >
                              ✓
                            </Button>
                          )}
                          {r.status !== 'Cancelada' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleQuickStatus(r, 'Cancelada')}
                              className="text-red-600 h-8 w-8 p-0"
                              title="Cancelar"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <CrmActivityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        activity={editing}
        onSuccess={load}
      />
    </div>
  )
}
