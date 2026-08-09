import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Plus, Briefcase, AlertCircle } from 'lucide-react'
import { getMkJobs, createMkJob, updateMkJob } from '@/services/marketing'
import { MK_JOB_TYPES, MK_JOB_STATUS, MK_STATUS_COLORS } from '@/lib/marketing-types'
import type { MkJob } from '@/lib/marketing-types'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function MarketingJobs() {
  const { user } = useAuth()
  const [items, setItems] = useState<MkJob[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({
    title: '',
    type: 'arte',
    description: '',
    deadline: '',
    priority: 'normal',
    campaign_id: '',
  })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setItems(await getMkJobs())
    } catch {
      setItems([])
    }
    setLoading(false)
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useRealtime('mk_jobs', () => load())

  const handleSave = async () => {
    if (!form.title?.trim()) {
      toast.error('Informe o título')
      return
    }
    setSaving(true)
    try {
      await createMkJob({ ...form, responsible_name: (user?.name as string) || '' })
      toast.success('Job criado')
      setDialogOpen(false)
      setForm({
        title: '',
        type: 'arte',
        description: '',
        deadline: '',
        priority: 'normal',
        campaign_id: '',
      })
      load()
    } catch {
      toast.error('Erro ao criar job')
    }
    setSaving(false)
  }

  const advanceStatus = async (job: MkJob) => {
    const idx = MK_JOB_STATUS.findIndex((s) => s.value === job.status)
    if (idx < 0 || idx >= MK_JOB_STATUS.length - 2) return
    const next = MK_JOB_STATUS[idx + 1].value
    try {
      await updateMkJob(job.id, { status: next })
      load()
    } catch {
      toast.error('Erro')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const lateJobs = items.filter(
    (j) =>
      j.deadline &&
      new Date(j.deadline) < new Date() &&
      !['encerrado', 'cancelado'].includes(j.status),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#005B2E]">Gestor de Jobs</h2>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#005B2E] hover:bg-[#01361D]">
          <Plus className="w-4 h-4 mr-1" /> Novo Job
        </Button>
      </div>
      {lateJobs.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700">{lateJobs.length} job(s) atrasado(s)</span>
          </CardContent>
        </Card>
      )}
      {items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum job cadastrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((j) => (
            <Card
              key={j.id}
              className="border-l-4 border-[#005B2E] hover:shadow-md transition-shadow"
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-[#C89B3C]">{j.job_number}</span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded',
                      MK_STATUS_COLORS[j.status] || 'bg-gray-100',
                    )}
                  >
                    {MK_JOB_STATUS.find((s) => s.value === j.status)?.label || j.status}
                  </span>
                </div>
                <p className="font-semibold text-sm">{j.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {MK_JOB_TYPES.find((t) => t.value === j.type)?.label || j.type} • v
                  {j.version || 1}
                </p>
                {j.deadline && (
                  <p
                    className={cn(
                      'text-xs mt-1',
                      new Date(j.deadline) < new Date() &&
                        !['encerrado', 'cancelado'].includes(j.status)
                        ? 'text-red-600 font-bold'
                        : 'text-muted-foreground',
                    )}
                  >
                    Prazo: {j.deadline}
                  </p>
                )}
                {j.responsible_name && (
                  <p className="text-xs text-muted-foreground">Resp: {j.responsible_name}</p>
                )}
                {!['encerrado', 'cancelado'].includes(j.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full text-xs"
                    onClick={() => advanceStatus(j)}
                  >
                    Avançar Status
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Job de Marketing</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MK_JOB_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Prazo</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D]"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
