import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Search,
  User,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  decideDivergence,
  listDivergences,
  listDecisions,
  listReleaseRequests,
  type CommercialReleaseDecision,
  type CommercialReleaseDivergence,
  type CommercialReleaseRequest,
} from '@/services/commercial-approvals'
import { exportReleaseReportToExcel } from '@/services/commercial-approvals-report'

type TabKey = 'pendente' | 'aprovada' | 'recusada' | 'todas'

const TAB_LABELS: Record<TabKey, string> = {
  pendente: 'Pendentes',
  aprovada: 'Aprovadas',
  recusada: 'Recusadas',
  todas: 'Todas',
}

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Aguardando liberação',
  aprovada: 'Aprovada',
  recusada: 'Recusada',
  cancelada: 'Cancelada',
  aplicada: 'Aplicada',
}

function fmtValue(value: number | undefined | null, unit?: string): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  const n = Number(value)
  if (unit === 'percent') return `${n.toFixed(2)}%`
  if (unit === 'real') return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 4 })
}

function fmtDateTime(value?: string | null): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('pt-BR')
  } catch {
    return value
  }
}

export function CommercialReleasesScreen() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast: uiToast } = useToast()

  const [tab, setTab] = useState<TabKey>('pendente')
  const [search, setSearch] = useState('')
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')
  const [rcaName, setRcaName] = useState('')
  const [responsavelId, setResponsavelId] = useState('')
  const [ruleType, setRuleType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [requests, setRequests] = useState<CommercialReleaseRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [divergences, setDivergences] = useState<Record<string, CommercialReleaseDivergence[]>>({})
  const [decisions, setDecisions] = useState<Record<string, CommercialReleaseDecision[]>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [deciding, setDeciding] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<CommercialReleaseDivergence | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [reporting, setReporting] = useState(false)

  // Deep-link via sino: ?request=<id> abre a liberação diretamente
  useEffect(() => {
    const reqId = searchParams.get('request')
    if (reqId) {
      setSelectedId(reqId)
    }
  }, [searchParams])

  const filters = useMemo(
    () => ({
      status: tab === 'todas' ? undefined : (tab as CommercialReleaseRequest['status']),
      search,
      empresaId,
      filialId,
      rcaName,
      responsavelId,
      ruleType,
      dateFrom,
      dateTo,
    }),
    [tab, search, empresaId, filialId, rcaName, responsavelId, ruleType, dateFrom, dateTo],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listReleaseRequests(filters)
      setRequests(data)
      // carrega divergências de todas as solicitações visíveis (para relatório)
      const divs: Record<string, CommercialReleaseDivergence[]> = {}
      const dec: Record<string, CommercialReleaseDecision[]> = {}
      for (const r of data) {
        try {
          divs[r.id] = await listDivergences(r.id)
        } catch {
          divs[r.id] = []
        }
        try {
          dec[r.id] = await listDecisions(r.id)
        } catch {
          dec[r.id] = []
        }
      }
      setDivergences(divs)
      setDecisions(dec)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar liberações comerciais')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  useEffect(() => {
    load()
  }, [load])

  const counts = useMemo(() => {
    const c = { pendente: 0, aprovada: 0, recusada: 0 }
    for (const r of requests) {
      if (r.status in c) c[r.status as keyof typeof c]++
    }
    return c
  }, [requests])

  const pendingDivergencesOf = useCallback(
    (requestId: string) =>
      (divergences[requestId] || []).filter((d) => d.status === 'pendente').length,
    [divergences],
  )

  const handleDecision = async (
    divergence: CommercialReleaseDivergence,
    decision: 'aplicada' | 'recusada',
    reason = '',
  ) => {
    setDeciding(divergence.id)
    try {
      await decideDivergence({ divergenceId: divergence.id, decision, reason })
      toast.success(
        decision === 'aplicada'
          ? 'Divergência aplicada: condição solicitada aprovada'
          : 'Divergência recusada — pedido segue bloqueado para o RCA ajustar e reenviar',
      )
      await load()
    } catch (err: unknown) {
      const message =
        (err as { response?: { message?: string } })?.response?.message ||
        (err instanceof Error ? err.message : '')
      if (message.includes('409') || message.includes('já decidida')) {
        toast.warning('Essa divergência já foi analisada por outro usuário — tela atualizada')
      } else {
        toast.error(message || 'Erro ao registrar a decisão')
      }
      await load()
    } finally {
      setDeciding(null)
    }
  }

  const confirmReject = async () => {
    if (!rejectTarget) return
    if (!rejectReason.trim()) {
      toast.error('Informe o motivo da recusa')
      return
    }
    await handleDecision(rejectTarget, 'recusada', rejectReason.trim())
    setRejectTarget(null)
    setRejectReason('')
  }

  const handleReport = async () => {
    setReporting(true)
    try {
      // relatório considera TODOS os registros dos filtros, inclusive outras páginas
      const all = await listReleaseRequests({ ...filters, status: 'todas' })
      const divs: Record<string, CommercialReleaseDivergence[]> = {}
      for (const r of all) {
        try {
          divs[r.id] = await listDivergences(r.id)
        } catch {
          divs[r.id] = []
        }
      }
      const res = exportReleaseReportToExcel(
        { requests: all, divergencesByRequest: divs },
        { ...filters, status: tab === 'todas' ? undefined : tab },
      )
      uiToast({
        title: 'Relatório gerado',
        description: `${res.totalPedidos} pedidos / ${res.totalDivergencias} divergências — ${res.fileName}`,
      })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao gerar o relatório')
    } finally {
      setReporting(false)
    }
  }

  const openClientSheet = (request: CommercialReleaseRequest) => {
    // preserva os filtros atuais na URL de retorno
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, String(v))
    })
    if (selectedId) params.set('request', selectedId)
    navigate(
      `/admin/comercial/clientes?cliente=${request.client_id}&retorno=liberacoes&${params.toString()}`,
    )
  }

  const selected = selectedId ? requests.find((r) => r.id === selectedId) : null

  const renderDivergenceLine = (
    divergence: CommercialReleaseDivergence,
    request: CommercialReleaseRequest,
  ) => {
    const isOpen = !!expanded[divergence.id]
    return (
      <div key={divergence.id} className="border rounded-md mb-2 bg-white dark:bg-card">
        <div className="grid grid-cols-[36px_1fr_120px_120px_150px_110px_140px] md:grid-cols-[36px_1fr_120px_120px_150px_110px_140px_auto] gap-2 items-center px-2 py-2 text-sm">
          <button
            type="button"
            aria-label={isOpen ? 'Recolher detalhes' : 'Expandir detalhes'}
            aria-expanded={isOpen}
            onClick={() => setExpanded((s) => ({ ...s, [divergence.id]: !s[divergence.id] }))}
            className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-700"
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <span className="font-medium truncate">
            {divergence.rule_description || 'Divergência comercial'}
          </span>
          <span className="text-right tabular-nums">
            {fmtValue(divergence.limit_value, divergence.limit_unit)}
          </span>
          <span className="text-right tabular-nums">
            {fmtValue(divergence.requested_value, divergence.requested_unit)}
          </span>
          <span className="truncate">{divergence.vendor_name || request.rca_name || '—'}</span>
          <Badge
            variant={
              divergence.status === 'pendente'
                ? 'secondary'
                : divergence.status === 'aplicada'
                  ? 'default'
                  : 'destructive'
            }
          >
            {STATUS_LABEL[divergence.status] || divergence.status}
          </Badge>
          <span className="truncate text-muted-foreground">{divergence.decided_by || '—'}</span>
          <div className="flex items-center gap-2 justify-end">
            {divergence.status === 'pendente' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={deciding === divergence.id}
                  onClick={() => handleDecision(divergence, 'aplicada')}
                  className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                >
                  {deciding === divergence.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span className="ml-1">Aplicar</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={deciding === divergence.id}
                  onClick={() => {
                    setRejectTarget(divergence)
                    setRejectReason('')
                  }}
                  className="border-red-600 text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  <span className="ml-1">Recusar</span>
                </Button>
              </>
            )}
          </div>
        </div>
        {isOpen && (
          <div className="border-t px-4 py-3 bg-muted/40 text-sm space-y-1">
            {(divergence.product_code || divergence.product_description) && (
              <p className="font-semibold tracking-wide">
                {[divergence.product_code, divergence.product_description]
                  .filter(Boolean)
                  .join(' - ')}
              </p>
            )}
            {divergence.quantity !== undefined && divergence.quantity !== null && (
              <p>Quantidade: {divergence.quantity.toLocaleString('pt-BR')}</p>
            )}
            {divergence.table_price !== undefined && divergence.table_price !== null && (
              <p>Preço de tabela: {fmtValue(divergence.table_price, 'real')}</p>
            )}
            {divergence.requested_discount !== undefined &&
              divergence.requested_discount !== null && (
                <p>Desconto solicitado: {fmtValue(divergence.requested_discount, 'percent')}</p>
              )}
            {divergence.discount_value !== undefined && divergence.discount_value !== null && (
              <p>Valor com Desconto: {fmtValue(divergence.discount_value, 'real')}</p>
            )}
            {divergence.ipi_value !== undefined && divergence.ipi_value !== null && (
              <p>Valor Ipi: {fmtValue(divergence.ipi_value, 'real')}</p>
            )}
            {divergence.st_value !== undefined && divergence.st_value !== null && (
              <p>Valor ST: {fmtValue(divergence.st_value, 'real')}</p>
            )}
            {divergence.unit_with_taxes !== undefined && divergence.unit_with_taxes !== null && (
              <p>Valor Unitário + Impostos: {fmtValue(divergence.unit_with_taxes, 'real')}</p>
            )}
            {divergence.decision_note && (
              <p className="text-muted-foreground">
                Observação da decisão: {divergence.decision_note}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderDetail = (request: CommercialReleaseRequest) => {
    const divs = divergences[request.id] || []
    const allResolved = divs.length > 0 && divs.every((d) => d.status !== 'pendente')
    const hasRecusa = divs.some((d) => d.status === 'recusada')
    const history = decisions[request.id] || []
    return (
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Liberação do pedido {request.order_number}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {request.client_name} · RCA {request.rca_name || '—'} ·{' '}
              {fmtDateTime(request.order_date || request.created)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => openClientSheet(request)}>
              <User className="h-4 w-4" />
              <span className="ml-1">Ver cliente</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm md:grid-cols-3">
            <p>
              <span className="text-muted-foreground">Tipo de negociação:</span>{' '}
              {request.negotiation_type || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Operação:</span> {request.operation || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Tipo de frete:</span>{' '}
              {request.freight_type || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Solicitante:</span>{' '}
              {request.requester_name || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Responsável pela análise:</span>{' '}
              {request.responsavel_name || '— pendência: atribuir responsável'}
            </p>
            <p>
              <span className="text-muted-foreground">Valor do pedido:</span>{' '}
              {fmtValue(request.order_value, 'real')}
            </p>
          </div>

          {!request.responsavel_id && (
            <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Sem responsável pela análise configurado — pendência para a gestão atribuir.
            </div>
          )}

          {allResolved && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
              <Check className="h-4 w-4 shrink-0" />
              {hasRecusa
                ? 'Todas as divergências analisadas; com recusa, o pedido segue bloqueado para o RCA ajustar e reenviar.'
                : 'Todas as divergências aprovadas — pedido liberado para seguir no fluxo normal.'}
            </div>
          )}

          <div className="hidden md:grid grid-cols-[36px_1fr_120px_120px_150px_110px_140px_auto] gap-2 px-2 text-xs font-medium text-muted-foreground">
            <span />
            <span>Descrição</span>
            <span className="text-right">Valor Limite</span>
            <span className="text-right">Valor Solicitado</span>
            <span>Vendedor</span>
            <span>Status</span>
            <span>Analisado Por</span>
            <span />
          </div>
          {divs.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma divergência registrada.</p>
          )}
          {divs.map((d) => renderDivergenceLine(d, request))}

          {history.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Histórico de decisões</h4>
              <ul className="space-y-1 text-sm">
                {history.map((h) => (
                  <li key={h.id} className="rounded border px-3 py-2">
                    <span
                      className={cn(
                        'font-medium',
                        h.decision === 'aplicada' ? 'text-emerald-700' : 'text-red-700',
                      )}
                    >
                      {h.decision === 'aplicada' ? '✓ Aplicada' : '✕ Recusada'}
                    </span>{' '}
                    — {h.rule_description} · limite {fmtValue(h.limit_value)} · solicitado{' '}
                    {fmtValue(h.requested_value)} · {fmtDateTime(h.created)} · por {h.decided_by}
                    {h.reason && (
                      <span className="text-muted-foreground"> · Motivo: {h.reason}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderMobileRow = (request: CommercialReleaseRequest) => {
    const pendentes = pendingDivergencesOf(request.id)
    return (
      <div className="md:hidden rounded-md border p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">Pedido {request.order_number}</span>
          <Badge
            variant={
              request.status === 'pendente'
                ? 'secondary'
                : request.status === 'aprovada'
                  ? 'default'
                  : 'destructive'
            }
          >
            {STATUS_LABEL[request.status] || request.status}
          </Badge>
        </div>
        <p className="text-sm truncate">{request.client_name}</p>
        <p className="text-sm tabular-nums">{fmtValue(request.order_value, 'real')}</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setSelectedId(request.id)}>
            <Eye className="h-4 w-4" />
            <span className="ml-1">Ver liberação</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedId(request.id)}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="ml-1">Mais ações</span>
          </Button>
          {pendentes > 0 && <Badge variant="secondary">{pendentes} pendente(s)</Badge>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Liberações comerciais</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
            <Filter className="h-4 w-4" />
            <span className="ml-1">Filtros</span>
          </Button>
          <Button onClick={handleReport} disabled={reporting}>
            {reporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="ml-1">Gerar relatório</span>
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList>
          {(Object.keys(TAB_LABELS) as TabKey[]).map((k) => (
            <TabsTrigger key={k} value={k}>
              {TAB_LABELS[k]}
              {k !== 'todas' && ` (${counts[k as keyof typeof counts] || 0})`}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por pedido ou cliente"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar por pedido ou cliente"
          />
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="grid gap-3 pt-4 md:grid-cols-3">
            <div>
              <Label htmlFor="f-periodo-de">Período de</Label>
              <Input
                id="f-periodo-de"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="f-periodo-ate">Período até</Label>
              <Input
                id="f-periodo-ate"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="f-status">Status</Label>
              <Select
                value={tab === 'todas' ? 'todas' : tab}
                onValueChange={(v) => setTab(v as TabKey)}
              >
                <SelectTrigger id="f-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="aprovada">Aprovadas</SelectItem>
                  <SelectItem value="recusada">Recusadas</SelectItem>
                  <SelectItem value="todas">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="f-empresa">Empresa/Filial</Label>
              <Input
                id="f-empresa"
                placeholder="Empresa ou filial"
                value={filialId}
                onChange={(e) => setFilialId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="f-rca">RCA</Label>
              <Input
                id="f-rca"
                placeholder="Nome do RCA"
                value={rcaName}
                onChange={(e) => setRcaName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="f-responsavel">Responsável</Label>
              <Input
                id="f-responsavel"
                placeholder="ID do responsável"
                value={responsavelId}
                onChange={(e) => setResponsavelId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="f-divergencia">Tipo de divergência</Label>
              <Select
                value={ruleType || 'todas'}
                onValueChange={(v) => setRuleType(v === 'todas' ? '' : v)}
              >
                <SelectTrigger id="f-divergencia">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="desconto_produto">Desconto máximo produto</SelectItem>
                  <SelectItem value="desconto_pedido">Desconto máximo pedido</SelectItem>
                  <SelectItem value="limite_credito">Limite de crédito</SelectItem>
                  <SelectItem value="prazo_pagamento">Prazo de pagamento</SelectItem>
                  <SelectItem value="quantidade_minima">Quantidade mínima</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando liberações...
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhuma liberação nesta situação. A fila recebe pedidos com divergência comercial
            automaticamente.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                  <th className="p-2">Divergência</th>
                  <th className="p-2">Pedido</th>
                  <th className="p-2 text-right">Valor</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Vendedor/RCA</th>
                  <th className="p-2">Cliente</th>
                  <th className="p-2">Responsável</th>
                  <th className="p-2">Solicitante</th>
                  <th className="p-2">Negociação</th>
                  <th className="p-2">Operação</th>
                  <th className="p-2">Frete</th>
                  <th className="p-2">Data</th>
                  <th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="p-2">
                      {(divergences[r.id] || []).slice(0, 2).map((d) => (
                        <p key={d.id} className="truncate max-w-[180px]">
                          {d.rule_description}
                        </p>
                      ))}
                      {(divergences[r.id] || []).length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{(divergences[r.id] || []).length - 2}
                        </span>
                      )}
                    </td>
                    <td className="p-2 font-medium">{r.order_number}</td>
                    <td className="p-2 text-right tabular-nums">
                      {fmtValue(r.order_value, 'real')}
                    </td>
                    <td className="p-2">
                      <Badge
                        variant={
                          r.status === 'pendente'
                            ? 'secondary'
                            : r.status === 'aprovada'
                              ? 'default'
                              : 'destructive'
                        }
                      >
                        {STATUS_LABEL[r.status] || r.status}
                      </Badge>
                    </td>
                    <td className="p-2 truncate max-w-[140px]">{r.rca_name || '—'}</td>
                    <td className="p-2 truncate max-w-[180px]">{r.client_name}</td>
                    <td className="p-2 truncate max-w-[140px]">{r.responsavel_name || '—'}</td>
                    <td className="p-2 truncate max-w-[140px]">{r.requester_name || '—'}</td>
                    <td className="p-2">{r.negotiation_type || '—'}</td>
                    <td className="p-2">{r.operation || '—'}</td>
                    <td className="p-2">{r.freight_type || '—'}</td>
                    <td className="p-2">{fmtDateTime(r.order_date || r.created)}</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => setSelectedId(r.id)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only sm:inline sm:ml-1">Ver liberação</span>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedId(r.id)}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only sm:inline sm:ml-1">Mais ações</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">{requests.map(renderMobileRow)}</div>
        </>
      )}

      {selected && renderDetail(selected)}

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motivo da recusa</DialogTitle>
            <DialogDescription>
              O pedido permanece bloqueado para o RCA ajustar e reenviar. O histórico da análise é
              preservado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="motivo-recusa">Motivo da recusa *</Label>
            <Textarea
              id="motivo-recusa"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Descreva o motivo da recusa"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectReason.trim()}>
              Confirmar recusa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CommercialReleasesScreen
