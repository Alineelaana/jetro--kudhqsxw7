import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Wrench,
  Plus,
  Loader2,
  AlertCircle,
  Gauge,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react'
import {
  getMaintenanceSchedules,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
} from '@/services/industrial-extended'
import { getProductionResources } from '@/services/industry'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'

const STATUS_COLORS: Record<string, string> = {
  agendada: 'bg-blue-100 text-blue-700',
  em_andamento: 'bg-amber-100 text-amber-700',
  concluida: 'bg-emerald-100 text-emerald-700',
  atrasada: 'bg-red-100 text-red-700',
  cancelada: 'bg-gray-100 text-gray-600',
}
const TYPE_LABELS: Record<string, string> = {
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
  preditiva: 'Preditiva',
}

export function MaintenancePanel() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  const load = async () => {
    try {
      const [s, r] = await Promise.all([getMaintenanceSchedules(), getProductionResources()])
      setSchedules(s)
      setResources(r as any[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('maintenance_schedules', () => load())

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const resourceId = String(fd.get('resource_id') || '')
    if (!resourceId) {
      toast({ title: 'Selecione um recurso', variant: 'destructive' })
      return
    }
    try {
      await createMaintenanceSchedule({
        resource_id: resourceId,
        type: String(fd.get('type') || 'preventiva') as any,
        title: String(fd.get('title') || ''),
        description: String(fd.get('description') || ''),
        frequency_days: Number(fd.get('frequency_days') || 0),
        next_maintenance: String(fd.get('next_maintenance') || ''),
        status: 'agendada',
        impact_on_production: String(fd.get('impact_on_production') || 'baixo') as any,
        estimated_downtime_hours: Number(fd.get('estimated_downtime_hours') || 0),
        responsible: 'Manutencao',
      })
      toast({ title: 'Manutencao agendada' })
      setDialogOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao agendar manutencao', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateMaintenanceSchedule(id, { status: status as any })
      toast({ title: 'Status atualizado' })
      load()
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">Manutenção</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border p-0.5 bg-muted/40">
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              className={`h-8 px-2.5 text-xs ${viewMode === 'table' ? 'bg-[#005B2E] text-white hover:bg-[#01361D]' : ''}`}
              onClick={() => setViewMode('table')}
              title="Visualização em Tabela"
            >
              <TableIcon className="w-4 h-4 mr-1" /> Tabela
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              className={`h-8 px-2.5 text-xs ${viewMode === 'cards' ? 'bg-[#005B2E] text-white hover:bg-[#01361D]' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-4 h-4 mr-1" /> Cards
            </Button>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Manutenção
          </Button>
        </div>
      </div>
      {schedules.filter((s) => s.status === 'atrasada').length > 0 && (
        <Card className="border-2 border-red-200 bg-red-50/50">
          <CardContent className="py-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-semibold text-red-700">
              {schedules.filter((s) => s.status === 'atrasada').length} manutencao(oes) atrasada(s)!
            </p>
          </CardContent>
        </Card>
      )}
      {schedules.filter((s) => s.status === 'em_andamento' || s.status === 'atrasada').length >
        0 && (
        <Card className="border-2 border-amber-200 bg-amber-50/50">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-5 h-5 text-amber-600" />
              <p className="text-sm font-semibold text-amber-700">Impacto na Produção</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-black text-amber-600">
                  {
                    schedules.filter((s) => s.status === 'em_andamento' || s.status === 'atrasada')
                      .length
                  }
                </p>
                <p className="text-xs text-muted-foreground">Máquinas indisponíveis</p>
              </div>
              <div>
                <p className="text-xl font-black text-amber-600">
                  {schedules
                    .filter((s) => s.status === 'em_andamento' || s.status === 'atrasada')
                    .reduce((sum, s) => sum + (s.estimated_downtime_hours || 0), 0)}
                  h
                </p>
                <p className="text-xs text-muted-foreground">Tempo parado estimado</p>
              </div>
              <div>
                <p className="text-xl font-black text-amber-600">
                  {
                    new Set(
                      schedules
                        .filter((s) => s.status === 'em_andamento' || s.status === 'atrasada')
                        .map((s) => s.resource_id),
                    ).size
                  }
                </p>
                <p className="text-xs text-muted-foreground">Recursos afetados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {viewMode === 'table' ? (
        <JetroTable
          screenId="industria.manutencao"
          columns={[
            {
              id: 'title',
              header: 'Título',
              accessorKey: 'title',
              dataType: 'text',
              defaultWidth: 220,
              cell: ({ row }) => (
                <div>
                  <span className="font-medium">{row.title}</span>
                  {row.description && (
                    <p className="text-xs text-muted-foreground truncate">{row.description}</p>
                  )}
                </div>
              ),
            },
            {
              id: 'resource',
              header: 'Recurso',
              dataType: 'text',
              defaultWidth: 180,
              getSortValue: (row) => row.expand?.resource_id?.name || '',
              cell: ({ row }) => <span>{row.expand?.resource_id?.name || '—'}</span>,
            },
            {
              id: 'type',
              header: 'Tipo',
              accessorKey: 'type',
              dataType: 'text',
              defaultWidth: 130,
              getSortValue: (row) => TYPE_LABELS[row.type] || row.type,
              cell: ({ value }) => (
                <span>{TYPE_LABELS[String(value)] || String(value || '—')}</span>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              accessorKey: 'status',
              dataType: 'text',
              defaultWidth: 140,
              cell: ({ value }) => (
                <Badge className={STATUS_COLORS[String(value)] || 'bg-gray-100'}>
                  {String(value || '—')}
                </Badge>
              ),
            },
            {
              id: 'next_maintenance',
              header: 'Próxima Data',
              accessorKey: 'next_maintenance',
              dataType: 'date',
              defaultWidth: 130,
              cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
            },
            {
              id: 'frequency_days',
              header: 'Freq. (dias)',
              accessorKey: 'frequency_days',
              dataType: 'number',
              align: 'right',
              defaultWidth: 110,
              cell: ({ value }) => <span>{value ? `${value}d` : '—'}</span>,
            },
            {
              id: 'estimated_downtime_hours',
              header: 'Parada Est.',
              accessorKey: 'estimated_downtime_hours',
              dataType: 'number',
              align: 'right',
              defaultWidth: 110,
              cell: ({ value }) => <span>{value ? `${value}h` : '—'}</span>,
            },
            {
              id: 'actions',
              header: 'Ações',
              sortable: false,
              hideable: false,
              resizable: false,
              draggable: false,
              defaultWidth: 160,
              cell: ({ row: s }) => (
                <div className="flex gap-1">
                  {s.status === 'agendada' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs px-2"
                      onClick={() => handleStatusChange(s.id, 'em_andamento')}
                    >
                      Iniciar
                    </Button>
                  )}
                  {s.status === 'em_andamento' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs px-2"
                      onClick={() => handleStatusChange(s.id, 'concluida')}
                    >
                      Concluir
                    </Button>
                  )}
                  {s.status !== 'concluida' && s.status !== 'cancelada' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs px-2 text-red-600"
                      onClick={() => handleStatusChange(s.id, 'cancelada')}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={schedules}
          emptyMessage="Nenhuma manutenção cadastrada."
          exportTitle="Manutenção Industrial — Jetro"
          exportFilename="manutencao-industrial.xlsx"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((s) => (
            <Card key={s.id} className="border-2 border-[#005B2E]/20">
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.expand?.resource_id?.name || '—'} • {TYPE_LABELS[s.type] || s.type}
                    </p>
                  </div>
                  <Badge className={STATUS_COLORS[s.status] || 'bg-gray-100'}>{s.status}</Badge>
                </div>
                {s.description && (
                  <p className="text-xs text-muted-foreground mb-2">{s.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  {s.next_maintenance && <span>Proxima: {s.next_maintenance}</span>}
                  {s.frequency_days > 0 && <span>• A cada {s.frequency_days} dias</span>}
                  {s.estimated_downtime_hours > 0 && (
                    <span>• {s.estimated_downtime_hours}h parada</span>
                  )}
                </div>
                <div className="flex gap-1">
                  {s.status === 'agendada' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleStatusChange(s.id, 'em_andamento')}
                    >
                      Iniciar
                    </Button>
                  )}
                  {s.status === 'em_andamento' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleStatusChange(s.id, 'concluida')}
                    >
                      Concluir
                    </Button>
                  )}
                  {s.status !== 'concluida' && s.status !== 'cancelada' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-red-600"
                      onClick={() => handleStatusChange(s.id, 'cancelada')}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Manutencao</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Recurso *</Label>
              <Select name="resource_id">
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Titulo *</Label>
              <Input name="title" required className="focus-visible:ring-[#005B2E]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Tipo</Label>
                <Select name="type" defaultValue="preventiva">
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">Impacto</Label>
                <Select name="impact_on_production" defaultValue="baixo">
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['nenhum', 'baixo', 'medio', 'alto', 'critico'].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Frequencia (dias)</Label>
                <Input
                  name="frequency_days"
                  type="number"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">Proxima Data</Label>
                <Input
                  name="next_maintenance"
                  type="date"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Tempo Estimado (h)</Label>
              <Input
                name="estimated_downtime_hours"
                type="number"
                step="0.5"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Descricao</Label>
              <Textarea name="description" rows={2} className="focus-visible:ring-[#005B2E]" />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Agendar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
