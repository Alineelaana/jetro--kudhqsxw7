import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Coins, FileText, Filter, Printer, Wallet } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { AdminBackButton } from '@/components/admin-back-button'
import {
  flexService,
  FLEX_TYPE_LABELS,
  type FlexAccount,
  type FlexMovement,
  type FlexFilters,
} from '@/services/flex'
import {
  exportFlexReportToExcel,
  exportFlexReportToCsv,
  printFlexSummaryPdf,
  printFlexDetailPdf,
} from '@/services/flex-report'

const currency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const typeLabel = (t: string) => FLEX_TYPE_LABELS[t as FlexMovement['type']] ?? t

function statusBadge(status: string) {
  const map: Record<string, string> = {
    concluida: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    pendente: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    falha: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    reservado: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    faturado: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  }
  return map[status] ?? 'bg-muted text-muted-foreground'
}

interface RefOption {
  id: string
  label: string
}

interface PanelRow {
  account: FlexAccount
  indicators: {
    saldoInicial: number
    geradoLiberado: number
    gasto: number
    aguardando: number
    reservado: number
    estornos: number
    disponivel: number
  }
}

export function SaldoFlexScreen() {
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [periodFrom, setPeriodFrom] = useState(searchParams.get('from') ?? '')
  const [periodTo, setPeriodTo] = useState(searchParams.get('to') ?? '')
  const [empresaId, setEmpresaId] = useState(searchParams.get('empresaId') ?? '')
  const [filialId, setFilialId] = useState(searchParams.get('filialId') ?? '')
  const [rcaId, setRcaId] = useState(searchParams.get('rcaId') ?? '')
  const [gerenteId, setGerenteId] = useState(searchParams.get('gerenteId') ?? '')
  const [equipeId, setEquipeId] = useState(searchParams.get('equipeId') ?? '')
  const [clienteId, setClienteId] = useState(searchParams.get('clienteId') ?? '')
  const [produtoId, setProdutoId] = useState(searchParams.get('produtoId') ?? '')
  const [pedido, setPedido] = useState(searchParams.get('pedido') ?? '')
  const [nf, setNf] = useState(searchParams.get('nf') ?? '')
  const [movementType, setMovementType] = useState(searchParams.get('tipo') ?? 'todos')
  const [integrationStatus, setIntegrationStatus] = useState(searchParams.get('status') ?? 'todos')

  const [accounts, setAccounts] = useState<FlexAccount[]>([])
  const [movements, setMovements] = useState<FlexMovement[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<RefOption[]>([])
  const [branches, setBranches] = useState<RefOption[]>([])
  const [rcas, setRcas] = useState<RefOption[]>([])
  const [clientes, setClientes] = useState<RefOption[]>([])
  const [produtos, setProdutos] = useState<RefOption[]>([])
  const [authRole, setAuthRole] = useState('')
  const [authUserId, setAuthUserId] = useState('')

  const [panelTab, setPanelTab] = useState<'consolidado' | 'gerente' | 'rca'>('consolidado')

  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState<FlexAccount | null>(null)
  const [adjustType, setAdjustType] = useState<'acrescimo' | 'decrescimo'>('acrescimo')
  const [adjustValue, setAdjustValue] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [adjustSaving, setAdjustSaving] = useState(false)

  const [reportOpen, setReportOpen] = useState(false)
  const [reportModel, setReportModel] = useState<'resumo' | 'extrato'>('resumo')
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')
  const [reportLoading, setReportLoading] = useState(false)

  const isRca = authRole === 'RCA' || authRole === 'rca'
  const canAdjust = !isRca && authRole !== ''

  const filters: FlexFilters = useMemo(
    () => ({
      dateFrom: periodFrom || undefined,
      dateTo: periodTo || undefined,
      empresaId,
      filialId,
      rcaId: isRca ? authUserId : rcaId,
      gerenteId,
      equipeId,
      clienteId,
      produtoId,
      pedido,
      nf,
      type: movementType === 'todos' ? '' : (movementType as FlexFilters['type']),
      integrationStatus: integrationStatus === 'todos' ? '' : integrationStatus,
    }),
    [
      periodFrom,
      periodTo,
      empresaId,
      filialId,
      rcaId,
      gerenteId,
      equipeId,
      clienteId,
      produtoId,
      pedido,
      nf,
      movementType,
      integrationStatus,
      isRca,
      authUserId,
    ],
  )

  const loadRefData = useCallback(async () => {
    const tryList = async (collection: string, opts: Record<string, unknown>) => {
      try {
        return (await pb.collection(collection).getFullList(opts)) as Array<Record<string, unknown>>
      } catch {
        return [] as Array<Record<string, unknown>>
      }
    }
    try {
      const [empresas, filiais, rcasList, clientesList, produtosList] = await Promise.all([
        tryList('empresas', { sort: '-created' }),
        tryList('filiais', { sort: '-created' }),
        tryList('representantes', { sort: '-created' }),
        tryList('partners', { filter: 'cliente = true', sort: '-created' }),
        tryList('products', { sort: '-created' }),
      ])
      const asOptions = (rows: Array<Record<string, unknown>>, keys: string[]): RefOption[] =>
        rows.map((r) => {
          const found = keys
            .map((k) => r[k])
            .find((v) => typeof v === 'string' && (v as string) !== '')
          return {
            id: String(r.id),
            label: typeof found === 'string' ? found : String(r.id),
          }
        })
      setCompanies(asOptions(empresas, ['marca_nome_exibicao', 'nome_fantasia', 'name', 'nome']))
      setBranches(asOptions(filiais, ['marca_nome_exibicao', 'nome_exibicao', 'name', 'nome']))
      setRcas(asOptions(rcasList, ['name', 'nome']))
      setClientes(asOptions(clientesList, ['company_name', 'trade_name', 'full_name', 'name']))
      setProdutos(asOptions(produtosList, ['name', 'description', 'descricao', 'code']))
    } catch {
      // dados de referência são best-effort
    }
  }, [])

  useEffect(() => {
    void loadRefData()
  }, [loadRefData])

  useEffect(() => {
    const auth = pb.authStore.record as { id?: string; role?: string } | null
    setAuthUserId(auth?.id ?? '')
    setAuthRole(auth?.role ?? '')
  }, [])

  // Hidrata filtros da URL (padrão das demais telas)
  useEffect(() => {
    const params = new URLSearchParams()
    if (periodFrom) params.set('from', periodFrom)
    if (periodTo) params.set('to', periodTo)
    if (empresaId) params.set('empresaId', empresaId)
    if (filialId) params.set('filialId', filialId)
    if (!isRca && rcaId) params.set('rcaId', rcaId)
    if (gerenteId) params.set('gerenteId', gerenteId)
    if (equipeId) params.set('equipeId', equipeId)
    if (clienteId) params.set('clienteId', clienteId)
    if (produtoId) params.set('produtoId', produtoId)
    if (pedido) params.set('pedido', pedido)
    if (nf) params.set('nf', nf)
    if (movementType !== 'todos') params.set('tipo', movementType)
    if (integrationStatus !== 'todos') params.set('status', integrationStatus)
    setSearchParams(params, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    periodFrom,
    periodTo,
    empresaId,
    filialId,
    rcaId,
    gerenteId,
    equipeId,
    clienteId,
    produtoId,
    pedido,
    nf,
    movementType,
    integrationStatus,
    isRca,
  ])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [accs, movs] = await Promise.all([
        flexService.listAccounts({
          empresaId,
          filialId,
          rcaId: filters.rcaId,
        }),
        flexService.listMovements({ ...filters, page, perPage: pageSize }),
      ])
      setAccounts(accs)
      setMovements(movs.items)
      setTotal(movs.total)
    } catch (err) {
      toast({
        title: 'Erro ao carregar Saldo FLEX',
        description: String(err),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [empresaId, filialId, gerenteId, equipeId, filters, page, pageSize, toast])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  const panelRows: PanelRow[] = useMemo(() => {
    const rows = isRca ? accounts.filter((a) => a.rca_id === authUserId) : accounts
    return rows.map((account) => {
      const scope = movements.filter((m) => m.rca_id === account.rca_id)
      let saldoInicial = account.balance - account.reserved
      let gerado = 0
      let gasto = 0
      let aguardando = 0
      let estornos = 0
      let ajustes = 0
      for (const m of scope) {
        const v = Number(m.valor_flex || 0)
        if (m.type === 'credito_gerado' || m.type === 'credito_liberado') {
          gerado += v
          saldoInicial -= v
        } else if (m.type === 'flex_gasto') {
          gasto += v
          saldoInicial += v
        } else if (m.type === 'reserva') {
          aguardando += v
        } else if (m.type === 'estorno') {
          estornos += v
          saldoInicial += v
        } else if (m.type === 'ajuste') {
          ajustes += m.balance_after - m.balance_before
        }
      }
      return {
        account,
        indicators: {
          saldoInicial,
          geradoLiberado: gerado,
          gasto,
          aguardando,
          reservado: account.reserved,
          estornos: estornos + ajustes,
          disponivel: account.balance - account.reserved,
        },
      }
    })
  }, [accounts, movements, isRca, authUserId])

  // Agrupamento por gerente ou equipe (visão "Por gerente/equipe")
  const gerenteGroups = useMemo(() => {
    const groups: Record<string, { label: string; accounts: FlexAccount[]; disponivel: number }> =
      {}
    for (const r of panelRows) {
      const key = r.account.gerente_id || r.account.gerente_name || '—'
      if (!groups[key]) {
        groups[key] = {
          label: r.account.gerente_name || 'Sem gerente',
          accounts: [],
          disponivel: 0,
        }
      }
      groups[key].accounts.push(r.account)
      groups[key].disponivel += r.indicators.disponivel
    }
    return Object.values(groups)
  }, [panelRows])

  const equipeGroups = useMemo(() => {
    const groups: Record<string, { label: string; accounts: FlexAccount[]; disponivel: number }> =
      {}
    for (const r of panelRows) {
      const key = r.account.equipe_id || r.account.equipe_name || '—'
      if (!groups[key]) {
        groups[key] = {
          label: r.account.equipe_name || 'Sem equipe',
          accounts: [],
          disponivel: 0,
        }
      }
      groups[key].accounts.push(r.account)
      groups[key].disponivel += r.indicators.disponivel
    }
    return Object.values(groups)
  }, [panelRows])

  const openAdjust = (account: FlexAccount) => {
    setAdjustTarget(account)
    setAdjustType('acrescimo')
    setAdjustValue('')
    setAdjustReason('')
    setAdjustOpen(true)
  }

  const openStatementFor = (account: FlexAccount) => {
    setRcaId(account.rca_id)
    setPage(1)
  }

  const submitAdjust = async () => {
    if (!adjustTarget) return
    const valor = Number(adjustValue.replace(',', '.'))
    if (!Number.isFinite(valor) || valor <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Informe um valor positivo.',
        variant: 'destructive',
      })
      return
    }
    if (adjustReason.trim() === '') {
      toast({
        title: 'Motivo obrigatório',
        description: 'O ajuste manual exige motivo.',
        variant: 'destructive',
      })
      return
    }
    setAdjustSaving(true)
    try {
      await flexService.adjust({
        empresa_id: adjustTarget.empresa_id,
        filial_id: adjustTarget.filial_id,
        rca_id: adjustTarget.rca_id,
        valor,
        motivo: adjustReason.trim(),
        tipo: adjustType === 'acrescimo' ? 'credito' : 'debito',
      })
      toast({ title: 'Ajuste registrado com saldo antes/depois' })
      setAdjustOpen(false)
      void loadAll()
    } catch (err) {
      toast({
        title: 'Erro no ajuste',
        description: String(err),
        variant: 'destructive',
      })
    } finally {
      setAdjustSaving(false)
    }
  }

  const generateReport = async () => {
    setReportLoading(true)
    try {
      // Todos os registros dos filtros (inclusive de outras páginas)
      const all = await flexService.listAllMovements({
        ...filters,
        dateFrom: undefined,
        dateTo: undefined,
      })
      const fromIso = periodFrom ? periodFrom + 'T00:00:00.000Z' : null
      const toIso = periodTo ? periodTo + 'T23:59:59.999Z' : null
      const movs = all.filter((m) => {
        const t = new Date(m.created).getTime()
        if (fromIso && t < new Date(fromIso).getTime()) return false
        if (toIso && t > new Date(toIso).getTime()) return false
        return true
      })
      const beforePeriod = fromIso
        ? all.filter((m) => new Date(m.created).getTime() < new Date(fromIso).getTime())
        : []
      let rows = movs.length
      if (reportModel === 'resumo') {
        if (reportFormat === 'pdf') {
          rows = printFlexSummaryPdf(movs, filters, beforePeriod)
        } else {
          const res = exportFlexReportToExcel(movs, filters, beforePeriod)
          rows = res.rows
        }
      } else if (reportFormat === 'pdf') {
        rows = printFlexDetailPdf(movs, filters)
      } else if (reportFormat === 'csv') {
        const res = exportFlexReportToCsv(movs)
        rows = res.rows
      } else {
        const res = exportFlexReportToExcel(movs, filters)
        rows = res.rows
      }
      toast({
        title: 'Relatório gerado',
        description: `${rows} linha(s), considerando todos os registros dos filtros.`,
      })
      setReportOpen(false)
    } catch (err) {
      toast({
        title: 'Erro ao gerar relatório',
        description: String(err),
        variant: 'destructive',
      })
    } finally {
      setReportLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-4 p-4 md:p-6">
      <AdminBackButton />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Saldo FLEX</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setReportOpen(true)}>
            <Printer className="mr-2 h-4 w-4" /> Gerar relatório
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Saldo comercial do representante (conta do RCA): venda acima do preço-base gera crédito,
        usável como desconto em item de outro pedido, inclusive de outro cliente elegível.
      </p>

      <Tabs
        value={panelTab}
        onValueChange={(v) => setPanelTab(v as 'consolidado' | 'gerente' | 'rca')}
      >
        <TabsList>
          <TabsTrigger value="consolidado">Consolidado</TabsTrigger>
          <TabsTrigger value="gerente">Por gerente/equipe</TabsTrigger>
          <TabsTrigger value="rca">Por RCA</TabsTrigger>
        </TabsList>
        <TabsContent value="consolidado" className="space-y-3">
          {panelRows.length === 0 && !loading ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma conta FLEX encontrada para os filtros atuais.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {panelRows.map(({ account, indicators }) => (
                <Card key={account.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Coins className="h-4 w-4" />
                      {account.rca_name || account.rca_id}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2 text-sm">
                    <span>Saldo inicial do período</span>
                    <span className="text-right font-medium">
                      {currency(indicators.saldoInicial)}
                    </span>
                    <span>FLEX gerado e liberado</span>
                    <span className="text-right font-medium text-emerald-600">
                      {currency(indicators.geradoLiberado)}
                    </span>
                    <span>FLEX gasto</span>
                    <span className="text-right font-medium text-red-600">
                      {currency(indicators.gasto)}
                    </span>
                    <span>Aguardando faturamento</span>
                    <span className="text-right font-medium">
                      {currency(indicators.aguardando)}
                    </span>
                    <span>Reservado (não faturado)</span>
                    <span className="text-right font-medium text-sky-600">
                      {currency(indicators.reservado)}
                    </span>
                    <span>Estornos/ajustes</span>
                    <span className="text-right font-medium">{currency(indicators.estornos)}</span>
                    <span className="font-semibold">Saldo disponível</span>
                    <span className="text-right font-semibold">
                      {currency(indicators.disponivel)}
                    </span>
                    {canAdjust && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="col-span-2 mt-1"
                        onClick={() => openAdjust(account)}
                      >
                        Ajuste manual
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="gerente" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Contas agrupadas por gerente comercial — clique para ver as da equipe.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {gerenteGroups.map((g) => (
              <Card key={g.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{g.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Saldo disponível do grupo</span>
                    <span className="font-semibold">{currency(g.disponivel)}</span>
                  </div>
                  {g.accounts.map((a) => (
                    <div key={a.id} className="flex justify-between text-muted-foreground">
                      <span>{a.rca_name || a.rca_id}</span>
                      <span>{currency(a.balance - a.reserved)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span>
                      Equipes:{' '}
                      {equipeGroups
                        .filter((e) => e.accounts.some((a) => g.accounts.includes(a)))
                        .map((e) => e.label)
                        .join(', ') || '—'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="rca" className="space-y-3">
          <p className="text-sm text-muted-foreground">Abra o extrato de cada representante.</p>
          <div className="grid gap-2 md:grid-cols-2">
            {panelRows.map(({ account }) => (
              <Button
                key={account.id}
                variant="outline"
                className="justify-between"
                onClick={() => {
                  setRcaId(account.rca_id)
                  setPanelTab('rca')
                }}
              >
                <span>{account.rca_name || account.rca_id}</span>
                <Badge variant="secondary">{currency(account.balance - account.reserved)}</Badge>
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* FILTROS */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="flex-from">De</Label>
            <Input
              id="flex-from"
              type="date"
              value={periodFrom}
              onChange={(e) => setPeriodFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="flex-to">Até</Label>
            <Input
              id="flex-to"
              type="date"
              value={periodTo}
              onChange={(e) => setPeriodTo(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Empresa</Label>
            <Select
              value={empresaId || 'todos'}
              onValueChange={(v) => setEmpresaId(v === 'todos' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {companies.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Filial</Label>
            <Select
              value={filialId || 'todos'}
              onValueChange={(v) => setFilialId(v === 'todos' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {branches.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>RCA</Label>
            <Select
              value={isRca ? 'propria' : rcaId || 'todos'}
              onValueChange={(v) => setRcaId(v === 'todos' ? '' : v)}
              disabled={isRca}
            >
              <SelectTrigger>
                <SelectValue placeholder={isRca ? 'Própria conta' : 'Todos'} />
              </SelectTrigger>
              <SelectContent>
                {isRca ? (
                  <SelectItem value="propria">Própria conta</SelectItem>
                ) : (
                  <SelectItem value="todos">Todos</SelectItem>
                )}
                {rcas.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Cliente (gerado ou usado)</Label>
            <Select
              value={clienteId || 'todos'}
              onValueChange={(v) => setClienteId(v === 'todos' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {clientes.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Produto</Label>
            <Select
              value={produtoId || 'todos'}
              onValueChange={(v) => setProdutoId(v === 'todos' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {produtos.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="flex-pedido">Nº do pedido</Label>
            <Input id="flex-pedido" value={pedido} onChange={(e) => setPedido(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="flex-nf">NF</Label>
            <Input id="flex-nf" value={nf} onChange={(e) => setNf(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Tipo de movimento</Label>
            <Select value={movementType} onValueChange={setMovementType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {(Object.entries(FLEX_TYPE_LABELS) as [FlexMovement['type'], string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Status da integração</Label>
            <Select value={integrationStatus} onValueChange={setIntegrationStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="falha">Falha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* EXTRATO */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" /> Extrato de movimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : movements.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum movimento para os filtros aplicados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-3">Data/hora</th>
                    <th className="py-2 pr-3">Tipo</th>
                    <th className="py-2 pr-3">Cliente</th>
                    <th className="py-2 pr-3">Produto</th>
                    <th className="py-2 pr-3 text-right">Valor FLEX</th>
                    <th className="py-2 pr-3">Pedido FV</th>
                    <th className="py-2 pr-3">Pedido Huram</th>
                    <th className="py-2 pr-3">NF</th>
                    <th className="py-2 pr-3">Situação</th>
                    <th className="py-2 pr-3">Vínculo</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr
                      key={m.id}
                      className={cn(
                        'border-b align-top',
                        m.link_id && 'bg-amber-50/50 dark:bg-amber-950/20',
                      )}
                    >
                      <td className="py-2 pr-3">{new Date(m.created).toLocaleString('pt-BR')}</td>
                      <td className="py-2 pr-3">{typeLabel(m.type)}</td>
                      <td className="py-2 pr-3">{m.cliente_name || m.cliente_id || '—'}</td>
                      <td className="py-2 pr-3">{m.produto_descricao || m.produto_id || '—'}</td>
                      <td className="py-2 pr-3 text-right">{currency(m.valor_flex)}</td>
                      <td className="py-2 pr-3">{m.pedido_fv || '—'}</td>
                      <td className="py-2 pr-3">{m.pedido_huram || '—'}</td>
                      <td className="py-2 pr-3">{m.nf || '—'}</td>
                      <td className="py-2 pr-3">
                        <span
                          className={cn(
                            'inline-block rounded px-2 py-0.5 text-xs',
                            statusBadge(m.integration_status || m.status),
                          )}
                        >
                          {m.integration_status || m.status}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        {m.link_type && m.link_id ? (
                          <Badge variant="outline">{m.link_type}</Badge>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{total} movimento(s)</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <span className="px-2 py-1 text-sm">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIÁLOGO DE AJUSTE MANUAL */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajuste manual de saldo</DialogTitle>
            <DialogDescription>
              Registra valor, data, responsável e saldo antes/depois. O motivo é obrigatório e fica
              no extrato.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select
                value={adjustType}
                onValueChange={(v) => setAdjustType(v as 'acrescimo' | 'decrescimo')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acrescimo">Acréscimo</SelectItem>
                  <SelectItem value="decrescimo">Decréscimo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="adjust-value">Valor (R$)</Label>
              <Input
                id="adjust-value"
                inputMode="decimal"
                value={adjustValue}
                onChange={(e) => setAdjustValue(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="adjust-reason">Motivo</Label>
              <Textarea
                id="adjust-reason"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submitAdjust} disabled={adjustSaving}>
              {adjustSaving ? 'Registrando…' : 'Registrar ajuste'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE RELATÓRIO */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar relatório</DialogTitle>
            <DialogDescription>
              Considera TODOS os registros dos filtros aplicados (inclusive de outras páginas).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Modelo</Label>
              <Select
                value={reportModel}
                onValueChange={(v) => setReportModel(v as 'resumo' | 'extrato')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resumo">Resumo gerencial por RCA/gerente/equipe</SelectItem>
                  <SelectItem value="extrato">Extrato detalhado por movimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Formato</Label>
              <Select
                value={reportFormat}
                onValueChange={(v) => setReportFormat(v as 'pdf' | 'excel' | 'csv')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={generateReport} disabled={reportLoading}>
              {reportLoading ? 'Gerando…' : 'Gerar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
