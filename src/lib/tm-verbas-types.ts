export const VERBA_USAGE_PURPOSES = [
  { value: 'campanha_vendas', label: 'Campanha de Vendas' },
  { value: 'acao_pdv', label: 'Ação de Ponto de Venda' },
  { value: 'catalogos', label: 'Confecção de Catálogos' },
  { value: 'merchandising', label: 'Materiais de Merchandising' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'convencoes', label: 'Convenções' },
  { value: 'outros', label: 'Outros' },
] as const

export const VERBA_AGREEMENT_STATUS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'encerrado', label: 'Encerrado' },
  { value: 'cancelado', label: 'Cancelado' },
] as const

export interface TmVerbaRow {
  id: string
  agreement_id: string
  account_id: string
  supplier_id: string
  supplier_name: string
  agreement_type: string
  status: string
  value_original: string
  opening_balance: string
  accrued_total: string
  committed_total: string
  consumed_total: string
  settled_total: string
  current_balance: string
  start_date: string
  end_date: string
  company: string
  branch: string
  responsible_user: string
  currency: string
  observations: string
  brands: string[]
  products: string[]
  campaigns: string[]
  actions: string[]
}

export interface TmVerbaFilters {
  supplier: string
  brand: string
  product: string
  campaign: string
  action: string
  status: string
  responsible: string
  company: string
  branch: string
  startDate: string
  endDate: string
  validityDate: string
}

export const EMPTY_VERBA_FILTERS: TmVerbaFilters = {
  supplier: '',
  brand: '',
  product: '',
  campaign: '',
  action: '',
  status: '',
  responsible: '',
  company: '',
  branch: '',
  startDate: '',
  endDate: '',
  validityDate: '',
}

export const VERBA_STATUS_BADGE: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  ativo: 'bg-green-100 text-green-700',
  pausado: 'bg-amber-100 text-amber-700',
  encerrado: 'bg-blue-100 text-blue-700',
  cancelado: 'bg-red-100 text-red-700',
}
