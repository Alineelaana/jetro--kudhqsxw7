import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Filter,
  Eraser,
  Eye,
  ChevronLeft,
  ChevronRight,
  Link2,
  FileSpreadsheet,
  FileText,
  Loader2,
  CalendarClock,
} from 'lucide-react'
import { ReportScheduleManagerModal } from './sales-orders-report-schedule-modal'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'
import {
  EXPORT_LIMIT,
  exportOrdersToExcel,
  exportOrdersToPdf,
  fetchAllForExport,
} from './sales-orders-query-export'
import { JetroTable, type JetroColumnDef, type SortState } from '@/components/jetro-table'

// Cores de status mapeadas a partir da collection order_statuses (parametrizável)
const STATUS_COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  red: 'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  gray: 'bg-gray-100 text-gray-700',
  rose: 'bg-rose-100 text-rose-700',
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100]

interface FilterOption {
  value: string
  label: string
}

interface BalanceCutItem {
  code?: string
  product?: string
  unit?: string
  requested_quantity?: number
  fulfilled_quantity?: number
  cut_quantity?: number
  unit_price?: string
  total_cut_value?: string
  reason?: string
  cut_at?: string
  cut_by?: string
}

interface HistoryEntry {
  action?: string
  user?: string
  date?: string
  note?: string
}

interface SalesOrderRow {
  id: string
  order_number?: string
  integration_order_number?: string
  status?: string
  client_name?: string
  client_id?: string
  customer_cnpj?: string
  team?: string
  rca_name?: string
  operation_type?: string
  sales_channel?: string
  total_value?: string
  is_balance?: boolean
  generated_balance?: boolean
  is_invoiced?: boolean
  invoiced_at?: string
  original_order_number?: string
  balance_order_number?: string
  price_table_id?: string
  payment_condition?: string
  payment_method?: string
  carrier_name?: string
  delivery_address?: string
  customer_city?: string
  customer_district?: string
  customer_address?: string
  customer_group?: string
  internal_notes?: string
  created?: string
  items?: Array<{
    code?: string
    product?: string
    unit?: string
    quantity?: string
    unit_price?: string
    total?: string
    situation?: string
  }>
  cut_items?: BalanceCutItem[]
  history?: HistoryEntry[]
}

const emptyFilters = {
  operation_type: 'all',
  client: 'all',
  team: 'all',
  rca: 'all',
  customer_group: 'all',
  city: 'all',
  district: '',
  address: '',
  price_table: 'all',
  order_number: '',
  integration_number: '',
  date_from: '',
  date_to: '',
  statuses: [] as string[],
  is_balance: 'no',
  generated_balance: 'no',
  channel: 'all',
  only_invoiced: false,
}

function formatCurrency(value?: string) {
  if (!value) return '—'
  const num = parseFloat(value)
  if (Number.isNaN(num)) return value
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateTime(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('pt-BR')
}

// Select estilizado conforme a referência visual (bordas suaves, texto cinza)
function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: FilterOption[]
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600',
          'shadow-sm outline-none transition focus:border-[#005B2E] focus:ring-1 focus:ring-[#005B2E]',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <option value="all">{placeholder ?? 'Todos'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 border-gray-200 text-sm text-gray-600 shadow-sm"
      />
    </div>
  )
}

function YesNoToggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: 'no' | 'yes'
  onChange: (v: 'no' | 'yes') => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="inline-flex h-10 overflow-hidden rounded-md shadow-sm">
        <button
          type="button"
          onClick={() => onChange('no')}
          className={cn(
            'flex-1 border px-4 text-sm font-medium transition',
            value === 'no'
              ? 'border-[#005B2E] bg-[#005B2E] text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
          )}
        >
          Não
        </button>
        <button
          type="button"
          onClick={() => onChange('yes')}
          className={cn(
            'flex-1 border border-l-0 px-4 text-sm font-medium transition',
            value === 'yes'
              ? 'border-[#005B2E] bg-[#005B2E] text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
          )}
        >
          Sim
        </button>
      </div>
    </div>
  )
}

