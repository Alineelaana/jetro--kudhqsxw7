export interface PriceTableItem {
  product_id: string
  code: string
  name: string
  cost_price: string
  current_price: string
  new_price: string
  min_price: string
  margin: string
  max_discount: string
  start_date: string
  end_date: string
  status: string
}

export interface PriceTableRules {
  empresas: string
  filiais: string
  clientes: string
  grupos_clientes: string
  regioes: string
  cidades: string
  estados: string
  canais: string
  vendedores: string
  representantes: string
  contratos: string
  campanhas: string
  formas_pagamento: string
  condicoes_pagamento: string
}

export interface EnhancedPriceTable {
  id: string
  table_name: string
  code: string
  description: string
  table_type: string
  empresa: string
  filial: string
  moeda: string
  prioridade: number
  tabela_base: string
  percentual_ajuste: string
  status: string
  observacoes: string
  data_inicial: string
  data_final: string
  items: PriceTableItem[]
  rules: PriceTableRules
  responsible_user: string
  parent_table_id: string
  active: boolean
  product_id: string
  product_code: string
  product_name: string
  price: string
  discount_percent: string
  final_price: string
  created: string
  updated: string
}

export interface PriceTableFormState {
  table_name: string
  code: string
  description: string
  table_type: string
  empresa: string
  filial: string
  moeda: string
  prioridade: string
  tabela_base: string
  percentual_ajuste: string
  status: string
  observacoes: string
  data_inicial: string
  data_final: string
}

export const TABLE_TYPE_OPTIONS = [
  { value: 'varejo', label: 'Varejo' },
  { value: 'atacado', label: 'Atacado' },
  { value: 'distribuidor', label: 'Distribuidor' },
  { value: 'promocional', label: 'Promocional' },
  { value: 'especial', label: 'Especial' },
  { value: 'cliente_especifico', label: 'Cliente Específico' },
  { value: 'regiao', label: 'Região' },
  { value: 'canal_venda', label: 'Canal de Venda' },
  { value: 'representante', label: 'Representante' },
  { value: 'outra', label: 'Outra' },
]

export const TABLE_STATUS_OPTIONS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'aguardando_aprovacao', label: 'Aguardando Aprovação' },
  { value: 'ativa', label: 'Ativa' },
  { value: 'inativa', label: 'Inativa' },
  { value: 'expirada', label: 'Expirada' },
  { value: 'cancelada', label: 'Cancelada' },
]

export const STATUS_BADGE: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  aguardando_aprovacao: 'bg-amber-100 text-amber-700',
  ativa: 'bg-emerald-100 text-emerald-700',
  inativa: 'bg-gray-100 text-gray-600',
  expirada: 'bg-red-100 text-red-700',
  cancelada: 'bg-red-100 text-red-700',
}

export const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  aguardando_aprovacao: 'Aguardando Aprovação',
  ativa: 'Ativa',
  inativa: 'Inativa',
  expirada: 'Expirada',
  cancelada: 'Cancelada',
}

export const RULE_FIELDS: { key: keyof PriceTableRules; label: string }[] = [
  { key: 'empresas', label: 'Empresas' },
  { key: 'filiais', label: 'Filiais' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'grupos_clientes', label: 'Grupos de Clientes' },
  { key: 'regioes', label: 'Regiões' },
  { key: 'cidades', label: 'Cidades' },
  { key: 'estados', label: 'Estados' },
  { key: 'canais', label: 'Canais de Venda' },
  { key: 'vendedores', label: 'Vendedores' },
  { key: 'representantes', label: 'Representantes' },
  { key: 'contratos', label: 'Contratos' },
  { key: 'campanhas', label: 'Campanhas' },
  { key: 'formas_pagamento', label: 'Formas de Pagamento' },
  { key: 'condicoes_pagamento', label: 'Condições de Pagamento' },
]

export function getInitialRules(): PriceTableRules {
  return {
    empresas: '',
    filiais: '',
    clientes: '',
    grupos_clientes: '',
    regioes: '',
    cidades: '',
    estados: '',
    canais: '',
    vendedores: '',
    representantes: '',
    contratos: '',
    campanhas: '',
    formas_pagamento: '',
    condicoes_pagamento: '',
  }
}

export function getInitialFormState(): PriceTableFormState {
  return {
    table_name: '',
    code: '',
    description: '',
    table_type: 'varejo',
    empresa: '',
    filial: '',
    moeda: 'BRL',
    prioridade: '0',
    tabela_base: '',
    percentual_ajuste: '',
    status: 'rascunho',
    observacoes: '',
    data_inicial: '',
    data_final: '',
  }
}

export function parseItems(v: unknown): PriceTableItem[] {
  if (Array.isArray(v)) return v as PriceTableItem[]
  if (typeof v === 'string') {
    try {
      return JSON.parse(v)
    } catch {
      return []
    }
  }
  return []
}

export function parseRules(v: unknown): PriceTableRules {
  if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
    return { ...getInitialRules(), ...(v as Partial<PriceTableRules>) }
  }
  if (typeof v === 'string') {
    try {
      return { ...getInitialRules(), ...JSON.parse(v) }
    } catch {
      /* intentionally ignored */
    }
  }
  return getInitialRules()
}

export function formatCurrency(v: string | number): string {
  const n = typeof v === 'number' ? v : parseFloat(String(v || '0').replace(',', '.'))
  return isNaN(n)
    ? '0,00'
    : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('pt-BR')
  } catch {
    return '—'
  }
}
