import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Plus, Radio } from 'lucide-react'
import {
  getMkMediaCampaigns,
  createMkMediaCampaign,
  updateMkMediaCampaign,
} from '@/services/marketing'
import { MK_MEDIA_CHANNELS } from '@/lib/marketing-types'
import type { MkMediaCampaign } from '@/lib/marketing-types'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'

export function MarketingMediaManager() {
  const [items, setItems] = useState<MkMediaCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({
    name: '',
    channel: 'google',
    type: 'paga',
    budget: '',
    investment: '',
    start_date: '',
    end_date: '',
    agency: '',
    objective: '',
  })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setItems(await getMkMediaCampaigns())
    } catch {
      setItems([])
    }
    setLoading(false)
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useRealtime('mk_media_campaigns', () => load())

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error('Informe o nome')
      return
    }
    setSaving(true)
    try {
      await createMkMediaCampaign({ ...form, impressions: 0, clicks: 0, leads: 0, conversions: 0 })
      toast.success('Campanha de mídia criada')
      setDialogOpen(false)
      setForm({
        name: '',
        channel: 'google',
        type: 'paga',
        budget: '',
        investment: '',
        start_date: '',
        end_date: '',
        agency: '',
        objective: '',
      })
      load()
    } catch {
      toast.error('Erro')
    }
    setSaving(false)
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
        <h2 className="text-lg font-bold text-[#005B2E]">Gestão de Mídia</h2>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#005B2E] hover:bg-[#01361D]">
          <Plus className="w-4 h-4 mr-1" /> Nova Campanha
        </Button>
      </div>
      {items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Radio className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma campanha de mídia cadastrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((m) => (
            <Card key={m.id} className="border-l-4 border-[#005B2E]">
              <CardContent className="p-3">
                <p className="font-semibold text-sm">{m.name}</p>
                <p className="text-xs text-muted-foreground">
                  {MK_MEDIA_CHANNELS.find((c) => c.value === m.channel)?.label || m.channel} •{' '}
                  {m.type}
                </p>
                {m.investment && (
                  <p className="text-xs text-[#005B2E] font-semibold mt-1">
                    Investimento: R$ {m.investment}
                  </p>
                )}
                {m.leads > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Leads: {m.leads} • Conv: {m.conversions}
                  </p>
                )}
                {m.start_date && (
                  <p className="text-xs text-muted-foreground">
                    {m.start_date} → {m.end_date || '—'}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Campanha de Mídia</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Canal</Label>
                <Select
                  value={form.channel}
                  onValueChange={(v) => setForm({ ...form, channel: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MK_MEDIA_CHANNELS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paga">Paga</SelectItem>
                    <SelectItem value="organica">Orgânica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Orçamento</Label>
                <Input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>
              <div>
                <Label>Investimento</Label>
                <Input
                  type="number"
                  value={form.investment}
                  onChange={(e) => setForm({ ...form, investment: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Início</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Fim</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Agência/Fornecedor</Label>
              <Input
                value={form.agency}
                onChange={(e) => setForm({ ...form, agency: e.target.value })}
              />
            </div>
            <div>
              <Label>Objetivo</Label>
              <Input
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
              />
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