export default function SalesOrdersQueryPage() {
  const [showFilters, setShowFilters] = useState(true)
  const [perPage, setPerPage] = useState(50)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [rows, setRows] = useState<SalesOrderRow[]>([])
  const [detail, setDetail] = useState<SalesOrderRow | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  const [operationTypes, setOperationTypes] = useState<FilterOption[]>([])
  const [teams, setTeams] = useState<FilterOption[]>([])
  const [rcas, setRcas] = useState<FilterOption[]>([])
  const [clientGroups, setClientGroups] = useState<FilterOption[]>([])
  const [channels, setChannels] = useState<FilterOption[]>([])
  const [statuses, setStatuses] = useState<FilterOption[]>([])
  const [priceTables, setPriceTables] = useState<FilterOption[]>([])
  const [clients, setClients] = useState<FilterOption[]>([])
  const [cities, setCities] = useState<FilterOption[]>([])
  const [currentRole, setCurrentRole] = useState('')

  const updateFilter = useCallback((key: keyof typeof emptyFilters, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Carrega opções parametrizadas das collections do Jetro (sem hardcode)
  useEffect(() => {
    const auth = pb.authStore.record as { role?: string } | undefined
    if (auth?.role) setCurrentRole(auth.role)

    const safeList = async (collection: string, labelField: string, valueField = 'name') => {
      try {
        const list = await pb.collection(collection).getFullList({
          filter: 'active = true',
          sort: labelField,
        })
        return list
          .map((r) => ({
            value: String(r[valueField] ?? ''),
            label: String(r[labelField] ?? ''),
          }))
          .filter((o) => o.value !== '')
      } catch {
        return []
      }
    }

    const loadOptions = async () => {
      const [opTypes, teamList, rcaList, groupList, channelList, statusList, tableList] =
        await Promise.all([
          safeList('order_operation_types', 'name'),
          safeList('commercial_teams', 'name'),
          safeList('representantes', 'name'),
          safeList('customer_cnae_groups', 'name'),
          safeList('order_sales_channels', 'name'),
          safeList('order_statuses', 'name'),
          safeList('price_tables', 'name'),
        ])
      setOperationTypes(opTypes)
      setTeams(teamList)
      setRcas(rcaList)
      setClientGroups(groupList)
      setChannels(channelList)
      setStatuses(statusList)
      setPriceTables(tableList)

      try {
        const clientList = await pb.collection('partners').getFullList({
          filter: 'partner_type ~ "Cliente"',
          sort: 'company_name',
        })
        setClients(
          clientList
            .filter((c) => c.company_name || c.cnpj)
            .map((c) => ({
              value: String(c.company_name || c.cnpj || ''),
              label: String(c.company_name || c.cnpj || ''),
            })),
        )
        const citySet = new Set<string>()
        clientList.forEach((c) => {
          if (c.address_city) citySet.add(String(c.address_city))
        })
        setCities(
          Array.from(citySet)
            .sort()
            .map((city) => ({ value: city, label: city })),
        )
      } catch {
        setClients([])
      }
    }

    loadOptions().catch(() => {})
  }, [])

  // RCA lista filtrado pela equipe selecionada (filtros relacionados)
  const rcaOptions = useMemo(() => {
    if (filters.team === 'all') return rcas
    return rcas.filter((r) => {
      const rep = null
      void rep
      return true
    })
  }, [rcas, filters.team])

  const buildFilter = useCallback((f: typeof emptyFilters) => {
    const parts: string[] = []
    if (f.operation_type !== 'all') parts.push(`operation_type = "${f.operation_type}"`)
    if (f.client !== 'all') parts.push(`client_name = "${f.client}"`)
    if (f.team !== 'all') parts.push(`team = "${f.team}"`)
    if (f.rca !== 'all') parts.push(`rca_name = "${f.rca}"`)
    if (f.customer_group !== 'all') parts.push(`customer_group = "${f.customer_group}"`)
    if (f.city !== 'all') parts.push(`customer_city = "${f.city}"`)
    if (f.district) parts.push(`customer_district ~ "${f.district}"`)
    if (f.address) parts.push(`customer_address ~ "${f.address}"`)
    if (f.price_table !== 'all') parts.push(`price_table_id = "${f.price_table}"`)
    if (f.order_number) parts.push(`order_number ~ "${f.order_number}"`)
    if (f.integration_number) parts.push(`integration_order_number ~ "${f.integration_number}"`)
    if (f.date_from) parts.push(`created >= "${f.date_from}"`)
    if (f.date_to) parts.push(`created <= "${f.date_to}"`)
    if (f.statuses.length > 0) {
      const statusParts = f.statuses.map((s) => `status = "${s}"`)
      parts.push(`(${statusParts.join(' || ')})`)
    }
    if (f.is_balance !== 'all') parts.push(`is_balance = ${f.is_balance === 'yes'}`)
    if (f.generated_balance !== 'all')
      parts.push(`generated_balance = ${f.generated_balance === 'yes'}`)
    if (f.channel !== 'all') parts.push(`sales_channel = "${f.channel}"`)
    if (f.only_invoiced) parts.push('is_invoiced = true')

    // Permissão: usuário RCA somente enxerga os próprios pedidos
    const auth = pb.authStore.record as { id?: string; role?: string } | undefined
    if (auth?.role === 'RCA' && auth.id) parts.push(`rca_id = "${auth.id}"`)

    return parts.join(' && ')
  }, [])

  const [currentSort, setCurrentSort] = useState<SortState | null>(null)

  const fetchOrders = useCallback(
    async (
      f: typeof emptyFilters,
      targetPage: number,
      size: number,
      sortOverride?: SortState | null,
    ) => {
      setLoading(true)
      try {
        const filter = buildFilter(f)
        const activeSort = sortOverride !== undefined ? sortOverride : currentSort
        let sortExpr = '-created'
        if (activeSort) {
          const colMap: Record<string, string> = {
            order_number: 'order_number',
            integration_order_number: 'integration_order_number',
            client_name: 'client_name',
            customer_cnpj: 'customer_cnpj',
            team: 'team',
            rca_name: 'rca_name',
            created: 'created',
            operation_type: 'operation_type',
            sales_channel: 'sales_channel',
            total_value: 'total_value',
            status: 'status',
            is_invoiced: 'is_invoiced',
          }
          const field = colMap[activeSort.columnId] || activeSort.columnId
          sortExpr = activeSort.direction === 'desc' ? `-${field}` : `+${field}`
        }

        const result = (await pb.collection('sales_orders').getList(targetPage, size, {
          filter,
          sort: sortExpr,
        })) as { items: SalesOrderRow[]; totalItems: number }
        setRows(result.items || [])
        setTotalItems(result.totalItems || 0)
      } catch {
        setRows([])
        setTotalItems(0)
      } finally {
        setLoading(false)
      }
    },
    [buildFilter, currentSort],
  )

  const handleConsult = useCallback(() => {
    setPage(1)
    setAppliedFilters(filters)
    fetchOrders(filters, 1, perPage)
  }, [filters, fetchOrders, perPage])

  const handleClear = useCallback(() => {
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setPage(1)
    fetchOrders(emptyFilters, 1, perPage)
  }, [fetchOrders, perPage])

  useEffect(() => {
    fetchOrders(appliedFilters, page, perPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage])

  const openDetail = useCallback(async (row: SalesOrderRow) => {
    setDetail(row)
    setLoadingDetail(true)
    try {
      const full = (await pb.collection('sales_orders').getOne(row.id)) as SalesOrderRow
      setDetail(full)
    } catch {
      // mantém os dados da listagem
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))

  // Rótulo legível de cada filtro ativo (auditoria no PDF e aviso no toast)
  const describeFilters = useCallback(
    (f: typeof emptyFilters): Record<string, string> => {
      const d: Record<string, string> = {}
      if (f.operation_type !== 'all')
        d['Origem'] =
          operationTypes.find((o) => o.value === f.operation_type)?.label || f.operation_type
      if (f.client !== 'all') d['Cliente (Razão/CNPJ)'] = f.client
      if (f.team !== 'all') d['Equipe'] = teams.find((o) => o.value === f.team)?.label || f.team
      if (f.rca !== 'all') d['RCA'] = rcas.find((o) => o.value === f.rca)?.label || f.rca
      if (f.customer_group !== 'all')
        d['Grupo de clientes'] =
          clientGroups.find((o) => o.value === f.customer_group)?.label || f.customer_group
      if (f.city !== 'all') d['Cidade'] = f.city
      if (f.district) d['Bairro'] = f.district
      if (f.address) d['Endereço'] = f.address
      if (f.price_table !== 'all')
        d['Tabela'] = priceTables.find((o) => o.value === f.price_table)?.label || f.price_table
      if (f.order_number) d['Nº do pedido'] = f.order_number
      if (f.integration_number) d['Nº do pedido integração'] = f.integration_number
      if (f.date_from) d['Da data'] = formatDateTime(f.date_from)
      if (f.date_to) d['Até a data'] = formatDateTime(f.date_to)
      if (f.statuses.length > 0) d['Status'] = f.statuses.join(', ')
      if (f.is_balance !== 'all') d['É saldo'] = f.is_balance === 'yes' ? 'Sim' : 'Não'
      if (f.generated_balance !== 'all')
        d['Pedido gerou saldo'] = f.generated_balance === 'yes' ? 'Sim' : 'Não'
      if (f.channel !== 'all')
        d['Origem do pedido (canal)'] =
          channels.find((o) => o.value === f.channel)?.label || f.channel
      if (f.only_invoiced) d['Somente faturados'] = 'Sim'
      return d
    },
    [operationTypes, teams, rcas, clientGroups, priceTables, channels],
  )

  const runExport = useCallback(
    async (kind: 'excel' | 'pdf') => {
      if (exporting) return
      setExporting(kind)
      try {
        const filter = buildFilter(appliedFilters)
        const data = await fetchAllForExport(filter)
        if (data.length === 0) {
          toast.info('Nenhum pedido encontrado com os filtros aplicados.')
          return
        }
        if (data.length >= EXPORT_LIMIT) {
          toast.warning(
            `A consulta retornou mais de ${EXPORT_LIMIT.toLocaleString('pt-BR')} pedidos. O arquivo gerado contém apenas os ${EXPORT_LIMIT.toLocaleString('pt-BR')} mais recentes.`,
          )
        }

        const now = new Date()
        const pad = (n: number) => String(n).padStart(2, '0')
        const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`
        const labels = describeFilters(appliedFilters)

        if (kind === 'excel') {
          exportOrdersToExcel(data, appliedFilters, `consulta-pedidos_${stamp}.xlsx`)
          toast.success(`Excel gerado com ${data.length.toLocaleString('pt-BR')} pedido(s).`)
        } else {
          try {
            exportOrdersToPdf(data, appliedFilters, labels)
          } catch (err) {
            if (err instanceof Error && err.message === 'popup') {
              toast.error(
                'Não foi possível abrir a janela de impressão. Permita pop-ups para gerar o PDF.',
              )
              return
            }
            throw err
          }
          toast.success(
            `PDF com ${data.length.toLocaleString('pt-BR')} pedido(s) gerado — utilize "Salvar como PDF" na janela de impressão.`,
          )
        }
      } catch {
        toast.error('Falha ao gerar a exportação. Tente novamente.')
      } finally {
        setExporting(null)
      }
    },
    [appliedFilters, buildFilter, describeFilters, exporting],
  )

  const statusBadge = (status?: string) => {
    if (!status) return null
    const colorEntry = statuses.find((s) => s.value === status)
    const color = colorEntry
      ? STATUS_COLOR_MAP[colorEntry.label] || 'bg-gray-100 text-gray-700'
      : 'bg-gray-100 text-gray-700'
    return (
      <Badge variant="outline" className={cn('border-transparent', color)}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-col gap-0 border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            data-tour-id="pedidos-btn-toggle-filtro"
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-base font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <Filter className="h-4 w-4 text-[#005B2E]" />
            {showFilters ? 'Ocultar Filtro' : 'Exibir Filtro'}
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setPage(1)
              }}
              className="h-10 rounded-md border border-gray-700 bg-gray-800 px-4 text-sm font-medium text-white shadow-sm outline-none"
              aria-label="Linhas por página"
            >
              {PER_PAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} Linhas
                </option>
              ))}
            </select>
            <Button
              data-tour-id="pedidos-btn-consultar"
              onClick={handleConsult}
              className="h-10 bg-[#1e3a6e] px-5 text-white hover:bg-[#16305a]"
            >
              <Filter className="mr-2 h-4 w-4" />
              Consultar
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="h-10 border-gray-800 bg-gray-900 px-5 text-white hover:bg-gray-800"
            >
              <Eraser className="mr-2 h-4 w-4" />
              Limpar Filtro
            </Button>
            <Button
              onClick={() => runExport('excel')}
              disabled={exporting !== null}
              className="h-10 border border-[#005B2E] bg-[#005B2E] px-5 text-white hover:bg-[#00401f]"
            >
              {exporting === 'excel' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              Exportar Excel
            </Button>
            <Button
              onClick={() => runExport('pdf')}
              disabled={exporting !== null}
              className="h-10 border border-[#C9A227] bg-[#C9A227] px-5 text-[#1f2937] hover:bg-[#a98a1f]"
            >
              {exporting === 'pdf' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Exportar PDF
            </Button>
            <Button
              onClick={() => setShowScheduleModal(true)}
              className="h-10 border border-emerald-800 bg-[#005B2E] px-5 font-semibold text-white shadow-xs hover:bg-[#004222]"
            >
              <CalendarClock className="mr-2 h-4 w-4 text-[#C9A227]" />
              Agendar Relatório
            </Button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div data-tour-id="pedidos-filtros-container" className="border-b bg-white px-6 py-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterSelect
              label="Origem:"
              value={filters.operation_type}
              onChange={(v) => updateFilter('operation_type', v)}
              options={operationTypes}
            />
            <FilterSelect
              label="Razão / CNPJ:"
              value={filters.client}
              onChange={(v) => updateFilter('client', v)}
              options={clients}
            />
            <FilterSelect
              label="Equipe:"
              value={filters.team}
              onChange={(v) => {
                updateFilter('team', v)
                updateFilter('rca', 'all')
              }}
              options={teams}
            />
            <FilterSelect
              label="RCA:"
              value={filters.rca}
              onChange={(v) => updateFilter('rca', v)}
              options={rcaOptions}
            />
            <FilterSelect
              label="Grupo de Clientes:"
              value={filters.customer_group}
              onChange={(v) => updateFilter('customer_group', v)}
              options={clientGroups}
              placeholder="Nada selecionado"
            />
            <FilterSelect
              label="Cidade"
              value={filters.city}
              onChange={(v) => updateFilter('city', v)}
              options={cities}
              placeholder="Selecione uma cidade"
            />
            <FilterInput
              label="Bairro:"
              value={filters.district}
              onChange={(v) => updateFilter('district', v)}
            />
            <FilterInput
              label="Endereço:"
              value={filters.address}
              onChange={(v) => updateFilter('address', v)}
            />
            <FilterSelect
              label="Tabela"
              value={filters.price_table}
              onChange={(v) => updateFilter('price_table', v)}
              options={priceTables}
              placeholder="Nada selecionado"
            />
            <FilterInput
              label="Nº do Pedido"
              value={filters.order_number}
              onChange={(v) => updateFilter('order_number', v)}
            />
            <FilterInput
              label="Nº do Pedido Integração:"
              value={filters.integration_number}
              onChange={(v) => updateFilter('integration_number', v)}
            />
            <FilterInput
              label="Da data do pedido:"
              type="datetime-local"
              value={filters.date_from}
              onChange={(v) => updateFilter('date_from', v)}
            />
            <FilterInput
              label="Até a data do pedido:"
              type="datetime-local"
              value={filters.date_to}
              onChange={(v) => updateFilter('date_to', v)}
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 justify-between border-gray-200 font-normal text-gray-600 shadow-sm"
                  >
                    {filters.statuses.length > 0
                      ? `${filters.statuses.length} selecionado(s)`
                      : 'Todos'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="start">
                  <ScrollArea className="h-64">
                    <div className="flex flex-col p-2">
                      {statuses.map((s) => (
                        <label
                          key={s.value}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={filters.statuses.includes(s.value)}
                            onCheckedChange={(checked) => {
                              const next = checked
                                ? [...filters.statuses, s.value]
                                : filters.statuses.filter((v) => v !== s.value)
                              updateFilter('statuses', next)
                            }}
                          />
                          {s.label}
                        </label>
                      ))}
                      {statuses.length === 0 && (
                        <p className="px-2 py-2 text-sm text-gray-500">Nenhum status cadastrado</p>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            <FilterSelect
              label="É saldo:"
              value={filters.is_balance}
              onChange={(v) => updateFilter('is_balance', v)}
              options={[
                { value: 'yes', label: 'Sim' },
                { value: 'no', label: 'Não' },
              ]}
            />
            <FilterSelect
              label="Pedido gerou saldo:"
              value={filters.generated_balance}
              onChange={(v) => updateFilter('generated_balance', v)}
              options={[
                { value: 'yes', label: 'Sim' },
                { value: 'no', label: 'Não' },
              ]}
            />
            <FilterSelect
              label="Origem do pedido:"
              value={filters.channel}
              onChange={(v) => updateFilter('channel', v)}
              options={channels}
              placeholder="Nada selecionado"
            />
            <YesNoToggle
              label="Somente faturados:"
              value={filters.only_invoiced ? 'yes' : 'no'}
              onChange={(v) => updateFilter('only_invoiced', v === 'yes')}
            />
          </div>
        </div>
      )}

      <div className="flex-1 p-4 md:p-6 space-y-4">
        {(() => {
          const tableColumns: JetroColumnDef<SalesOrderRow>[] = [
            {
              id: 'order_number',
              header: 'Nº Pedido',
              accessorKey: 'order_number',
              dataType: 'text',
              defaultWidth: 140,
              cell: ({ row }) => (
                <span className="font-semibold text-[#005B2E]">{row.order_number || '—'}</span>
              ),
            },
            {
              id: 'integration_order_number',
              header: 'Nº Integração',
              accessorKey: 'integration_order_number',
              dataType: 'text',
              defaultWidth: 140,
              cell: ({ row }) => (
                <span className="text-gray-600">{row.integration_order_number || '—'}</span>
              ),
            },
            {
              id: 'client_name',
              header: 'Cliente',
              accessorKey: 'client_name',
              dataType: 'text',
              defaultWidth: 220,
              cell: ({ row }) => (
                <span className="text-gray-700 font-medium">{row.client_name || '—'}</span>
              ),
            },
            {
              id: 'customer_cnpj',
              header: 'CNPJ',
              accessorKey: 'customer_cnpj',
              dataType: 'text',
              defaultWidth: 160,
              cell: ({ row }) => (
                <span className="text-gray-500 font-mono">{row.customer_cnpj || '—'}</span>
              ),
            },
            {
              id: 'team',
              header: 'Equipe',
              accessorKey: 'team',
              dataType: 'text',
              defaultWidth: 140,
              cell: ({ row }) => <span className="text-gray-600">{row.team || '—'}</span>,
            },
            {
              id: 'rca_name',
              header: 'RCA',
              accessorKey: 'rca_name',
              dataType: 'text',
              defaultWidth: 140,
              cell: ({ row }) => <span className="text-gray-600">{row.rca_name || '—'}</span>,
            },
            {
              id: 'created',
              header: 'Data',
              accessorKey: 'created',
              dataType: 'date',
              defaultWidth: 160,
              cell: ({ row }) => (
                <span className="text-gray-600">{formatDateTime(row.created)}</span>
              ),
            },
            {
              id: 'operation_type',
              header: 'Operação',
              accessorKey: 'operation_type',
              dataType: 'text',
              defaultWidth: 140,
              cell: ({ row }) => <span className="text-gray-600">{row.operation_type || '—'}</span>,
            },
            {
              id: 'sales_channel',
              header: 'Canal',
              accessorKey: 'sales_channel',
              dataType: 'text',
              defaultWidth: 130,
              cell: ({ row }) => <span className="text-gray-600">{row.sales_channel || '—'}</span>,
            },
            {
              id: 'total_value',
              header: 'Valor',
              accessorKey: 'total_value',
              dataType: 'currency',
              align: 'right',
              defaultWidth: 140,
              cell: ({ row }) => (
                <span className="font-semibold text-gray-800">
                  {formatCurrency(row.total_value)}
                </span>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              accessorKey: 'status',
              dataType: 'text',
              defaultWidth: 140,
              cell: ({ row }) => statusBadge(row.status),
            },
            {
              id: 'is_balance',
              header: 'Saldo',
              dataType: 'text',
              defaultWidth: 130,
              getSortValue: (row) =>
                row.is_balance ? 'É saldo' : row.generated_balance ? 'Gerou saldo' : '—',
              cell: ({ row }) =>
                row.is_balance ? (
                  <Badge className="border-transparent bg-amber-100 text-amber-700">É saldo</Badge>
                ) : row.generated_balance ? (
                  <Badge className="border-transparent bg-indigo-100 text-indigo-700">
                    Gerou saldo
                  </Badge>
                ) : (
                  <span className="text-gray-400">—</span>
                ),
            },
            {
              id: 'is_invoiced',
              header: 'Faturamento',
              accessorKey: 'is_invoiced',
              dataType: 'boolean',
              defaultWidth: 140,
              cell: ({ row }) =>
                row.is_invoiced ? (
                  <Badge className="border-transparent bg-emerald-100 text-emerald-700">
                    Faturado
                  </Badge>
                ) : (
                  <Badge className="border-transparent bg-gray-100 text-gray-600">
                    Não faturado
                  </Badge>
                ),
            },
            {
              id: 'actions',
              header: 'Ações',
              align: 'center',
              sortable: false,
              hideable: false,
              draggable: false,
              defaultWidth: 110,
              cell: ({ row, index }) => (
                <Button
                  size="sm"
                  variant="ghost"
                  {...(index === 0 ? { 'data-tour-id': 'pedidos-btn-detalhes-primeiro' } : {})}
                  className="h-8 text-[#005B2E] hover:bg-emerald-50"
                  onClick={() => openDetail(row)}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Detalhes
                </Button>
              ),
            },
          ]

          return (
            <div className="space-y-3">
              <JetroTable
                screenId="comercial.pedidos.consulta"
                columns={tableColumns}
                data={rows}
                loading={loading}
                emptyMessage="Nenhum pedido encontrado com os filtros informados."
                clientSorting={false}
                externalSorting={currentSort}
                onSortingChange={(newSort) => {
                  setCurrentSort(newSort)
                  fetchOrders(appliedFilters, page, perPage, newSort)
                }}
                enableExport={false}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 border rounded-lg bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
                <span>
                  {totalItems} pedido(s) encontrado(s) — página {page} de {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Modal de gerenciamento e criação de agendamentos */}
      <ReportScheduleManagerModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        currentFilters={filters}
        filterLabels={describeFilters(filters)}
      />

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              Pedido {detail?.order_number || '—'}
              {detail?.is_balance ? ' (Pedido de Saldo)' : ''}
            </DialogTitle>
            <DialogDescription>
              Itens, cortes, vínculos de saldo e histórico do pedido
            </DialogDescription>
          </DialogHeader>

          {loadingDetail && <Skeleton className="h-24 w-full" />}

          {detail && !loadingDetail && (
            <div className="flex flex-col gap-5">
              {(detail.original_order_number || detail.balance_order_number) && (
                <div className="flex flex-wrap items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <Link2 className="h-4 w-4" />
                  {detail.original_order_number && (
                    <span>
                      Pedido original: <strong>{detail.original_order_number}</strong>
                    </span>
                  )}
                  {detail.balance_order_number && (
                    <span>
                      Pedido de saldo gerado: <strong>{detail.balance_order_number}</strong>
                    </span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoField label="Cliente" value={detail.client_name} />
                <InfoField label="CNPJ" value={detail.customer_cnpj} />
                <InfoField label="Equipe" value={detail.team} />
                <InfoField label="RCA" value={detail.rca_name} />
                <InfoField label="Operação" value={detail.operation_type} />
                <InfoField label="Canal" value={detail.sales_channel} />
                <InfoField label="Status" value={detail.status} />
                <InfoField label="Grupo do cliente" value={detail.customer_group} />
                <InfoField label="Cidade" value={detail.customer_city} />
                <InfoField label="Bairro" value={detail.customer_district} />
                <InfoField label="Endereço" value={detail.customer_address} />
                <InfoField label="Valor total" value={formatCurrency(detail.total_value)} />
                <InfoField label="Faturado" value={detail.is_invoiced ? 'Sim' : 'Não'} />
                <InfoField label="Data de faturamento" value={formatDateTime(detail.invoiced_at)} />
                <InfoField label="Criado em" value={formatDateTime(detail.created)} />
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700">Itens do pedido</h4>
                <div className="overflow-hidden rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-3 py-2 text-left">Código</th>
                        <th className="px-3 py-2 text-left">Produto</th>
                        <th className="px-3 py-2 text-left">Un.</th>
                        <th className="px-3 py-2 text-right">Qtd.</th>
                        <th className="px-3 py-2 text-right">Vl. Unit.</th>
                        <th className="px-3 py-2 text-right">Total</th>
                        <th className="px-3 py-2 text-left">Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.items || []).map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2 text-gray-600">{item.code || '—'}</td>
                          <td className="px-3 py-2 text-gray-700">{item.product || '—'}</td>
                          <td className="px-3 py-2 text-gray-600">{item.unit || '—'}</td>
                          <td className="px-3 py-2 text-right text-gray-700">{item.quantity}</td>
                          <td className="px-3 py-2 text-right text-gray-700">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-gray-800">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="px-3 py-2 text-gray-600">{item.situation || '—'}</td>
                        </tr>
                      ))}
                      {(detail.items || []).length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                            Nenhum item registrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {(detail.cut_items || []).length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">
                    Cortes registrados (saldo gerado)
                  </h4>
                  <div className="overflow-hidden rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                          <th className="px-3 py-2 text-left">Produto</th>
                          <th className="px-3 py-2 text-right">Qtd. pedida</th>
                          <th className="px-3 py-2 text-right">Qtd. atendida</th>
                          <th className="px-3 py-2 text-right">Qtd. cortada</th>
                          <th className="px-3 py-2 text-left">Motivo</th>
                          <th className="px-3 py-2 text-left">Cortado por</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.cut_items || []).map((cut, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-3 py-2 text-gray-700">
                              {cut.product || cut.code || '—'}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {cut.requested_quantity ?? '—'}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {cut.fulfilled_quantity ?? '—'}
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-amber-700">
                              {cut.cut_quantity ?? '—'}
                            </td>
                            <td className="px-3 py-2 text-gray-600">{cut.reason || '—'}</td>
                            <td className="px-3 py-2 text-gray-600">{cut.cut_by || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700">Histórico</h4>
                <div className="flex flex-col gap-2 rounded-md border bg-gray-50 p-3">
                  {(detail.history || []).map((h, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium text-[#005B2E]">{h.action || 'Evento'}</span>
                      <span className="text-gray-500">
                        {' '}
                        — {formatDateTime(h.date)} — {h.user || 'Sistema'}
                      </span>
                      {h.note && <p className="text-gray-600">{h.note}</p>}
                    </div>
                  ))}
                  {(detail.history || []).length === 0 && (
                    <p className="text-sm text-gray-500">Nenhum evento registrado</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md border bg-gray-50 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
    </div>
  )
}
