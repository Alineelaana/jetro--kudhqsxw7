import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRealtime } from '@/hooks/use-realtime'
import {
  canViewExternalQuotations,
  canCreateExternalQuotation,
  canExportExternalQuotation,
} from '@/lib/mk-external-quotations-permissions'
import { EQ_STATUS, EQ_STATUS_COLORS, EQ_PRIORITY } from '@/lib/mk-external-quotations-types'
import { getEqList, deleteEq } from '@/services/mk-external-quotations'
import type { MkExternalQuotation } from '@/lib/mk-external-quotations-types'
import { MkEqForm } from '@/components/trade-marketing/mk-eq-form'
import { MkEqDetail } from '@/components/trade-marketing/mk-eq-detail'
import {
  Loader2,
  Megaphone,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function MkExternalQuotationsPanel() {
  const { isAuthenticated, loading, userRole, user } = useAuth()
  const [quotations, setQuotations] = useState<MkExternalQuotation[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MkExternalQuotation | null>(null)
  const [selected, setSelected] = useState<MkExternalQuotation | null>(null)

  const load = useCallback(async () => {
    try {
      setQuotations(await getEqList())
    } catch {
      setQuotations([])
    }
    setDataLoading(false)
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useRealtime('mk_external_quotations', () => load())

  const kpis = useMemo(() => {
    const open = quotations.filter(
      (q) => !['aprovada', 'rejeitada', 'cancelada', 'encerrada', 'contratada'].includes(q.status),
    )
    const awaitingSuppliers = quotations.filter((q) => q.status === 'aguardando_fornecedores')
    const awaitingApproval = quotations.filter((q) => q.status === 'aguardando_aprovacao')
    const approved = quotations.filter((q) =>
      ['aprovada', 'encaminhada_compras', 'contratada'].includes(q.status),
    )
    const expired = quotations.filter((q) => {
      if (!q.proposal_deadline) return false
      return (
        new Date(q.proposal_deadline) < new Date() &&
        ['aguardando_fornecedores', 'em_preparacao'].includes(q.status)
      )
    })
    let savings = 0
    approved.forEach((q) => {
      const vals = (q.proposals || [])
        .map((p) => parseFloat(p.final_value || '0'))
        .filter((v) => v > 0)
      if (vals.length > 1) savings += Math.max(...vals) - Math.min(...vals)
    })
    return {
      total: quotations.length,
      open: open.length,
      awaitingSuppliers: awaitingSuppliers.length,
      awaitingApproval: awaitingApproval.length,
      approved: approved.length,
      expired: expired.length,
      savings,
    }
  }, [quotations])

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return quotations.filter((q) => {
      const ms =
        !term ||
        q.title?.toLowerCase().includes(term) ||
        q.quotation_number?.toLowerCase().includes(term)
      const mf = statusFilter === 'all' || q.status === statusFilter
      return ms && mf
    })
  }, [quotations, search, statusFilter])

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated || !canViewExternalQuotations(userRole)) return <AdminLogin />

  if (selected)
    return (
      <MkEqDetail
        quotation={selected}
        onBack={() => {
          setSelected(null)
          load()
        }}
      />
    )

  const kpiCards = [
    { label: 'Total', value: kpis.total, icon: FileText, color: 'text-blue-600' },
    { label: 'Em Aberto', value: kpis.open, icon: Clock, color: 'text-orange-600' },
    {
      label: 'Aguard. Fornecedores',
      value: kpis.awaitingSuppliers,
      icon: Megaphone,
      color: 'text-cyan-600',
    },
    {
      label: 'Aguard. Aprovação',
      value: kpis.awaitingApproval,
      icon: AlertTriangle,
      color: 'text-amber-600',
    },
    { label: 'Aprovadas', value: kpis.approved, icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Vencidas', value: kpis.expired, icon: AlertTriangle, color: 'text-red-600' },
    {
      label: 'Economia',
      value: `R$ ${kpis.savings.toFixed(0)}`,
      icon: TrendingUp,
      color: 'text-green-600',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ModulePageHeader
        title="Central de Cotações Externas"
        icon={Megaphone}
        breadcrumbs={[
          { label: 'Admin', to: '/admin' },
          { label: 'Trade & Marketing' },
          { label: 'Cotações Externas' },
        ]}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {kpiCards.map((kpi, i) => (
          <Card key={i} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-3">
              <kpi.icon className={cn('w-5 h-5 mb-1', kpi.color)} />
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-lg font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-bold">Cotações</h3>
        {canCreateExternalQuotation(userRole) && (
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Cotação
          </Button>
        )}
      </div>
      <Card className="border-2 border-[#005B2E]/20 mb-4">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cotações..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {EQ_STATUS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {dataLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma cotação encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Nº</th>
                  <th className="text-left px-3 py-3 font-bold">Título</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">
                    Solicitante
                  </th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">
                    Prazo Proposta
                  </th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">
                    Fornecedores
                  </th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id} className="border-b hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {q.quotation_number || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium">{q.title}</td>
                    <td className="px-3 py-3 hidden md:table-cell">{q.requester || '—'}</td>
                    <td className="px-3 py-3 hidden sm:table-cell text-xs">
                      {q.proposal_deadline || '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-1 rounded',
                          EQ_STATUS_COLORS[q.status] || 'bg-gray-100',
                        )}
                      >
                        {EQ_STATUS.find((s) => s.value === q.status)?.label || q.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell text-xs">
                      {(q.suppliers || []).length}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelected(q)}
                          className="text-[#005B2E] hover:bg-[#005B2E]/10"
                          title="Ver"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {canCreateExternalQuotation(userRole) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditing(q)
                              setFormOpen(true)
                            }}
                            className="text-[#005B2E] hover:bg-[#005B2E]/10"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {userRole === 'SUP' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              try {
                                await deleteEq(q.id)
                                toast.success('Cotação excluída')
                                load()
                              } catch {
                                toast.error('Erro ao excluir')
                              }
                            }}
                            className="text-red-600 hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <MkEqForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={() => {
          setFormOpen(false)
          load()
        }}
        userName={(user?.name as string) || ''}
      />
    </div>
  )
}
