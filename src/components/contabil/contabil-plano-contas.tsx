import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getPlanoContas } from '@/services/contabil'
import { ctCreate, ctUpdate, ctDelete } from '@/services/contabil'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Plus, Search, Pencil, Trash2, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { ACCOUNT_GROUPS } from '@/lib/contabil-types'

export function ContabilPlanoContas() {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string | boolean>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setRecords(await getPlanoContas())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('plano_contas', () => load())

  const filtered = records.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (r.code || '').toLowerCase().includes(q) || (r.name || '').toLowerCase().includes(q)
  })

  const openNew = () => {
    setEditing(null)
    setForm({ active: true, situacao: 'Ativo', natureza: 'Devedora', aceita_lancamentos: true })
    setOpen(true)
  }
  const openEdit = (r: any) => {
    setEditing(r)
    setForm({ ...r })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) {
      toast.error('Nome é obrigatório')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await ctUpdate('plano_contas', editing.id, form)
        toast.success('Atualizado')
      } else {
        await ctCreate('plano_contas', form)
        toast.success('Criado')
      }
      setOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await ctDelete('plano_contas', id)
      toast.success('Excluído')
      load()
    } catch {
      toast.error('Erro — conta pode ter lançamentos vinculados')
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
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">Plano de Contas</h3>
        <Button onClick={openNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
          <Plus className="w-4 h-4 mr-2" /> Nova Conta
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conta..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
        </CardContent>
      </Card>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Código</th>
                <th className="text-left px-3 py-3 font-bold">Nome</th>
                <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Grupo</th>
                <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Natureza</th>
                <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">
                  Conta Superior
                </th>
                <th className="text-center px-3 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-3 font-mono text-xs font-bold text-[#C89B3C]">
                    {r.code || '—'}
                  </td>
                  <td className="px-3 py-3 font-medium">{r.name || '—'}</td>
                  <td className="px-3 py-3 hidden md:table-cell text-xs">
                    {r.grupo || r.type || '—'}
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell text-xs">{r.natureza || '—'}</td>
                  <td className="px-3 py-3 hidden lg:table-cell text-xs">{r.parent_code || '—'}</td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex gap-0.5 justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(r)}
                        className="text-[#005B2E] h-8 w-8 p-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(r.id)}
                        className="text-red-600 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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
              {editing ? 'Editar' : 'Nova'} Conta
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Código</Label>
              <Input
                value={String(form.code || '')}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nome *</Label>
              <Input
                value={String(form.name || '')}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Grupo</Label>
              <Select
                value={String(form.grupo || '')}
                onValueChange={(v) => setForm({ ...form, grupo: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Natureza</Label>
              <Select
                value={String(form.natureza || '')}
                onValueChange={(v) => setForm({ ...form, natureza: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Devedora">Devedora</SelectItem>
                  <SelectItem value="Credora">Credora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Conta Superior (Código)</Label>
              <Input
                value={String(form.parent_code || '')}
                onChange={(e) => setForm({ ...form, parent_code: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nível</Label>
              <Input
                type="number"
                value={String(form.nivel || '')}
                onChange={(e) => setForm({ ...form, nivel: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipo da Conta</Label>
              <Input
                value={String(form.tipo_conta || '')}
                onChange={(e) => setForm({ ...form, tipo_conta: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Conta Referencial</Label>
              <Input
                value={String(form.conta_referencial || '')}
                onChange={(e) => setForm({ ...form, conta_referencial: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={!!form.aceita_lancamentos}
                onCheckedChange={(v) => setForm({ ...form, aceita_lancamentos: v })}
                className="data-[state=checked]:bg-[#005B2E]"
              />
              <Label className="text-xs">Aceita Lançamento</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={!!form.exige_centro_custo}
                onCheckedChange={(v) => setForm({ ...form, exige_centro_custo: v })}
                className="data-[state=checked]:bg-[#005B2E]"
              />
              <Label className="text-xs">Exige Centro de Custo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={!!form.exige_projeto}
                onCheckedChange={(v) => setForm({ ...form, exige_projeto: v })}
                className="data-[state=checked]:bg-[#005B2E]"
              />
              <Label className="text-xs">Exige Projeto</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}{' '}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
