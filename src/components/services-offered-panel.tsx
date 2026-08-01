import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  getServicesOffered,
  deleteServiceOffered,
  toggleServiceOfferedActive,
} from '@/services/services-offered'
import { useRealtime } from '@/hooks/use-realtime'
import { ServiceFormDialog } from '@/components/service-form-dialog'
import { type ServiceOffered } from '@/lib/service-types'
import { Plus, Search, Pencil, Trash2, Power, Loader2, Package } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ConfirmState {
  type: 'delete' | 'activate' | 'inactivate'
  service: ServiceOffered
}

export function ServicesOfferedPanel() {
  const [services, setServices] = useState<ServiceOffered[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceOffered | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const load = async () => {
    try {
      const data = await getServicesOffered()
      setServices(Array.isArray(data) ? (data as unknown as ServiceOffered[]) : [])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('services_offered', () => load())

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    const list = services || []
    if (!term) return list
    return list.filter((s) => s?.name?.toLowerCase()?.includes(term))
  }, [services, search])

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const handleEdit = (s: ServiceOffered) => {
    setEditing(s)
    setFormOpen(true)
  }

  const handleConfirm = async () => {
    if (!confirm) return
    setActionLoading(true)
    try {
      if (confirm.type === 'delete') {
        await deleteServiceOffered(confirm.service.id)
        toast({ title: 'Serviço excluído' })
      } else {
        const active = confirm.type === 'activate'
        await toggleServiceOfferedActive(confirm.service.id, active)
        toast({ title: active ? 'Serviço ativado' : 'Serviço inativado' })
      }
      load()
    } catch (err: unknown) {
      const e = err as { response?: { message?: string }; message?: string }
      const msg = e?.response?.message || e?.message || 'Erro ao executar ação.'
      toast({ title: msg, variant: 'destructive' })
    }
    setActionLoading(false)
    setConfirm(null)
  }

  const confirmTitle =
    confirm?.type === 'delete'
      ? 'Excluir Serviço'
      : confirm?.type === 'activate'
        ? 'Ativar Serviço'
        : 'Inativar Serviço'
  const confirmDesc =
    confirm?.type === 'delete'
      ? `Tem certeza que deseja excluir "${confirm.service.name}"? Esta ação não pode ser desfeita.`
      : confirm?.type === 'activate'
        ? `Tem certeza que deseja ativar "${confirm.service.name}"?`
        : `Tem certeza que deseja inativar "${confirm.service.name}"? Serviços inativos não aparecerão em novos orçamentos.`

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-black text-foreground">Serviços Prestados</h2>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Cadastro
        </Button>
      </div>

      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome do serviço..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {filtered.length} serviço(s) encontrado(s)
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold text-foreground mb-1">Nenhum serviço cadastrado.</p>
            <p className="text-sm text-muted-foreground">
              Clique em "Novo Cadastro" para registrar o primeiro serviço.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-4 py-3 font-bold">Nome do serviço</th>
                <th className="text-left px-4 py-3 font-bold hidden sm:table-cell">Valor</th>
                <th className="text-left px-4 py-3 font-bold">Status</th>
                <th className="text-center px-4 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border hover:bg-[#005B2E]/5 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    {s.name}
                    {s.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {s.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {s.value ? `R$ ${s.value}` : '—'}
                    {s.max_discount > 0 && (
                      <span className="text-xs text-muted-foreground block">
                        Desc. máx: {s.max_discount}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        s.active !== false
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.active !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(s)}
                        className="text-[#005B2E] hover:bg-[#005B2E]/10"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      {s.active !== false ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirm({ type: 'inactivate', service: s })}
                          className="text-orange-600 hover:bg-orange-50"
                          title="Inativar"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirm({ type: 'activate', service: s })}
                          className="text-emerald-600 hover:bg-emerald-50"
                          title="Ativar"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirm({ type: 'delete', service: s })}
                        className="text-red-600 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <ServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        service={editing}
        onSuccess={load}
      />

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={actionLoading}
              className="bg-[#005B2E] hover:bg-[#01361D]"
            >
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
