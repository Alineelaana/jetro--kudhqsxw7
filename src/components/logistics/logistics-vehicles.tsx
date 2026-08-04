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
import { getVehicles, createVehicle, updateVehicle } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { VEHICLE_STATUS, VEHICLE_OWNERSHIP, type LogisticsVehicle } from '@/lib/logistics-types'
import { canRegisterVehicles } from '@/lib/logistics-permissions'
import { Plus, Pencil, Search, Loader2, Truck } from 'lucide-react'

export function LogisticsVehicles() {
  const { user } = useAuth()
  const role = user?.role as string
  const [records, setRecords] = useState<LogisticsVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<LogisticsVehicle | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords(await getVehicles())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_vehicles', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.placa || '').toLowerCase().includes(t) ||
      (r.modelo || '').toLowerCase().includes(t) ||
      (r.codigo || '').toLowerCase().includes(t)
    )
  })

  const handleNew = () => {
    setEditing(null)
    setForm({
      codigo: `VEIC-${Date.now().toString(36).toUpperCase().slice(-5)}`,
      situacao: 'Disponível',
      tipo_propriedade: 'Próprio',
      quantidade_eixos: '2',
      capacidade_peso: '0',
      capacidade_volume: '0',
    })
    setOpen(true)
  }
  const handleEdit = (r: LogisticsVehicle) => {
    setEditing(r)
    setForm({ ...r } as unknown as Record<string, string>)
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const data = {
        ...form,
        capacidade_peso: parseFloat(form.capacidade_peso) || 0,
        capacidade_volume: parseFloat(form.capacidade_volume) || 0,
        quantidade_eixos: parseInt(form.quantidade_eixos) || 2,
        manutencoes: [],
        abastecimentos: [],
        documentos: [],
        historico: [],
      }
      if (editing) await updateVehicle(editing.id, data)
      else await createVehicle(data)
      toast({ title: editing ? 'Veículo atualizado' : 'Veículo cadastrado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
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
            placeholder="Buscar veículo..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        {canRegisterVehicles(role) && (
          <Button
            onClick={handleNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Veículo
          </Button>
        )}
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Código</th>
                <th className="text-left px-3 py-2 font-bold">Placa</th>
                <th className="text-left px-3 py-2 font-bold">Marca/Modelo</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Propriedade</th>
                <th className="text-right px-3 py-2 font-bold hidden lg:table-cell">Cap. Peso</th>
                <th className="text-left px-3 py-2 font-bold">Situação</th>
                {canRegisterVehicles(role) && (
                  <th className="text-center px-3 py-2 font-bold">Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center text-muted-foreground">
                    <Truck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Nenhum veículo encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-mono text-xs font-bold text-[#C89B3C]">
                      {r.codigo}
                    </td>
                    <td className="px-3 py-2 font-bold">{r.placa || '—'}</td>
                    <td className="px-3 py-2">
                      {r.marca} {r.modelo}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">{r.tipo_propriedade}</td>
                    <td className="px-3 py-2 text-right hidden lg:table-cell">
                      {r.capacidade_peso || 0} kg
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${r.situacao === 'Disponível' ? 'bg-emerald-100 text-emerald-700' : r.situacao === 'Em Rota' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {r.situacao}
                      </span>
                    </td>
                    {canRegisterVehicles(role) && (
                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(r)}
                            className="text-[#005B2E] h-8 w-8 p-0"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar Veículo' : 'Novo Veículo'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Código</Label>
              <Input value={form.codigo || ''} disabled className="focus-visible:ring-[#005B2E]" />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Placa *</Label>
              <Input
                value={form.placa || ''}
                onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Marca</Label>
              <Input
                value={form.marca || ''}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Modelo</Label>
              <Input
                value={form.modelo || ''}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Ano</Label>
              <Input
                value={form.ano || ''}
                onChange={(e) => setForm({ ...form, ano: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Tipo de Propriedade</Label>
              <Select
                value={form.tipo_propriedade}
                onValueChange={(v) => setForm({ ...form, tipo_propriedade: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_OWNERSHIP.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Capacidade Peso (kg)</Label>
              <Input
                type="number"
                value={form.capacidade_peso || '0'}
                onChange={(e) => setForm({ ...form, capacidade_peso: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Capacidade Volume (m³)</Label>
              <Input
                type="number"
                value={form.capacidade_volume || '0'}
                onChange={(e) => setForm({ ...form, capacidade_volume: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Venc. Licenciamento</Label>
              <Input
                type="date"
                value={form.vencimento_licenciamento || ''}
                onChange={(e) => setForm({ ...form, vencimento_licenciamento: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Venc. Seguro</Label>
              <Input
                type="date"
                value={form.vencimento_seguro || ''}
                onChange={(e) => setForm({ ...form, vencimento_seguro: e.target.value })}
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
                  {VEHICLE_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
