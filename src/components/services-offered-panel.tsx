import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { getServiceAreas, type ServiceArea } from '@/services/service-areas'
import { useRealtime } from '@/hooks/use-realtime'
import { ServiceFormDialog } from '@/components/service-form-dialog'
import { ServicesValueReport } from '@/components/services-value-report'
import { exportServicesExcel, exportServicesPdf } from '@/lib/services-export'
import { type ServiceOffered } from '@/lib/service-types'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  Loader2,
  Package,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ConfirmState {
  type: 'delete' | 'activate' | 'inactivate'
  service: ServiceOffered
}

function parseBR(v: string): number {
  if (!v) return 0
  const s = v.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.')
  return parseFloat(s) || 0
}

export function ServicesOfferedPanel() {
  const [services, setServices] = useState<ServiceOffered[]>([])
  const [areas, setAreas] = useState<ServiceArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [areaFilter, setAreaFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceOffered | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getServicesOffered()
      setServices(Array.isArray(data) ? (data as unknown as ServiceOffered[]) : [])
    } catch {
      setError('Não foi possível carregar os serviços.')
      setServices([])
    }
    setLoading(false)
  }

  const loadAreas = async () => {
    try {
      setAreas(await getServiceAreas())
    } catch {
      /* noop */
    }
  }

  useEffect(() => {
    load()
    loadAreas()
  }, [])
  useRealtime('services_offered', () => load())
  useRealtime('service_areas', () => loadAreas())

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    const list = (services || []).filter(Boolean)
    return list.filter((s) => {
      const matchText =
        !term ||
        s?.name?.toLowerCase()?.includes(term) ||
        s?.service_code?.toLowerCase()?.includes(term) ||
        s?.professional_name?.toLowerCase()?.includes(term)
      const matchArea = areaFilter === 'all' || s?.service_area === areaFilter
      return matchText && matchArea
    })
  }, [services, search, areaFilter])

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
      toast({ title: e?.response?.message || e?.message || 'Erro.', variant: 'destructive' })
    }
    setActionLoading(false)
    setConfirm(null)
  }

  const isEmpty = !loading && !error && (services || []).length === 0
  const confirmTitle =
    confirm?.type === 'delete'
      ? 'Excluir Serviço'
      : confirm?.type === 'activate'
        ? 'Ativar Serviço'
        : 'Inativar Serviço'
  const confirmDesc =
    confirm?.type === 'delete'
      ? `Excluir "${confirm.service.name}"? Esta ação não pode ser desfeita.`
      : confirm?.type === 'activate'
        ? `Ativar "${confirm.service.name}"?`
        : `Inativar "${confirm.service.name}"? Serviços inativos não aparecerão em novos orçamentos.`

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-black text-foreground">Serviços Prestados</h2>
        <div className="flex flex-wrap gap-2">
          {filtered.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportServicesExcel(filtered)}
                className="border-[#005B2E] text-[#005B2E]"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportServicesPdf(filtered)}
                className="border-[#005B2E] text-[#005B2E]"
              >
                <FileText className="w-4 h-4 mr-1.5" /> PDF
              </Button>
            </>
          )}
          <Button
            onClick={handleNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Cadastro
          </Button>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="w-16 h-16 text-[#005B2E]/30 mb-6" />
          <p className="text-lg font-bold text-foreground mb-6">Nenhum serviço cadastrado</p>
          <Button
            onClick={handleNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-base h-14 px-8 rounded-xl shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" /> Cadastrar serviço
          </Button>
        </div>
      ) : (
        <>
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nome, código ou profissional..."
                    className="pl-10 focus-visible:ring-[#005B2E]"
                  />
                </div>
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="w-full sm:w-56 focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Filtrar por área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as áreas</SelectItem>
                    {areas.map((a) => (
                      <SelectItem key={a.id} value={a.name}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                {filtered.length} serviço(s) encontrado(s)
              </p>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
            </div>
          ) : error ? (
            <Card className="border-2 border-dashed border-destructive/30">
              <CardContent className="py-16 text-center">
                <Package className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-lg font-bold mb-1">{error}</p>
                <Button
                  onClick={load}
                  variant="outline"
                  className="mt-3 border-[#005B2E] text-[#005B2E]"
                >
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="border-2 border-dashed border-border">
              <CardContent className="py-16 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-bold mb-1">Nenhum serviço encontrado.</p>
                <p className="text-sm text-muted-foreground">
                  Ajuste a busca ou cadastre um novo serviço.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#01361D] text-white">
                        <th className="text-left px-4 py-3 font-bold hidden md:table-cell">
                          Código
                        </th>
                        <th className="text-left px-4 py-3 font-bold">Nome</th>
                        <th className="text-left px-4 py-3 font-bold hidden lg:table-cell">Área</th>
                        <th className="text-left px-4 py-3 font-bold hidden lg:table-cell">
                          Profissional
                        </th>
                        <th className="text-left px-4 py-3 font-bold hidden sm:table-cell">
                          Valor
                        </th>
                        <th className="text-left px-4 py-3 font-bold">Status</th>
                        <th className="text-center px-4 py-3 font-bold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => {
                        const total = parseBR(s.value) + parseBR(s.tax_value || '')
                        return (
                          <tr
                            key={s.id}
                            className="border-b border-border hover:bg-[#005B2E]/5 transition-colors"
                          >
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className="text-xs font-mono font-bold text-[#C89B3C]">
                                {s.service_code || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {s.name}
                              {s.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {s.description}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              {s.service_area || '—'}
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              {s.professional_name || '—'}
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              {s.value ? `R$ ${s.value}` : '—'}
                              {s.tax_value && (
                                <span className="text-xs text-muted-foreground block">
                                  Imposto: R$ {s.tax_value}
                                </span>
                              )}
                              <span className="text-xs text-[#005B2E] font-semibold block">
                                Total: R$ {total.toFixed(2).replace('.', ',')}
                              </span>
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
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
              <ServicesValueReport services={services} />
            </>
          )}
        </>
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
