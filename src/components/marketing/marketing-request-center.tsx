import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Loader2, Plus, Search, Megaphone } from 'lucide-react'
import { getMkRequests, createMkRequest, updateMkRequest } from '@/services/marketing'
import { MK_REQUEST_TYPES, MK_REQUEST_STATUS, MK_STATUS_COLORS } from '@/lib/marketing-types'
import type { MkRequest } from '@/lib/marketing-types'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function MarketingRequestCenter() {
  const { user } = useAuth()
  const [items, setItems] = useState<MkRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({
    title: '',
    type: 'campanha',
    objective: '',
    briefing: '',
    priority: 'normal',
    deadline: '',
    budget: '',
    audience: '',
    channel: '',
  })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setItems(await getMkRequests())
    } catch {
      setItems([])
    }
    setLoading(false)
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useRealtime('mk_requests', () => load())

  const handleSave = async () => {
    if (!form.title?.trim()) {
      toast.error('Informe o título')
      return
    }
    setSaving(true)
    try {
      await createMkRequest({ ...form, responsible_name: (user?.name as string) || '' })
      toast.success('Solicitação criada')
      setDialogOpen(false)
      setForm({
        title: '',
        type: 'campanha',
        objective: '',
        briefing: '',
        priority: 'normal',
        deadline: '',
        budget: '',
        audience: '',
        channel: '',
      })
      load()
    } catch {
      toast.error('Erro ao criar solicitação')
    }
    setSaving(false)
  }

  const filtered = items.filter((r) => {
    const t = search.toLowerCase().trim()
    return !t || r.title?.toLowerCase().includes(t) || r.request_number?.toLowerCase().includes(t)
  })

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#005B2E]">Central de Solicitações de Marketing</h2>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#005B2E] hover:bg-[#01361D]">
          <Plus className="w-4 h-4 mr-1" /> Nova Solicitação
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="pl-10"
        />
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma solicitação encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r) => (
            <Card
              key={r.id}
              className="border-l-4 border-[#005B2E] hover:shadow-md transition-shadow"
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-[#C89B3C]">{r.request_number}</span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded',
                      MK_STATUS_COLORS[r.status] || 'bg-gray-100',
                    )}
                  >
                    {MK_REQUEST_STATUS.find((s) => s.value === r.status)?.label || r.status}
                  </span>
                </div>
                <p className="font-semibold text-sm">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {MK_REQUEST_TYPES.find((t) => t.value === r.type)?.label || r.type}
                </p>
                {r.deadline && <p className="text-xs text-amber-600 mt-1">Prazo: {r.deadline}</p>}
                {r.responsible_name && (
                  <p className="text-xs text-muted-foreground">Resp: {r.responsible_name}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Solicitação de Marketing</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MK_REQUEST_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Objetivo</Label>
              <Input
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
              />
            </div>
            <div>
              <Label>Briefing</Label>
              <Textarea
                value={form.briefing}
                onChange={(e) => setForm({ ...form, briefing: e.target.value })}
                rows={3}
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
                <Label>Orçamento (R$)</Label>
                <Input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Público</Label>
                <Input
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                />
              </div>
              <div>
                <Label>Canal</Label>
                <Input
                  value={form.channel}
                  onChange={(e) => setForm({ ...form, channel: e.target.value })}
                />
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
