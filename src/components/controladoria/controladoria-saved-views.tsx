import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Plus, Trash2, Eye, Share2 } from 'lucide-react'
import { getSavedViews, createSavedView, deleteSavedView } from '@/services/controladoria'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { canManageSavedViews } from '@/lib/controladoria-permissions'
import { cn } from '@/lib/utils'

const VIEW_TYPES: Record<string, string> = {
  dre: 'DRE',
  kpis: 'KPIs',
  margins: 'Margens',
  rentability: 'Rentabilidade',
  variations: 'Variações',
  closing: 'Fechamento',
}

export function ControladoriaSavedViews() {
  const { user, userRole } = useAuth()
  const [views, setViews] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      setViews((await getSavedViews()) as Record<string, unknown>[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('controladoria_saved_views', () => load())

  const handleCreate = async () => {
    await createSavedView({
      name: form.name || 'Nova Visão',
      view_type: form.view_type || 'dre',
      filters: JSON.stringify({ period: form.period || '' }),
      columns: JSON.stringify({ selected: form.columns?.split(',') || [] }),
      groupings: JSON.stringify({ group: form.grouping || '' }),
      comparison: JSON.stringify({ type: form.comparison || 'none' }),
      user_name: (user?.name as string) || 'Usuário',
      is_shared: form.is_shared === 'true',
      company: '',
    })
    setOpen(false)
    setForm({})
    load()
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManageSavedViews(userRole) && (
          <Button
            size="sm"
            className="bg-[#005B2E] hover:bg-[#01361D]"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Nova Visão
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {views.map((v) => (
          <Card
            key={v.id as string}
            className="border-2 border-[#005B2E]/20 hover:shadow-lg transition-shadow"
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-sm">{String(v.name || '—')}</h3>
                  <Badge variant="outline" className="text-xs mt-1">
                    {VIEW_TYPES[String(v.view_type || '')] || v.view_type}
                  </Badge>
                </div>
                {v.is_shared && <Share2 className="w-4 h-4 text-[#C89B3C]" />}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between border-b border-border py-0.5">
                  <span className="text-muted-foreground">Usuário</span>
                  <span>{String(v.user_name || '—')}</span>
                </div>
                <div className="flex justify-between border-b border-border py-0.5">
                  <span className="text-muted-foreground">Compartilhada</span>
                  <span>{v.is_shared ? 'Sim' : 'Não'}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground">Criada</span>
                  <span>
                    {v.created ? new Date(v.created as string).toLocaleDateString('pt-BR') : '—'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="w-3.5 h-3.5 mr-1" /> Abrir
                </Button>
                {canManageSavedViews(userRole) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await deleteSavedView(v.id as string)
                      load()
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {views.length === 0 && (
        <p className="text-center py-6 text-muted-foreground">Nenhuma visão salva.</p>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Visão Salva</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1 col-span-2">
              <Label className="text-xs">Nome</Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <select
                value={form.view_type || ''}
                onChange={(e) => setForm({ ...form, view_type: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="dre">DRE</option>
                <option value="kpis">KPIs</option>
                <option value="margins">Margens</option>
                <option value="rentability">Rentabilidade</option>
                <option value="variations">Variações</option>
                <option value="closing">Fechamento</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Período</Label>
              <Input
                value={form.period || ''}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Comparação</Label>
              <select
                value={form.comparison || ''}
                onChange={(e) => setForm({ ...form, comparison: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="none">Sem comparação</option>
                <option value="previous">Período anterior</option>
                <option value="budget">Orçado</option>
                <option value="forecast">Forecast</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Agrupamento</Label>
              <Input
                value={form.grouping || ''}
                onChange={(e) => setForm({ ...form, grouping: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Colunas (separadas por vírgula)</Label>
              <Input
                value={form.columns || ''}
                onChange={(e) => setForm({ ...form, columns: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Compartilhada</Label>
              <select
                value={form.is_shared || 'false'}
                onChange={(e) => setForm({ ...form, is_shared: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} className="bg-[#005B2E] hover:bg-[#01361D]">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
