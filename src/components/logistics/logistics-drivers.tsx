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
import { getDrivers, createDriver, updateDriver } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { DRIVER_STATUS, DRIVER_VINCULO, type LogisticsDriver } from '@/lib/logistics-types'
import { canRegisterDrivers } from '@/lib/logistics-permissions'
import { Plus, Pencil, Search, Loader2, User } from 'lucide-react'

export function LogisticsDrivers() {
  const { user } = useAuth()
  const role = user?.role as string
  const [records, setRecords] = useState<LogisticsDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<LogisticsDriver | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords(await getDrivers())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_drivers', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.nome || '').toLowerCase().includes(t) ||
      (r.cpf || '').toLowerCase().includes(t) ||
      (r.numero_cnh || '').toLowerCase().includes(t)
    )
  })

  const handleNew = () => {
    setEditing(null)
    setForm({ situacao: 'Disponível', tipo_vinculo: 'Colaborador' })
    setOpen(true)
  }
  const handleEdit = (r: LogisticsDriver) => {
    setEditing(r)
    setForm({ ...r } as unknown as Record<string, string>)
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const data = {
        ...form,
        documentos: [],
        rotas: [],
        entregas: [],
        ocorrencias: [],
        desempenho: [],
        historico: [],
      }
      if (editing) await updateDriver(editing.id, data)
      else await createDriver(data)
      toast({ title: editing ? 'Motorista atualizado' : 'Motorista cadastrado' })
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
            placeholder="Buscar motorista..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        {canRegisterDrivers(role) && (
          <Button
            onClick={handleNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Motorista
          </Button>
        )}
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Nome</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">CPF</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">CNH</th>
                <th className="text-left px-3 py-2 font-bold hidden lg:table-cell">Vínculo</th>
                <th className="text-left px-3 py-2 font-bold hidden lg:table-cell">Telefone</th>
                <th className="text-left px-3 py-2 font-bold">Situação</th>
                {canRegisterDrivers(role) && (
                  <th className="text-center px-3 py-2 font-bold">Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center text-muted-foreground">
                    <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Nenhum motorista encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-medium">{r.nome || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs">{r.cpf || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs">
                      {r.numero_cnh || '—'}
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell">{r.tipo_vinculo}</td>
                    <td className="px-3 py-2 hidden lg:table-cell text-xs">{r.telefone || '—'}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${r.situacao === 'Disponível' ? 'bg-emerald-100 text-emerald-700' : r.situacao === 'Em Rota' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {r.situacao}
                      </span>
                    </td>
                    {canRegisterDrivers(role) && (
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
              {editing ? 'Editar Motorista' : 'Novo Motorista'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Nome *</Label>
              <Input
                value={form.nome || ''}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">CPF</Label>
              <Input
                value={form.cpf || ''}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Telefone</Label>
              <Input
                value={form.telefone || ''}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">E-mail</Label>
              <Input
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Nº CNH</Label>
              <Input
                value={form.numero_cnh || ''}
                onChange={(e) => setForm({ ...form, numero_cnh: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Categoria CNH</Label>
              <Input
                value={form.categoria_cnh || ''}
                onChange={(e) => setForm({ ...form, categoria_cnh: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Validade CNH</Label>
              <Input
                type="date"
                value={form.validade_cnh || ''}
                onChange={(e) => setForm({ ...form, validade_cnh: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Tipo de Vínculo</Label>
              <Select
                value={form.tipo_vinculo}
                onValueChange={(v) => setForm({ ...form, tipo_vinculo: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DRIVER_VINCULO.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {DRIVER_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Endereço</Label>
              <Input
                value={form.endereco || ''}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
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
