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
import { Calendar, Plus, Loader2, Clock } from 'lucide-react'
import {
  getCalendars,
  getShifts,
  createCalendar,
  createShift,
} from '@/services/industrial-extended'
import { getProductionResources } from '@/services/industry'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'

export function CapacityPanel() {
  const [calendars, setCalendars] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false)
  const [selectedCal, setSelectedCal] = useState<string | null>(null)

  const load = async () => {
    try {
      const [c, s, r] = await Promise.all([getCalendars(), getShifts(), getProductionResources()])
      setCalendars(c)
      setShifts(s)
      setResources(r as any[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('industrial_calendars', () => load())
  useRealtime('industrial_shifts', () => load())

  const handleCreateCal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await createCalendar({
        name: String(fd.get('name') || ''),
        resource_id: String(fd.get('resource_id') || '') || undefined,
        work_days: ['seg', 'ter', 'qua', 'qui', 'sex'],
        active: true,
        responsible: 'Admin',
      })
      toast({ title: 'Calendario criado' })
      setDialogOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao criar calendario', variant: 'destructive' })
    }
  }

  const handleCreateShift = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (!selectedCal) return
    try {
      await createShift({
        calendar_id: selectedCal,
        name: String(fd.get('name') || ''),
        start_time: String(fd.get('start_time') || ''),
        end_time: String(fd.get('end_time') || ''),
        capacity_hours: Number(fd.get('capacity_hours') || 0),
        active: true,
      })
      toast({ title: 'Turno criado' })
      setShiftDialogOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao criar turno', variant: 'destructive' })
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
          <Calendar className="w-6 h-6 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">Capacidade Produtiva</h2>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Calendario
        </Button>
      </div>
      {calendars.map((c) => (
        <Card key={c.id} className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.expand?.resource_id?.name || 'Todos os recursos'} •{' '}
                  {(c.work_days || []).join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }
                >
                  {c.active ? 'Ativo' : 'Inativo'}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => {
                    setSelectedCal(c.id)
                    setShiftDialogOpen(true)
                  }}
                >
                  <Clock className="w-3 h-3 mr-1" /> Add Turno
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {shifts
                .filter((s) => s.calendar_id === c.id)
                .map((s) => (
                  <div key={s.id} className="p-2 bg-muted/30 rounded text-sm">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.start_time} - {s.end_time} ({s.capacity_hours}h)
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Calendario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCal} className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Nome *</Label>
              <Input name="name" required className="focus-visible:ring-[#005B2E]" />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Turno</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateShift} className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Nome *</Label>
              <Input name="name" required className="focus-visible:ring-[#005B2E]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Inicio</Label>
                <Input
                  name="start_time"
                  placeholder="06:00"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">Fim</Label>
                <Input
                  name="end_time"
                  placeholder="14:00"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Capacidade (h)</Label>
              <Input
                name="capacity_hours"
                type="number"
                step="0.5"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
