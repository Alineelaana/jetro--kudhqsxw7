/**
 * Registro Declarativo de Telas e Relatórios Agendáveis do Jetro ERP
 *
 * Permite que qualquer tela do sistema com consultas/relatórios se registre com:
 * - Identificação (id, module, name, description, route, collectionName)
 * - Campos de filtro com tipos, opções, dependências e helpers
 * - Resolução de períodos dinâmicos de data (Hoje, Ontem, Últimos 7 dias, Semana anterior, etc.)
 * - Definição de colunas para tabela, prévia e exportação Excel (.xlsx) nativa
 */

export type DynamicDateRangeKey =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_week'
  | 'last_fortnight'
  | 'last_month'
  | 'current_month'
  | 'custom'

export interface DynamicDateRangeOption {
  key: DynamicDateRangeKey
  label: string
  description: string
}

export const DYNAMIC_DATE_RANGES: DynamicDateRangeOption[] = [
  { key: 'today', label: 'Hoje', description: 'Data atual da execução (00:00 às 23:59)' },
  {
    key: 'yesterday',
    label: 'Ontem (Dia anterior)',
    description: 'Dia civil imediatamente anterior',
  },
  { key: 'last_7_days', label: 'Últimos 7 dias', description: 'Últimos 7 dias corridos até hoje' },
  {
    key: 'last_week',
    label: 'Semana anterior',
    description: 'De segunda a domingo da semana passada',
  },
  {
    key: 'last_fortnight',
    label: 'Quinzena anterior',
    description: '1ª à 15ª ou 16ª ao último dia do mês anterior',
  },
  {
    key: 'last_month',
    label: 'Mês anterior',
    description: 'Do dia 1º ao último dia do mês passado',
  },
  {
    key: 'current_month',
    label: 'Mês atual',
    description: 'Do dia 1º deste mês até a data de hoje',
  },
  {
    key: 'custom',
    label: 'Período Fixo / Personalizado',
    description: 'Datas estáticas fixadas no agendamento',
  },
]

/**
 * Calcula as datas de início e fim no fuso horário de Brasília (America/Sao_Paulo)
 */
