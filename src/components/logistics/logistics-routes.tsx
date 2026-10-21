import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getRoutes, createRoute, updateRoute, deleteRoute } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { useOrgFilter } from '@/hooks/use-org-filter'
import { MissingTenantNotice } from '@/components/multitenancy/missing-tenant-notice'
import { toast } from '@/hooks/use-toast'
import { ROUTE_STATUS, type LogisticsRoute } from '@/lib/logistics-types'
import { canCreateRoutes, canEditRoutes } from '@/lib/logistics-permissions'
import { Plus, Pencil, Trash2, Copy, Search, Loader2 } from 'lucide-react'

export function LogisticsRoutes() {
  const { user } = useAuth()
  const { hasMissingOrgBinding } = useOrgFilter()
  const role = user?.role as string
  const [records, setRecords] = useState<LogisticsRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<LogisticsRoute | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords(await getRoutes())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_routes', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.nome_rota || '').toLowerCase().includes(t) ||
      (r.codigo_rota || '').toLowerCase().includes(t)
    )
  })

  const handleNew = () => {
    setEditing(null)
    setForm({
      codigo_rota: `RT-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      situacao: 'Ativa',
      responsavel: (user?.name as string) || '',
      capacidade_maxima_peso: '0',
      capacidade_maxima_volume: '0',
    })
    setOpen(true)
  }
  const handleEdit = (r: LogisticsRoute) => {
    setEditing(r)
    setForm({ ...r } as unknown as Record<string, string>)
    setOpen(true)
  }
  const handleDuplicate = (r: LogisticsRoute) => {
    setEditing(null)
    setForm({
      ...r,
      id: '',
      codigo_rota: `RT-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    } as unknown as Record<string, string>)
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const data = {
        ...form,
        capacidade_maxima_peso: parseFloat(form.capacidade_maxima_peso) || 0,
        capacidade_maxima_volume: parseFloat(form.capacidade_maxima_volume) || 0,
        clientes_vinculados: [],
        sequencia_entregas: [],
        historico: [],
      }
      if (editing) await updateRoute(editing.id, data)
      else await createRoute(data)
      toast({ title: editing ? 'Rota atualizada' : 'Rota criada' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }
  const handleDelete = async (id: string) => {
    try {
      await deleteRoute(id)
      toast({ title: 'Rota excluída' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  if (hasMissingOrgBinding) {
    return <MissingTenantNotice moduleName="Logística / Rotas" />
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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar rota..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        {canCreateRoutes(role) && (
          <Button
            onClick={handleNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Rota
          </Button>
        )}
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Código</th>
                <th className="text-left px-3 py-2 font-bold">Nome</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Região</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">
                  Cidade Origem
                </th>
                <th className="text-left px-3 py-2 font-bold">Situação</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">{r.codigo_rota}</td>
                  <td className="px-3 py-2 font-medium">{r.nome_rota || '—'}</td>
                  <td className="px-3 py-2 hidden md:table-cell">{r.regiao || '—'}</td>
                  <td className="px-3 py-2 hidden md:table-cell">{r.cidade_origem || '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${r.situacao === 'Ativa' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {r.situacao}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-0.5">
                      {canEditRoutes(role) && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(r)}
                            className="text-[#005B2E] h-8 w-8 p-0"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDuplicate(r)}
                            className="text-blue-600 h-8 w-8 p-0"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(r.id)}
                            className="text-red-600 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar Rota' : 'Nova Rota'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Código</Label>
              <Input
                value={form.codigo_rota || ''}
                disabled
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Nome da Rota *</Label>
              <Input
                value={form.nome_rota || ''}
                onChange={(e) => setForm({ ...form, nome_rota: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Região</Label>
              <Input
                value={form.regiao || ''}
                onChange={(e) => setForm({ ...form, regiao: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Cidade de Origem</Label>
              <Input
                value={form.cidade_origem || ''}
                onChange={(e) => setForm({ ...form, cidade_origem: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Estado</Label>
              <Input
                value={form.estado || ''}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Distância Estimada</Label>
              <Input
                value={form.distancia_estimada || ''}
                onChange={(e) => setForm({ ...form, distancia_estimada: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Tempo Estimado</Label>
              <Input
                value={form.tempo_estimado || ''}
                onChange={(e) => setForm({ ...form, tempo_estimado: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Custo Estimado</Label>
              <Input
                value={form.custo_estimado || ''}
                onChange={(e) => setForm({ ...form, custo_estimado: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Horário de Saída</Label>
              <Input
                value={form.horario_saida || ''}
                onChange={(e) => setForm({ ...form, horario_saida: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Cap. Peso (kg)</Label>
              <Input
                type="number"
                value={form.capacidade_maxima_peso || '0'}
                onChange={(e) => setForm({ ...form, capacidade_maxima_peso: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Situação</Label>
              <Select
                value={form.situacao}
                onValueChange={(v) => setForm({ ...form, situacao: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROUTE_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Responsável</Label>
              <Input
                value={form.responsavel || ''}
                onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
