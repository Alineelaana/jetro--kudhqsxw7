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