export function resolveDynamicDateRange(
  range: DynamicDateRangeKey | string | undefined,
  fixedDateFrom?: string,
  fixedDateTo?: string,
  nowDate: Date = new Date(),
): { dateFrom: string; dateTo: string; label: string } {
  // Ajuste para fuso de Brasília (UTC-3)
  const spOffsetMs = -3 * 60 * 60 * 1000
  const spDate = new Date(nowDate.getTime() + spOffsetMs)
  const year = spDate.getUTCFullYear()
  const month = spDate.getUTCMonth() // 0-11
  const day = spDate.getUTCDate() // 1-31

  const pad = (n: number) => String(n).padStart(2, '0')

  const formatYMD = (d: Date) => {
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
  }

  switch (range) {
    case 'today': {
      const todayStr = `${year}-${pad(month + 1)}-${pad(day)}`
      return {
        dateFrom: `${todayStr} 00:00:00`,
        dateTo: `${todayStr} 23:59:59`,
        label: 'Hoje',
      }
    }
    case 'yesterday': {
      const yDate = new Date(spDate.getTime() - 24 * 60 * 60 * 1000)
      const yStr = formatYMD(yDate)
      return {
        dateFrom: `${yStr} 00:00:00`,
        dateTo: `${yStr} 23:59:59`,
        label: 'Ontem',
      }
    }
    case 'last_7_days': {
      const fromD = new Date(spDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      return {
        dateFrom: `${formatYMD(fromD)} 00:00:00`,
        dateTo: `${formatYMD(spDate)} 23:59:59`,
        label: 'Últimos 7 dias',
      }
    }
    case 'last_week': {
      // Semana anterior: segunda a domingo
      const currentDayOfWeek = spDate.getUTCDay() // 0=dom, 1=seg
      const daysSinceLastSunday = currentDayOfWeek === 0 ? 7 : currentDayOfWeek
      const lastSunday = new Date(spDate.getTime() - daysSinceLastSunday * 24 * 60 * 60 * 1000)
      const lastMonday = new Date(lastSunday.getTime() - 6 * 24 * 60 * 60 * 1000)
      return {
        dateFrom: `${formatYMD(lastMonday)} 00:00:00`,
        dateTo: `${formatYMD(lastSunday)} 23:59:59`,
        label: 'Semana anterior',
      }
    }
    case 'last_fortnight': {
      // Se estamos na 2ª quinzena (dia > 15), a quinzena anterior é 1..15 do mês atual
      // Se estamos na 1ª quinzena (dia <= 15), a anterior é 16..fim do mês passado
      if (day > 15) {
        const dFrom = `${year}-${pad(month + 1)}-01 00:00:00`
        const dTo = `${year}-${pad(month + 1)}-15 23:59:59`
        return { dateFrom: dFrom, dateTo: dTo, label: '1ª Quinzena do mês atual' }
      } else {
        const lastMonthDate = new Date(Date.UTC(year, month, 0)) // Último dia do mês anterior
        const lmYear = lastMonthDate.getUTCFullYear()
        const lmMonth = lastMonthDate.getUTCMonth() + 1
        const lmLastDay = lastMonthDate.getUTCDate()
        const dFrom = `${lmYear}-${pad(lmMonth)}-16 00:00:00`
        const dTo = `${lmYear}-${pad(lmMonth)}-${pad(lmLastDay)} 23:59:59`
        return { dateFrom: dFrom, dateTo: dTo, label: '2ª Quinzena do mês anterior' }
      }
    }
    case 'last_month': {
      const prevMonthYear = month === 0 ? year - 1 : year
      const prevMonth = month === 0 ? 12 : month
      const lastDayOfPrevMonth = new Date(Date.UTC(prevMonthYear, prevMonth, 0)).getUTCDate()
      return {
        dateFrom: `${prevMonthYear}-${pad(prevMonth)}-01 00:00:00`,
        dateTo: `${prevMonthYear}-${pad(prevMonth)}-${pad(lastDayOfPrevMonth)} 23:59:59`,
        label: 'Mês anterior',
      }
    }
    case 'current_month': {
      return {
        dateFrom: `${year}-${pad(month + 1)}-01 00:00:00`,
        dateTo: `${formatYMD(spDate)} 23:59:59`,
        label: 'Mês atual',
      }
    }
    case 'custom':
    default: {
      return {
        dateFrom: fixedDateFrom || '',
        dateTo: fixedDateTo || '',
        label: 'Período Fixo',
      }
    }
  }
}

export type FilterFieldType =
  | 'text'
  | 'select'
  | 'multi-select'
  | 'date'
  | 'datetime'
  | 'dynamic-date-range'
  | 'boolean'
  | 'number'

export interface FilterOption {
  value: string
  label: string
}

export interface ReportFilterFieldDef {
  key: string
  label: string
  type: FilterFieldType
  placeholder?: string
  options?: FilterOption[]
  // Carregamento dinâmico de opções do PocketBase
  collectionSource?: {
    collection: string
    valueField: string
    labelField: string
    filter?: string
    sort?: string
  }
  defaultValue?: unknown
  description?: string
  gridSpan?: number // col-span em grid 12 (ex: 3, 4, 6, 12)
}

export interface ReportColumnDef {
  key: string
  label: string
  width?: number // largura estimada no Excel
  align?: 'left' | 'center' | 'right'
  type?: 'text' | 'number' | 'currency' | 'date' | 'boolean'
}

export interface ReportSourceDefinition {
  id: string
  module: string // 'Comercial' | 'Financeiro' | 'Estoque' | 'Logística' | 'Compras' | etc.
  name: string
  description: string
  route: string
  collectionName: string
  defaultSort: string
  dateField: string // campo usado para filtros de período dinâmico (ex: 'created', 'data_vencimento')
  amountField?: string // campo somatório (ex: 'total_value', 'valor_original')
  filters: ReportFilterFieldDef[]
  columns: ReportColumnDef[]
  // Montagem do filtro PocketBase a partir dos filtros preenchidos
  buildFilterString: (
    filters: Record<string, unknown>,
    userRecord?: Record<string, unknown>,
  ) => string
  formatRowValues?: (row: Record<string, unknown>) => Record<string, string>
}

// ============================================================================
// Catálogo de Telas e Relatórios Exportáveis Registrados no Jetro
// ============================================================================

export const REPORT_SOURCES_REGISTRY: Record<string, ReportSourceDefinition> = {
  // 1. Comercial — Consulta de Pedidos (fonte principal já integrada)
  'comercial-consulta-pedidos': {
    id: 'comercial-consulta-pedidos',
    module: 'Comercial',
    name: 'Consulta de Pedidos',
    description: 'Pedidos de vendas detalhados com status, cortes, valores, saldos e faturamento.',
    route: '/admin/vendas/consulta-pedidos',
    collectionName: 'sales_orders',
    defaultSort: '-created',
    dateField: 'created',
    amountField: 'total_value',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período Dinâmico do Pedido',
        type: 'dynamic-date-range',
        defaultValue: 'today',
        gridSpan: 6,
      },
      {
        key: 'date_from',
        label: 'Data inicial fixa (se Período Fixo)',
        type: 'datetime',
        gridSpan: 3,
      },
      {
        key: 'date_to',
        label: 'Data final fixa (se Período Fixo)',
        type: 'datetime',
        gridSpan: 3,
      },
      {
        key: 'statuses',
        label: 'Status do Pedido',
        type: 'multi-select',
        gridSpan: 6,
        options: [
          { value: 'Faturado', label: 'Faturado' },
          { value: 'Aguardando Faturamento', label: 'Aguardando Faturamento' },
          { value: 'Aguardando Separação', label: 'Aguardando Separação' },
          { value: 'Bloqueado', label: 'Bloqueado' },
          { value: 'Restrito', label: 'Restrito' },
          { value: 'Aguardando Aprovação', label: 'Aguardando Aprovação' },
          { value: 'Aguardando Liberação', label: 'Aguardando Liberação' },
          { value: 'Cancelado', label: 'Cancelado' },
          { value: 'Entregue', label: 'Entregue' },
        ],
      },
      {
        key: 'team',
        label: 'Equipe de Vendas',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todas as Equipes' },
          { value: 'Varejo', label: 'Varejo' },
          { value: 'Atacado', label: 'Atacado' },
          { value: 'Distribuição', label: 'Distribuição' },
          { value: 'Contas Especiais', label: 'Contas Especiais' },
          { value: 'Televendas', label: 'Televendas' },
        ],
      },
      {
        key: 'operation_type',
        label: 'Tipo de Operação',
        type: 'select',
        gridSpan: 4,
        options: [
          { value: 'all', label: 'Todos os Tipos' },
          { value: 'Venda Padrão', label: 'Venda Padrão' },
          { value: 'Bonificação', label: 'Bonificação' },
          { value: 'Troca', label: 'Troca' },
          { value: 'Remessa', label: 'Remessa' },
          { value: 'Demonstração', label: 'Demonstração' },
        ],
      },
      {
        key: 'rca',
        label: 'RCA / Vendedor',
        type: 'text',
        placeholder: 'Filtrar por nome do RCA...',
        gridSpan: 4,
      },
      {
        key: 'client',
        label: 'Cliente / Razão / CNPJ',
        type: 'text',
        placeholder: 'Nome fantasia, razão ou CNPJ...',
        gridSpan: 4,
      },
      {
        key: 'channel',
        label: 'Canal de Venda',
        type: 'select',
        gridSpan: 4,
        options: [
          { value: 'all', label: 'Todos os Canais' },
          { value: 'Presencial', label: 'Presencial' },
          { value: 'Telefonia', label: 'Telefonia' },
          { value: 'E-commerce B2B', label: 'E-commerce B2B' },
          { value: 'WhatsApp', label: 'WhatsApp' },
          { value: 'Representante', label: 'Representante' },
        ],
      },
      {
        key: 'is_balance',
        label: 'É Saldo',
        type: 'select',
        gridSpan: 4,
        options: [
          { value: 'all', label: 'Todos' },
          { value: 'yes', label: 'Apenas pedidos de saldo' },
          { value: 'no', label: 'Não' },
        ],
      },
      {
        key: 'only_invoiced',
        label: 'Somente pedidos faturados',
        type: 'boolean',
        gridSpan: 4,
      },
    ],
    columns: [
      { key: 'order_number', label: 'Nº do Pedido', width: 14, type: 'text' },
      { key: 'integration_order_number', label: 'Nº Integração', width: 16, type: 'text' },
      { key: 'client_name', label: 'Cliente', width: 34, type: 'text' },
      { key: 'customer_cnpj', label: 'CNPJ', width: 18, type: 'text' },
      { key: 'team', label: 'Equipe', width: 14, type: 'text' },
      { key: 'rca_name', label: 'RCA', width: 16, type: 'text' },
      { key: 'created', label: 'Data', width: 18, type: 'date' },
      { key: 'operation_type', label: 'Operação', width: 16, type: 'text' },
      { key: 'sales_channel', label: 'Canal', width: 14, type: 'text' },
      { key: 'total_value', label: 'Valor', width: 14, align: 'right', type: 'currency' },
      { key: 'status', label: 'Status', width: 16, type: 'text' },
      { key: 'is_balance', label: 'É Saldo', width: 10, type: 'boolean' },
      { key: 'is_invoiced', label: 'Faturado', width: 10, type: 'boolean' },
    ],
    buildFilterString: (f, userRecord) => {
      const parts: string[] = []
      if (f.operation_type && f.operation_type !== 'all') {
        parts.push(`operation_type = "${f.operation_type}"`)
      }
      if (f.client && f.client !== 'all') {
        parts.push(`client_name ~ "${f.client}" || customer_cnpj ~ "${f.client}"`)
      }
      if (f.team && f.team !== 'all') {
        parts.push(`team = "${f.team}"`)
      }
      if (f.rca && f.rca !== 'all') {
        parts.push(`rca_name ~ "${f.rca}"`)
      }
      if (f.channel && f.channel !== 'all') {
        parts.push(`sales_channel = "${f.channel}"`)
      }
      if (f.is_balance && f.is_balance !== 'all') {
        parts.push(`is_balance = ${f.is_balance === 'yes'}`)
      }
      if (f.only_invoiced) {
        parts.push('is_invoiced = true')
      }
      if (Array.isArray(f.statuses) && f.statuses.length > 0) {
        const sParts = f.statuses.map((s) => `status = "${s}"`)
        parts.push(`(${sParts.join(' || ')})`)
      }

      // Período de datas resolvido
      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'custom',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom) parts.push(`created >= "${resolved.dateFrom}"`)
      if (resolved.dateTo) parts.push(`created <= "${resolved.dateTo}"`)

      // Regra de segurança por papel: RCA vê apenas os próprios pedidos
      if (userRecord && (userRecord.role === 'RCA' || userRecord.role === 'Vendedor')) {
        parts.push(`rca_id = "${userRecord.id}"`)
      }

      return parts.join(' && ')
    },
  },

  // 2. Comercial — Relatório de Vendas (Exemplo prático 1 solicitado pelo usuário)
  'comercial-relatorio-vendas': {
    id: 'comercial-relatorio-vendas',
    module: 'Comercial',
    name: 'Relatório de Vendas',
    description: 'Vendas consolidadas e faturadas por filial, canal, equipe e vendedor.',
    route: '/admin/vendas',
    collectionName: 'sales_orders',
    defaultSort: '-created',
    dateField: 'created',
    amountField: 'total_value',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período das Vendas',
        type: 'dynamic-date-range',
        defaultValue: 'yesterday',
        gridSpan: 6,
      },
      {
        key: 'date_from',
        label: 'Data inicial fixa',
        type: 'datetime',
        gridSpan: 3,
      },
      {
        key: 'date_to',
        label: 'Data final fixa',
        type: 'datetime',
        gridSpan: 3,
      },
      {
        key: 'team',
        label: 'Equipe',
        type: 'select',
        gridSpan: 4,
        options: [
          { value: 'all', label: 'Todas as Equipes' },
          { value: 'Varejo', label: 'Varejo' },
          { value: 'Atacado', label: 'Atacado' },
          { value: 'Distribuição', label: 'Distribuição' },
          { value: 'Contas Especiais', label: 'Contas Especiais' },
        ],
      },
      {
        key: 'statuses',
        label: 'Status da Venda',
        type: 'multi-select',
        gridSpan: 8,
        options: [
          { value: 'Faturado', label: 'Faturado' },
          { value: 'Entregue', label: 'Entregue' },
          { value: 'Aguardando Faturamento', label: 'Aguardando Faturamento' },
        ],
      },
      {
        key: 'only_invoiced',
        label: 'Apenas faturamento concluído (is_invoiced)',
        type: 'boolean',
        defaultValue: true,
        gridSpan: 6,
      },
    ],
    columns: [
      { key: 'order_number', label: 'Nº Pedido', width: 14, type: 'text' },
      { key: 'client_name', label: 'Cliente', width: 32, type: 'text' },
      { key: 'team', label: 'Equipe', width: 14, type: 'text' },
      { key: 'rca_name', label: 'RCA / Vendedor', width: 18, type: 'text' },
      { key: 'created', label: 'Data', width: 18, type: 'date' },
      { key: 'sales_channel', label: 'Canal', width: 14, type: 'text' },
      { key: 'total_value', label: 'Valor da Venda', width: 16, align: 'right', type: 'currency' },
      { key: 'status', label: 'Status', width: 16, type: 'text' },
    ],
    buildFilterString: (f, userRecord) => {
      const parts: string[] = []
      if (f.team && f.team !== 'all') parts.push(`team = "${f.team}"`)
      if (f.only_invoiced) parts.push('is_invoiced = true')
      if (Array.isArray(f.statuses) && f.statuses.length > 0) {
        const sParts = f.statuses.map((s) => `status = "${s}"`)
        parts.push(`(${sParts.join(' || ')})`)
      }

      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'yesterday',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom) parts.push(`created >= "${resolved.dateFrom}"`)
      if (resolved.dateTo) parts.push(`created <= "${resolved.dateTo}"`)

      if (userRecord && (userRecord.role === 'RCA' || userRecord.role === 'Vendedor')) {
        parts.push(`rca_id = "${userRecord.id}"`)
      }

      return parts.join(' && ')
    },
  },

  // 3. Comercial — Desempenho Comercial dos RCAs (Exemplo prático 3 solicitado pelo usuário)
  'comercial-desempenho-rcas': {
    id: 'comercial-desempenho-rcas',
    module: 'Comercial',
    name: 'Desempenho Comercial',
    description:
      'Volume de vendas e desempenho consolidado por RCA, equipe e carteira de clientes.',
    route: '/admin/bi/commercial',
    collectionName: 'sales_orders',
    defaultSort: '-created',
    dateField: 'created',
    amountField: 'total_value',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período de Avaliação',
        type: 'dynamic-date-range',
        defaultValue: 'last_month',
        gridSpan: 6,
      },
      {
        key: 'date_from',
        label: 'Data inicial fixa',
        type: 'datetime',
        gridSpan: 3,
      },
      {
        key: 'date_to',
        label: 'Data final fixa',
        type: 'datetime',
        gridSpan: 3,
      },
      {
        key: 'team',
        label: 'Equipe',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todas as Equipes' },
          { value: 'Varejo', label: 'Varejo' },
          { value: 'Atacado', label: 'Atacado' },
          { value: 'Distribuição', label: 'Distribuição' },
          { value: 'Contas Especiais', label: 'Contas Especiais' },
        ],
      },
      {
        key: 'rca',
        label: 'RCA Específico',
        type: 'text',
        placeholder: 'Deixe em branco para todos os RCAs...',
        gridSpan: 6,
      },
    ],
    columns: [
      { key: 'rca_name', label: 'RCA / Vendedor', width: 22, type: 'text' },
      { key: 'team', label: 'Equipe', width: 16, type: 'text' },
      { key: 'order_number', label: 'Nº Pedido', width: 14, type: 'text' },
      { key: 'client_name', label: 'Cliente', width: 30, type: 'text' },
      { key: 'created', label: 'Data', width: 18, type: 'date' },
      { key: 'total_value', label: 'Valor Faturado', width: 16, align: 'right', type: 'currency' },
      { key: 'status', label: 'Status', width: 16, type: 'text' },
    ],
    buildFilterString: (f, userRecord) => {
      const parts: string[] = ['status != "Cancelado"']
      if (f.team && f.team !== 'all') parts.push(`team = "${f.team}"`)
      if (f.rca && f.rca !== 'all') parts.push(`rca_name ~ "${f.rca}"`)

      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'last_month',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom) parts.push(`created >= "${resolved.dateFrom}"`)
      if (resolved.dateTo) parts.push(`created <= "${resolved.dateTo}"`)

      if (userRecord && (userRecord.role === 'RCA' || userRecord.role === 'Vendedor')) {
        parts.push(`rca_id = "${userRecord.id}"`)
      }

      return parts.join(' && ')
    },
  },

  // 4. Financeiro — Contas a Receber
  'financeiro-contas-receber': {
    id: 'financeiro-contas-receber',
    module: 'Financeiro',
    name: 'Contas a Receber',
    description: 'Títulos em aberto, vencidos e liquidados por cliente, vencimento e carteira.',
    route: '/admin/financeiro/contas-receber',
    collectionName: 'financial_receivables',
    defaultSort: 'data_vencimento',
    dateField: 'data_vencimento',
    amountField: 'valor_atualizado',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período do Vencimento',
        type: 'dynamic-date-range',
        defaultValue: 'current_month',
        gridSpan: 6,
      },
      {
        key: 'date_from',
        label: 'Data inicial fixa',
        type: 'date',
        gridSpan: 3,
      },
      {
        key: 'date_to',
        label: 'Data final fixa',
        type: 'date',
        gridSpan: 3,
      },
      {
        key: 'status',
        label: 'Situação do Título',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos os Status' },
          { value: 'aberto', label: 'Em Aberto' },
          { value: 'vencido', label: 'Vencido' },
          { value: 'recebido', label: 'Recebido / Quitado' },
          { value: 'negociado', label: 'Em Negociação' },
        ],
      },
      {
        key: 'cliente',
        label: 'Cliente',
        type: 'text',
        placeholder: 'Razão social ou CNPJ...',
        gridSpan: 6,
      },
    ],
    columns: [
      { key: 'numero_titulo', label: 'Nº Título', width: 14, type: 'text' },
      { key: 'cliente', label: 'Cliente', width: 32, type: 'text' },
      { key: 'data_emissao', label: 'Emissão', width: 14, type: 'date' },
      { key: 'data_vencimento', label: 'Vencimento', width: 14, type: 'date' },
      {
        key: 'valor_original',
        label: 'Valor Original',
        width: 14,
        align: 'right',
        type: 'currency',
      },
      {
        key: 'valor_atualizado',
        label: 'Valor Atualizado',
        width: 14,
        align: 'right',
        type: 'currency',
      },
      { key: 'forma_recebimento', label: 'Forma', width: 14, type: 'text' },
      { key: 'status', label: 'Status', width: 14, type: 'text' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.status && f.status !== 'all') parts.push(`status = "${f.status}"`)
      if (f.cliente && f.cliente !== 'all') parts.push(`cliente ~ "${f.cliente}"`)

      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'current_month',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom)
        parts.push(`data_vencimento >= "${resolved.dateFrom.substring(0, 10)}"`)
      if (resolved.dateTo) parts.push(`data_vencimento <= "${resolved.dateTo.substring(0, 10)}"`)

      return parts.join(' && ')
    },
  },

  // 5. Financeiro — Contas a Pagar
  'financeiro-contas-pagar': {
    id: 'financeiro-contas-pagar',
    module: 'Financeiro',
    name: 'Contas a Pagar',
    description: 'Compromissos a pagar por fornecedor, vencimento, centro de custo e forma.',
    route: '/admin/financeiro/contas-pagar',
    collectionName: 'financial_payables',
    defaultSort: 'data_vencimento',
    dateField: 'data_vencimento',
    amountField: 'valor_atualizado',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período do Vencimento',
        type: 'dynamic-date-range',
        defaultValue: 'current_month',
        gridSpan: 6,
      },
      {
        key: 'status',
        label: 'Situação',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos os Status' },
          { value: 'aberto', label: 'Em Aberto' },
          { value: 'vencido', label: 'Vencido' },
          { value: 'pago', label: 'Pago' },
        ],
      },
      {
        key: 'fornecedor',
        label: 'Fornecedor',
        type: 'text',
        placeholder: 'Razão social do fornecedor...',
        gridSpan: 12,
      },
    ],
    columns: [
      { key: 'numero_titulo', label: 'Nº Título', width: 14, type: 'text' },
      { key: 'fornecedor', label: 'Fornecedor', width: 32, type: 'text' },
      { key: 'data_vencimento', label: 'Vencimento', width: 14, type: 'date' },
      {
        key: 'valor_original',
        label: 'Valor Original',
        width: 14,
        align: 'right',
        type: 'currency',
      },
      {
        key: 'valor_atualizado',
        label: 'Valor Atualizado',
        width: 14,
        align: 'right',
        type: 'currency',
      },
      { key: 'forma_pagamento', label: 'Forma Pgto', width: 14, type: 'text' },
      { key: 'status', label: 'Status', width: 14, type: 'text' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.status && f.status !== 'all') parts.push(`status = "${f.status}"`)
      if (f.fornecedor && f.fornecedor !== 'all') parts.push(`fornecedor ~ "${f.fornecedor}"`)

      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'current_month',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom)
        parts.push(`data_vencimento >= "${resolved.dateFrom.substring(0, 10)}"`)
      if (resolved.dateTo) parts.push(`data_vencimento <= "${resolved.dateTo.substring(0, 10)}"`)

      return parts.join(' && ')
    },
  },

  // 6. Logística — Entregas e Rastreamento
  'logistica-entregas': {
    id: 'logistica-entregas',
    module: 'Logística',
    name: 'Relatório de Entregas',
    description: 'Acompanhamento operacional de entregas, rotas, transportadoras e ocorrências.',
    route: '/admin/logistica/relatorios',
    collectionName: 'logistics_deliveries',
    defaultSort: '-created',
    dateField: 'created',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período',
        type: 'dynamic-date-range',
        defaultValue: 'today',
        gridSpan: 6,
      },
      {
        key: 'status',
        label: 'Status da Entrega',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos os Status' },
          { value: 'Pendente', label: 'Pendente' },
          { value: 'Em Rota', label: 'Em Rota' },
          { value: 'Entregue', label: 'Entregue' },
          { value: 'Ocorrência', label: 'Com Ocorrência' },
          { value: 'Devolvido', label: 'Devolvido' },
        ],
      },
      {
        key: 'rota',
        label: 'Rota',
        type: 'text',
        placeholder: 'Código ou nome da rota...',
        gridSpan: 6,
      },
      {
        key: 'transportadora',
        label: 'Transportadora',
        type: 'text',
        placeholder: 'Nome da transportadora...',
        gridSpan: 6,
      },
    ],
    columns: [
      { key: 'numero_entrega', label: 'Nº Entrega', width: 14, type: 'text' },
      { key: 'pedido', label: 'Pedido', width: 14, type: 'text' },
      { key: 'cliente', label: 'Cliente', width: 30, type: 'text' },
      { key: 'cidade', label: 'Cidade', width: 18, type: 'text' },
      { key: 'rota', label: 'Rota', width: 16, type: 'text' },
      { key: 'transportadora', label: 'Transportadora', width: 18, type: 'text' },
      { key: 'data_prevista', label: 'Previsão', width: 16, type: 'date' },
      { key: 'status', label: 'Status', width: 14, type: 'text' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.status && f.status !== 'all') parts.push(`status = "${f.status}"`)
      if (f.rota && f.rota !== 'all') parts.push(`rota ~ "${f.rota}"`)
      if (f.transportadora && f.transportadora !== 'all')
        parts.push(`transportadora ~ "${f.transportadora}"`)

      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'today',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom) parts.push(`created >= "${resolved.dateFrom}"`)
      if (resolved.dateTo) parts.push(`created <= "${resolved.dateTo}"`)

      return parts.join(' && ')
    },
  },

  // 7. Estoque — Movimentações de Estoque
  'estoque-movimentacoes': {
    id: 'estoque-movimentacoes',
    module: 'Estoque',
    name: 'Movimentações de Estoque',
    description: 'Histórico de entradas, saídas, transferências, perdas e ajustes de inventário.',
    route: '/admin/estoque/movimentacoes',
    collectionName: 'stock_movements',
    defaultSort: '-created',
    dateField: 'created',
    amountField: 'quantidade',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período do Movimento',
        type: 'dynamic-date-range',
        defaultValue: 'today',
        gridSpan: 6,
      },
      {
        key: 'date_from',
        label: 'Data inicial fixa',
        type: 'datetime',
        gridSpan: 3,
      },
      {
        key: 'date_to',
        label: 'Data final fixa',
        type: 'datetime',
        gridSpan: 3,
      },
      {
        key: 'tipo_movimentacao',
        label: 'Tipo de Movimentação',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos os Tipos' },
          { value: 'Entrada por Compra', label: 'Entrada por Compra' },
          { value: 'Entrada Manual', label: 'Entrada Manual' },
          { value: 'Entrada por Devolução', label: 'Entrada por Devolução' },
          { value: 'Saída por Venda', label: 'Saída por Venda' },
          { value: 'Saída Manual', label: 'Saída Manual' },
          { value: 'Reserva', label: 'Reserva' },
          { value: 'Liberação de Reserva', label: 'Liberação de Reserva' },
          { value: 'Ajuste Positivo', label: 'Ajuste Positivo' },
          { value: 'Ajuste Negativo', label: 'Ajuste Negativo' },
          { value: 'Transferência', label: 'Transferência' },
          { value: 'Perda', label: 'Perda' },
          { value: 'Avaria', label: 'Avaria' },
          { value: 'Vencimento', label: 'Vencimento' },
        ],
      },
      {
        key: 'search',
        label: 'Produto / Lote / Documento',
        type: 'text',
        placeholder: 'Buscar por produto, lote ou documento...',
        gridSpan: 6,
      },
    ],
    columns: [
      { key: 'created', label: 'Data/Hora', width: 18, type: 'date' },
      { key: 'tipo_movimentacao', label: 'Tipo Mov.', width: 18, type: 'text' },
      { key: 'documento_origem', label: 'Documento', width: 16, type: 'text' },
      { key: 'produto_nome', label: 'Produto', width: 30, type: 'text' },
      { key: 'produto_codigo', label: 'Código', width: 14, type: 'text' },
      { key: 'lote', label: 'Lote', width: 14, type: 'text' },
      { key: 'quantidade', label: 'Quantidade', width: 14, align: 'right', type: 'number' },
      { key: 'saldo_anterior', label: 'Saldo Ant.', width: 14, align: 'right', type: 'number' },
      { key: 'saldo_atual', label: 'Saldo Atual', width: 14, align: 'right', type: 'number' },
      { key: 'responsavel', label: 'Responsável', width: 18, type: 'text' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.tipo_movimentacao && f.tipo_movimentacao !== 'all') {
        parts.push(`tipo_movimentacao = "${f.tipo_movimentacao}"`)
      }
      if (f.search && f.search !== 'all') {
        parts.push(
          `(produto_nome ~ "${f.search}" || produto_codigo ~ "${f.search}" || documento_origem ~ "${f.search}" || lote ~ "${f.search}")`,
        )
      }
      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'today',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom) parts.push(`created >= "${resolved.dateFrom}"`)
      if (resolved.dateTo) parts.push(`created <= "${resolved.dateTo}"`)
      return parts.join(' && ')
    },
  },

  // 8. Estoque — Saldo e Posição de Produtos
  'estoque-produtos-saldo': {
    id: 'estoque-produtos-saldo',
    module: 'Estoque',
    name: 'Saldo e Posição de Produtos',
    description:
      'Relatório de inventário com níveis de estoque atual, estoque mínimo, marca e categoria.',
    route: '/admin/produtos',
    collectionName: 'products',
    defaultSort: 'name',
    dateField: 'created',
    amountField: 'stock',
    filters: [
      {
        key: 'category',
        label: 'Categoria',
        type: 'text',
        placeholder: 'Filtrar por categoria...',
        gridSpan: 4,
      },
      {
        key: 'brand',
        label: 'Marca',
        type: 'text',
        placeholder: 'Filtrar por marca...',
        gridSpan: 4,
      },
      {
        key: 'status',
        label: 'Status do Produto',
        type: 'select',
        gridSpan: 4,
        options: [
          { value: 'all', label: 'Todos' },
          { value: 'active', label: 'Apenas Ativos' },
          { value: 'inactive', label: 'Apenas Inativos' },
        ],
      },
      {
        key: 'search',
        label: 'Nome ou Código',
        type: 'text',
        placeholder: 'Buscar por nome, código ou EAN...',
        gridSpan: 12,
      },
    ],
    columns: [
      { key: 'code', label: 'Código', width: 14, type: 'text' },
      { key: 'name', label: 'Produto', width: 34, type: 'text' },
      { key: 'brand', label: 'Marca', width: 16, type: 'text' },
      { key: 'category', label: 'Categoria', width: 16, type: 'text' },
      { key: 'unit', label: 'Unidade', width: 10, type: 'text' },
      { key: 'stock', label: 'Estoque Atual', width: 14, align: 'right', type: 'number' },
      { key: 'min_stock', label: 'Estoque Mín.', width: 14, align: 'right', type: 'number' },
      { key: 'cost_price', label: 'Custo', width: 14, align: 'right', type: 'currency' },
      { key: 'price', label: 'Preço Venda', width: 14, align: 'right', type: 'currency' },
      { key: 'active', label: 'Ativo', width: 10, type: 'boolean' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.status === 'active') parts.push('active = true')
      if (f.status === 'inactive') parts.push('active = false')
      if (f.category && f.category !== 'all') parts.push(`category ~ "${f.category}"`)
      if (f.brand && f.brand !== 'all') parts.push(`brand ~ "${f.brand}"`)
      if (f.search && f.search !== 'all') {
        parts.push(`(name ~ "${f.search}" || code ~ "${f.search}" || ean ~ "${f.search}")`)
      }
      return parts.join(' && ')
    },
  },

  // 9. Estoque — Recebimento WMS
  'estoque-recebimento-wms': {
    id: 'estoque-recebimento-wms',
    module: 'Estoque',
    name: 'Recebimento de Mercadorias (WMS)',
    description:
      'Controle de recebimento físico de cargas, notas fiscais de entrada e conferência.',
    route: '/admin/estoque/recebimento',
    collectionName: 'wms_receipts',
    defaultSort: '-created',
    dateField: 'created',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período',
        type: 'dynamic-date-range',
        defaultValue: 'today',
        gridSpan: 6,
      },
      {
        key: 'status',
        label: 'Status do Recebimento',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos os Status' },
          { value: 'Aguardando', label: 'Aguardando Chegada' },
          { value: 'Em Conferência', label: 'Em Conferência' },
          { value: 'Concluído', label: 'Concluído' },
          { value: 'Com Divergência', label: 'Com Divergência' },
        ],
      },
      {
        key: 'fornecedor',
        label: 'Fornecedor',
        type: 'text',
        placeholder: 'Razão social ou CNPJ...',
        gridSpan: 6,
      },
      {
        key: 'nota_fiscal',
        label: 'Nota Fiscal',
        type: 'text',
        placeholder: 'Número da NF...',
        gridSpan: 6,
      },
    ],
    columns: [
      { key: 'numero_recebimento', label: 'Nº Recebimento', width: 16, type: 'text' },
      { key: 'fornecedor', label: 'Fornecedor', width: 30, type: 'text' },
      { key: 'nota_fiscal', label: 'NF', width: 14, type: 'text' },
      { key: 'data_prevista', label: 'Data Prevista', width: 14, type: 'date' },
      { key: 'data_recebida', label: 'Data Recebida', width: 14, type: 'date' },
      { key: 'status', label: 'Status', width: 16, type: 'text' },
      { key: 'responsavel', label: 'Responsável', width: 18, type: 'text' },
      { key: 'created', label: 'Registro', width: 16, type: 'date' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.status && f.status !== 'all') parts.push(`status = "${f.status}"`)
      if (f.fornecedor && f.fornecedor !== 'all') parts.push(`fornecedor ~ "${f.fornecedor}"`)
      if (f.nota_fiscal && f.nota_fiscal !== 'all') parts.push(`nota_fiscal ~ "${f.nota_fiscal}"`)
      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'today',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom) parts.push(`created >= "${resolved.dateFrom}"`)
      if (resolved.dateTo) parts.push(`created <= "${resolved.dateTo}"`)
      return parts.join(' && ')
    },
  },

  // 10. Fiscal — Emissão e Monitoramento de NF-e
  'fiscal-nfe': {
    id: 'fiscal-nfe',
    module: 'Fiscal',
    name: 'Notas Fiscais Eletrônicas (NF-e)',
    description:
      'Monitor de notas fiscais eletrônicas de saída com status SEFAZ, chave de acesso e valores.',
    route: '/admin/fiscal/nfe',
    collectionName: 'nfe_records',
    defaultSort: '-created',
    dateField: 'created',
    amountField: 'total_value',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período de Emissão',
        type: 'dynamic-date-range',
        defaultValue: 'today',
        gridSpan: 6,
      },
      {
        key: 'date_from',
        label: 'Data inicial fixa',
        type: 'datetime',
        gridSpan: 3,
      },
      {
        key: 'date_to',
        label: 'Data final fixa',
        type: 'datetime',
        gridSpan: 3,
      },
      {
        key: 'status',
        label: 'Status SEFAZ',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos os Status' },
          { value: 'Autorizada', label: 'Autorizada' },
          { value: 'Cancelada', label: 'Cancelada' },
          { value: 'Denegada', label: 'Denegada' },
          { value: 'Rejeitada', label: 'Rejeitada' },
          { value: 'Pendente', label: 'Pendente de Envio' },
        ],
      },
      {
        key: 'client',
        label: 'Cliente / Destinatário',
        type: 'text',
        placeholder: 'Razão social ou CNPJ...',
        gridSpan: 6,
      },
    ],
    columns: [
      { key: 'nfe_number', label: 'Nº NF-e', width: 14, type: 'text' },
      { key: 'client_name', label: 'Destinatário', width: 32, type: 'text' },
      { key: 'client_cnpj', label: 'CNPJ/CPF', width: 18, type: 'text' },
      { key: 'total_value', label: 'Valor Total', width: 16, align: 'right', type: 'currency' },
      { key: 'status', label: 'Status SEFAZ', width: 16, type: 'text' },
      { key: 'chave_acesso', label: 'Chave de Acesso', width: 44, type: 'text' },
      { key: 'created', label: 'Data Emissão', width: 18, type: 'date' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.status && f.status !== 'all') parts.push(`status = "${f.status}"`)
      if (f.client && f.client !== 'all') {
        parts.push(`(client_name ~ "${f.client}" || client_cnpj ~ "${f.client}")`)
      }
      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'today',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom) parts.push(`created >= "${resolved.dateFrom}"`)
      if (resolved.dateTo) parts.push(`created <= "${resolved.dateTo}"`)
      return parts.join(' && ')
    },
  },

  // 11. Fiscal — Conhecimentos de Transporte (CT-e)
  'fiscal-cte': {
    id: 'fiscal-cte',
    module: 'Fiscal',
    name: 'Conhecimentos de Transporte (CT-e)',
    description: 'CT-es emitidos, remetente, destinatário, valor do frete e situação cadastral.',
    route: '/admin/fiscal/cte',
    collectionName: 'cte_records',
    defaultSort: '-created',
    dateField: 'created',
    amountField: 'valor_prestacao',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período de Emissão',
        type: 'dynamic-date-range',
        defaultValue: 'current_month',
        gridSpan: 6,
      },
      {
        key: 'status',
        label: 'Status do CT-e',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos os Status' },
          { value: 'Autorizado', label: 'Autorizado' },
          { value: 'Cancelado', label: 'Cancelado' },
          { value: 'Pendente', label: 'Pendente' },
          { value: 'Rejeitado', label: 'Rejeitado' },
        ],
      },
      {
        key: 'remetente',
        label: 'Remetente',
        type: 'text',
        placeholder: 'Razão social do remetente...',
        gridSpan: 6,
      },
      {
        key: 'destinatario',
        label: 'Destinatário',
        type: 'text',
        placeholder: 'Razão social do destinatário...',
        gridSpan: 6,
      },
    ],
    columns: [
      { key: 'cte_number', label: 'Nº CT-e', width: 14, type: 'text' },
      { key: 'remetente', label: 'Remetente', width: 28, type: 'text' },
      { key: 'destinatario', label: 'Destinatário', width: 28, type: 'text' },
      { key: 'valor_prestacao', label: 'Valor Frete', width: 16, align: 'right', type: 'currency' },
      { key: 'status', label: 'Status', width: 16, type: 'text' },
      { key: 'created', label: 'Emissão', width: 18, type: 'date' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.status && f.status !== 'all') parts.push(`status = "${f.status}"`)
      if (f.remetente && f.remetente !== 'all') parts.push(`remetente ~ "${f.remetente}"`)
      if (f.destinatario && f.destinatario !== 'all')
        parts.push(`destinatario ~ "${f.destinatario}"`)
      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'current_month',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom) parts.push(`created >= "${resolved.dateFrom}"`)
      if (resolved.dateTo) parts.push(`created <= "${resolved.dateTo}"`)
      return parts.join(' && ')
    },
  },

  // 12. Fiscal — Notas Fiscais de Serviço (NFS-e)
  'fiscal-nfse': {
    id: 'fiscal-nfse',
    module: 'Fiscal',
    name: 'Notas Fiscais de Serviço (NFS-e)',
    description:
      'NFS-es emitidas por tomador, serviço prestado, valores retidos e tributação municipal.',
    route: '/admin/fiscal/nfse',
    collectionName: 'nfse_records',
    defaultSort: '-created',
    dateField: 'created',
    amountField: 'valor',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período',
        type: 'dynamic-date-range',
        defaultValue: 'current_month',
        gridSpan: 6,
      },
      {
        key: 'status',
        label: 'Status da NFS-e',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos os Status' },
          { value: 'Autorizada', label: 'Autorizada' },
          { value: 'Cancelada', label: 'Cancelada' },
          { value: 'Pendente', label: 'Pendente' },
        ],
      },
      {
        key: 'tomador',
        label: 'Tomador do Serviço',
        type: 'text',
        placeholder: 'Razão social ou CPF/CNPJ do tomador...',
        gridSpan: 12,
      },
    ],
    columns: [
      { key: 'nfse_number', label: 'Nº NFS-e', width: 14, type: 'text' },
      { key: 'tomador', label: 'Tomador', width: 34, type: 'text' },
      { key: 'valor', label: 'Valor dos Serviços', width: 18, align: 'right', type: 'currency' },
      { key: 'status', label: 'Status', width: 16, type: 'text' },
      { key: 'created', label: 'Emissão', width: 18, type: 'date' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.status && f.status !== 'all') parts.push(`status = "${f.status}"`)
      if (f.tomador && f.tomador !== 'all') parts.push(`tomador ~ "${f.tomador}"`)
      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'current_month',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom) parts.push(`created >= "${resolved.dateFrom}"`)
      if (resolved.dateTo) parts.push(`created <= "${resolved.dateTo}"`)
      return parts.join(' && ')
    },
  },

  // 13. DP & RH — Colaboradores e Quadro de Pessoal
  'rh-colaboradores': {
    id: 'rh-colaboradores',
    module: 'DP & RH',
    name: 'Quadro de Colaboradores (RH)',
    description:
      'Relação de empregados ativos e afastados por departamento, cargo, contrato e admissão.',
    route: '/admin/rh/colaboradores',
    collectionName: 'rh_employees',
    defaultSort: 'nome_completo',
    dateField: 'data_admissao',
    filters: [
      {
        key: 'situacao',
        label: 'Situação Cadastral',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos os Status' },
          { value: 'Ativo', label: 'Ativo' },
          { value: 'Férias', label: 'Em Férias' },
          { value: 'Afastado', label: 'Afastado' },
          { value: 'Desligado', label: 'Desligado' },
        ],
      },
      {
        key: 'departamento',
        label: 'Departamento',
        type: 'text',
        placeholder: 'Filtrar por departamento...',
        gridSpan: 6,
      },
      {
        key: 'cargo',
        label: 'Cargo',
        type: 'text',
        placeholder: 'Filtrar por cargo...',
        gridSpan: 6,
      },
      {
        key: 'tipo_contrato',
        label: 'Tipo de Contrato',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos os Tipos' },
          { value: 'CLT', label: 'CLT' },
          { value: 'PJ', label: 'PJ' },
          { value: 'Estágio', label: 'Estágio' },
          { value: 'Temporário', label: 'Temporário' },
          { value: 'Jovem Aprendiz', label: 'Jovem Aprendiz' },
        ],
      },
    ],
    columns: [
      { key: 'matricula', label: 'Matrícula', width: 14, type: 'text' },
      { key: 'nome_completo', label: 'Nome do Colaborador', width: 34, type: 'text' },
      { key: 'cargo', label: 'Cargo', width: 22, type: 'text' },
      { key: 'departamento', label: 'Departamento', width: 20, type: 'text' },
      { key: 'situacao', label: 'Situação', width: 14, type: 'text' },
      { key: 'data_admissao', label: 'Admissão', width: 14, type: 'text' },
      { key: 'tipo_contrato', label: 'Vínculo', width: 14, type: 'text' },
      { key: 'empresa', label: 'Empresa', width: 18, type: 'text' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.situacao && f.situacao !== 'all') parts.push(`situacao = "${f.situacao}"`)
      if (f.departamento && f.departamento !== 'all')
        parts.push(`departamento ~ "${f.departamento}"`)
      if (f.cargo && f.cargo !== 'all') parts.push(`cargo ~ "${f.cargo}"`)
      if (f.tipo_contrato && f.tipo_contrato !== 'all')
        parts.push(`tipo_contrato = "${f.tipo_contrato}"`)
      return parts.join(' && ')
    },
  },

  // 14. DP & RH — Registro de Ponto e Frequência
  'rh-ponto-frequencia': {
    id: 'rh-ponto-frequencia',
    module: 'DP & RH',
    name: 'Espelho de Ponto e Frequência',
    description:
      'Batidas de ponto, horas trabalhadas, horas extras, atrasos e faltas por colaborador.',
    route: '/admin/dp/ponto',
    collectionName: 'rh_time_records',
    defaultSort: '-data',
    dateField: 'data',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período do Ponto',
        type: 'dynamic-date-range',
        defaultValue: 'yesterday',
        gridSpan: 6,
      },
      {
        key: 'date_from',
        label: 'Data inicial fixa',
        type: 'date',
        gridSpan: 3,
      },
      {
        key: 'date_to',
        label: 'Data final fixa',
        type: 'date',
        gridSpan: 3,
      },
      {
        key: 'situacao',
        label: 'Situação da Batida',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todas' },
          { value: 'Normal', label: 'Normal' },
          { value: 'Hora Extra', label: 'Com Hora Extra' },
          { value: 'Falta', label: 'Falta' },
          { value: 'Atraso', label: 'Com Atraso' },
          { value: 'Atestado', label: 'Atestado' },
        ],
      },
      {
        key: 'employee_name',
        label: 'Colaborador',
        type: 'text',
        placeholder: 'Filtrar por nome do colaborador...',
        gridSpan: 6,
      },
    ],
    columns: [
      { key: 'data', label: 'Data', width: 14, type: 'date' },
      { key: 'employee_name', label: 'Colaborador', width: 32, type: 'text' },
      { key: 'entrada', label: 'Entrada', width: 12, type: 'text' },
      { key: 'saida_intervalo', label: 'Almoço Saída', width: 14, type: 'text' },
      { key: 'retorno_intervalo', label: 'Almoço Retorno', width: 14, type: 'text' },
      { key: 'saida', label: 'Saída', width: 12, type: 'text' },
      { key: 'horas_trabalhadas', label: 'Horas Trab.', width: 14, type: 'text' },
      { key: 'horas_extras', label: 'Extras', width: 12, type: 'text' },
      { key: 'banco_horas', label: 'B. Horas', width: 12, type: 'text' },
      { key: 'situacao', label: 'Status', width: 14, type: 'text' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.situacao && f.situacao !== 'all') parts.push(`situacao = "${f.situacao}"`)
      if (f.employee_name && f.employee_name !== 'all')
        parts.push(`employee_name ~ "${f.employee_name}"`)
      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'yesterday',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom) parts.push(`data >= "${resolved.dateFrom.substring(0, 10)}"`)
      if (resolved.dateTo) parts.push(`data <= "${resolved.dateTo.substring(0, 10)}"`)
      return parts.join(' && ')
    },
  },

  // 15. DP & RH — Folha de Pagamento
  'rh-folha-pagamento': {
    id: 'rh-folha-pagamento',
    module: 'DP & RH',
    name: 'Folha de Pagamento Consolidada',
    description:
      'Resumo das folhas por competência, total bruto, descontos, encargos e valor líquido.',
    route: '/admin/dp/folha',
    collectionName: 'rh_payroll',
    defaultSort: '-competencia',
    dateField: 'created',
    amountField: 'valor_liquido',
    filters: [
      {
        key: 'competencia',
        label: 'Competência (MM/AAAA)',
        type: 'text',
        placeholder: 'Ex.: 03/2025 ou 2025-03',
        gridSpan: 6,
      },
      {
        key: 'tipo_folha',
        label: 'Tipo de Folha',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos os Tipos' },
          { value: 'Mensal', label: 'Mensal' },
          { value: 'Adiantamento', label: 'Adiantamento' },
          { value: '13º Salário', label: '13º Salário' },
          { value: 'Férias', label: 'Férias' },
          { value: 'Rescisão', label: 'Rescisão' },
        ],
      },
      {
        key: 'situacao',
        label: 'Situação',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todas as Situações' },
          { value: 'Aberta', label: 'Aberta' },
          { value: 'Calculada', label: 'Calculada' },
          { value: 'Fechada', label: 'Fechada / Paga' },
        ],
      },
      {
        key: 'departamento',
        label: 'Departamento',
        type: 'text',
        placeholder: 'Filtrar por departamento...',
        gridSpan: 6,
      },
    ],
    columns: [
      { key: 'competencia', label: 'Competência', width: 14, type: 'text' },
      { key: 'tipo_folha', label: 'Tipo Folha', width: 16, type: 'text' },
      { key: 'departamento', label: 'Departamento', width: 20, type: 'text' },
      {
        key: 'quantidade_colaboradores',
        label: 'Colaboradores',
        width: 14,
        align: 'right',
        type: 'number',
      },
      { key: 'valor_bruto', label: 'Total Bruto', width: 16, align: 'right', type: 'currency' },
      { key: 'total_descontos', label: 'Descontos', width: 14, align: 'right', type: 'currency' },
      { key: 'valor_liquido', label: 'Total Líquido', width: 16, align: 'right', type: 'currency' },
      { key: 'situacao', label: 'Status', width: 14, type: 'text' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.competencia && f.competencia !== 'all') parts.push(`competencia ~ "${f.competencia}"`)
      if (f.tipo_folha && f.tipo_folha !== 'all') parts.push(`tipo_folha = "${f.tipo_folha}"`)
      if (f.situacao && f.situacao !== 'all') parts.push(`situacao = "${f.situacao}"`)
      if (f.departamento && f.departamento !== 'all')
        parts.push(`departamento ~ "${f.departamento}"`)
      return parts.join(' && ')
    },
  },

  // 16. DP & RH — Afastamentos e Atestados
  'dp-afastamentos': {
    id: 'dp-afastamentos',
    module: 'DP & RH',
    name: 'Afastamentos e Licenças Médicas',
    description: 'Atestados médicos, licenças INSS, CID e período de afastamento dos empregados.',
    route: '/admin/dp/afastamentos',
    collectionName: 'dp_leaves',
    defaultSort: '-created',
    dateField: 'created',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período de Cadastro',
        type: 'dynamic-date-range',
        defaultValue: 'current_month',
        gridSpan: 6,
      },
      {
        key: 'tipo_afastamento',
        label: 'Tipo de Afastamento',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos os Tipos' },
          { value: 'Doença', label: 'Doença / Atestado' },
          { value: 'Acidente de Trabalho', label: 'Acidente de Trabalho' },
          { value: 'Maternidade', label: 'Licença Maternidade' },
          { value: 'Paternidade', label: 'Licença Paternidade' },
          { value: 'INSS', label: 'Auxílio INSS' },
        ],
      },
      {
        key: 'employee_name',
        label: 'Colaborador',
        type: 'text',
        placeholder: 'Filtrar por nome do colaborador...',
        gridSpan: 6,
      },
      {
        key: 'situacao',
        label: 'Status do Afastamento',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos' },
          { value: 'Ativo', label: 'Em Andamento' },
          { value: 'Encerrado', label: 'Retornado / Encerrado' },
        ],
      },
    ],
    columns: [
      { key: 'employee_name', label: 'Colaborador', width: 32, type: 'text' },
      { key: 'tipo_afastamento', label: 'Tipo', width: 20, type: 'text' },
      { key: 'data_inicio', label: 'Início', width: 14, type: 'date' },
      { key: 'data_fim', label: 'Fim', width: 14, type: 'date' },
      { key: 'cid', label: 'CID', width: 12, type: 'text' },
      { key: 'medico', label: 'Médico', width: 22, type: 'text' },
      { key: 'situacao', label: 'Status', width: 14, type: 'text' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.tipo_afastamento && f.tipo_afastamento !== 'all') {
        parts.push(`tipo_afastamento = "${f.tipo_afastamento}"`)
      }
      if (f.employee_name && f.employee_name !== 'all') {
        parts.push(`employee_name ~ "${f.employee_name}"`)
      }
      if (f.situacao && f.situacao !== 'all') {
        parts.push(`situacao = "${f.situacao}"`)
      }
      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'current_month',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom) parts.push(`created >= "${resolved.dateFrom}"`)
      if (resolved.dateTo) parts.push(`created <= "${resolved.dateTo}"`)
      return parts.join(' && ')
    },
  },

  // 17. Compras — Pedidos de Compra
  'compras-pedidos': {
    id: 'compras-pedidos',
    module: 'Compras',
    name: 'Pedidos de Compra (Suprimentos)',
    description:
      'Ordens de compra emitidas para fornecedores, valores, comprador e status de entrega.',
    route: '/admin/compras',
    collectionName: 'purchase_orders',
    defaultSort: '-created',
    dateField: 'created',
    amountField: 'total_value',
    filters: [
      {
        key: 'dynamic_date_range',
        label: 'Período do Pedido',
        type: 'dynamic-date-range',
        defaultValue: 'current_month',
        gridSpan: 6,
      },
      {
        key: 'status',
        label: 'Status do Pedido',
        type: 'select',
        gridSpan: 6,
        options: [
          { value: 'all', label: 'Todos os Status' },
          { value: 'Pendente', label: 'Pendente de Aprovação' },
          { value: 'Aprovado', label: 'Aprovado / Enviado' },
          { value: 'Recebido Parcial', label: 'Recebido Parcial' },
          { value: 'Concluído', label: 'Concluído / Entregue' },
          { value: 'Cancelado', label: 'Cancelado' },
        ],
      },
      {
        key: 'supplier_name',
        label: 'Fornecedor',
        type: 'text',
        placeholder: 'Razão social do fornecedor...',
        gridSpan: 6,
      },
      {
        key: 'buyer',
        label: 'Comprador',
        type: 'text',
        placeholder: 'Nome do comprador...',
        gridSpan: 6,
      },
    ],
    columns: [
      { key: 'order_number', label: 'Nº Pedido', width: 14, type: 'text' },
      { key: 'supplier_name', label: 'Fornecedor', width: 32, type: 'text' },
      { key: 'buyer', label: 'Comprador', width: 18, type: 'text' },
      { key: 'total_value', label: 'Valor Total', width: 16, align: 'right', type: 'currency' },
      { key: 'status', label: 'Status', width: 16, type: 'text' },
      { key: 'delivery_forecast', label: 'Previsão Entrega', width: 16, type: 'date' },
      { key: 'created', label: 'Data Emissão', width: 18, type: 'date' },
    ],
    buildFilterString: (f) => {
      const parts: string[] = []
      if (f.status && f.status !== 'all') parts.push(`status = "${f.status}"`)
      if (f.supplier_name && f.supplier_name !== 'all')
        parts.push(`supplier_name ~ "${f.supplier_name}"`)
      if (f.buyer && f.buyer !== 'all') parts.push(`buyer ~ "${f.buyer}"`)
      const resolved = resolveDynamicDateRange(
        (f.dynamic_date_range as DynamicDateRangeKey) || 'current_month',
        f.date_from as string,
        f.date_to as string,
      )
      if (resolved.dateFrom) parts.push(`created >= "${resolved.dateFrom}"`)
      if (resolved.dateTo) parts.push(`created <= "${resolved.dateTo}"`)
      return parts.join(' && ')
    },
  },
}

export function getAllReportModules(): string[] {
  const modules = new Set<string>()
  Object.values(REPORT_SOURCES_REGISTRY).forEach((src) => modules.add(src.module))
  return Array.from(modules).sort()
}

export function getReportsByModule(moduleName: string): ReportSourceDefinition[] {
  return Object.values(REPORT_SOURCES_REGISTRY).filter((src) => src.module === moduleName)
}

export function getReportSourceById(id: string): ReportSourceDefinition | undefined {
  return REPORT_SOURCES_REGISTRY[id]
}
