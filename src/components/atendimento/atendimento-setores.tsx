import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getSetores, createSetor, updateSetor, deleteSetor } from '@/services/atendimento'
import { getUsers } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canManageSetores } from '@/lib/atendimento-permissions'
import { Plus, Pencil, Trash2, Loader2, Power } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { SetorRecord } from '@/lib/atendimento-types'

export function AtendimentoSetores() {
  const { user } = useAuth()
  const [items, setItems] = useState<SetorRecord[]>([])
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SetorRecord | null>(null)
  const [form, setForm] = useState({ nome: '', gerente_id: '', email: '', active: true })

  const load = async () => {
    try {
      const [s, u] = await Promise.all([getSetores(), getUsers()])
      setItems(s)
      setUsers(u as Record<string, unknown>[])
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('atendimento_setores', () => load())

  const canManage = canManageSetores(user?.role as string)

  const handleNew = () => {
    setEditing(null)
    setForm({ nome: '', gerente_id: '', email: '', active: true })
    setOpen(true)
  }
  const handleEdit = (r: SetorRecord) => {
    setEditing(r)
    setForm({ nome: r.nome, gerente_id: r.gerente_id, email: r.email, active: r.active })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' })
      return
    }
    try {
      const data = {
        nome: form.nome,
        gerente_id: form.gerente_id,
        email: form.email,
        active: form.active,
      }
      if (editing) await updateSetor(editing.id, data)
      else await createSetor(data)
      toast({ title: editing ? 'Atualizado' : 'Criado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleToggle = async (r: SetorRecord) => {
    try {
      await updateSetor(r.id, { active: !r.active })
      load()
    } catch {
      /* noop */
    }
  }
  const handleDelete = async (r: SetorRecord) => {
    try {
      await deleteSetor(r.id)
      toast({ title: 'Excluído' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
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
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} setor(es)</p>
        {canManage && (
          <Button onClick={handleNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
            <Plus className="w-4 h-4 mr-2" /> Novo
          </Button>
        )}
      </div>
      <Card className="border-2 border-[#005B2E]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Nome</th>
                <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Gerente</th>
                <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Email</th>
                <th className="text-left px-3 py-3 font-bold">Ativo</th>
                {canManage && <th className="text-center px-3 py-3 font-bold">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-medium">{r.nome}</td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    {(users.find((u) => u.id === r.gerente_id)?.name as string) || '—'}
                  </td>
                  <td className="px-3 py-2 hidden lg:table-cell">{r.email || '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        r.active !== false
                          ? 'text-xs font-bold text-emerald-600'
                          : 'text-xs font-bold text-gray-500'
                      }
                    >
                      {r.active !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
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
                          onClick={() => handleToggle(r)}
                          className="text-orange-600 h-8 w-8 p-0"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(r)}
                          className="text-red-600 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Novo'} Setor
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Gerente</Label>
              <select
                value={form.gerente_id}
                onChange={(e) => setForm((p) => ({ ...p, gerente_id: e.target.value }))}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:ring-[#005B2E]"
              >
                <option value="">Selecione...</option>
                {users.map((u) => (
                  <option key={u.id as string} value={u.id as string}>
                    {(u.name as string) || (u.email as string)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
                className="data-[state=checked]:bg-[#005B2E]"
              />
              <Label>{form.active ? 'Ativo' : 'Inativo'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
