export const ACTION_TYPES = [
  { value: 'campanha_promocional', label: 'Campanha Promocional' },
  { value: 'lancamento_produto', label: 'Lançamento de Produto' },
  { value: 'acao_pdv', label: 'Ação em PDV' },
  { value: 'degustacao', label: 'Degustação' },
  { value: 'demonstracao', label: 'Demonstração' },
  { value: 'blitz', label: 'Blitz' },
  { value: 'evento', label: 'Evento' },
  { value: 'feira', label: 'Feira' },
  { value: 'convencao', label: 'Convenção' },
  { value: 'treinamento_comercial', label: 'Treinamento Comercial' },
  { value: 'sell_in', label: 'Sell-in' },
  { value: 'sell_out', label: 'Sell-out' },
  { value: 'campanha_digital', label: 'Campanha Digital' },
  { value: 'midia_paga', label: 'Mídia Paga' },
  { value: 'midia_organica', label: 'Mídia Orgânica' },
  { value: 'redes_sociais', label: 'Redes Sociais' },
  { value: 'email_marketing', label: 'E-mail Marketing' },
  { value: 'crm', label: 'CRM' },
  { value: 'campanha_b2b', label: 'Campanha B2B' },
  { value: 'campanha_b2c', label: 'Campanha B2C' },
  { value: 'endomarketing', label: 'Endomarketing' },
  { value: 'incentivo_vendas', label: 'Incentivo de Vendas' },
  { value: 'campanha_fornecedor', label: 'Campanha de Fornecedor' },
  { value: 'ativacao_marca', label: 'Ativação de Marca' },
  { value: 'acao_regional', label: 'Ação Regional' },
  { value: 'acao_filial', label: 'Ação por Filial' },
  { value: 'acao_cliente', label: 'Ação por Cliente' },
  { value: 'acao_canal', label: 'Ação por Canal' },
] as const

export const ACTION_STATUS = [
  { value: 'ideia', label: 'Ideia' },
  { value: 'planejamento', label: 'Planejamento' },
  { value: 'orcamento', label: 'Orçamento' },
  { value: 'solicitacao_verba', label: 'Solicitação de Verba' },
  { value: 'aprovacao', label: 'Aprovação' },
  { value: 'programacao', label: 'Programação' },
  { value: 'execucao', label: 'Execução' },
  { value: 'evidencias', label: 'Evidências' },
  { value: 'medicao_resultado', label: 'Medição de Resultado' },
  { value: 'prestacao_contas', label: 'Prestação de Contas' },
  { value: 'encerramento', label: 'Encerramento' },
  { value: 'cancelado', label: 'Cancelado' },
] as const

export const ACTION_PRIORITY = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
  { value: 'critica', label: 'Crítica' },
] as const

export const RECURRENCE_TYPES = [
  { value: 'nenhuma', label: 'Não repete' },
  { value: 'diaria', label: 'Diária' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'anual', label: 'Anual' },
  { value: 'personalizada', label: 'Personalizada' },
] as const

export const DEFAULT_CHECKLIST = [
  'Material aprovado',
  'Verba aprovada',
  'Estoque disponível',
  'Equipe confirmada',
  'Comunicação enviada',
  'PDV confirmado',
  'Transporte',
  'Materiais enviados',
  'Fornecedor confirmado',
  'Fotos obrigatórias',
  'Relatório final',
]

export const STATUS_COLORS: Record<string, string> = {
  ideia: 'bg-gray-100 text-gray-700',
  planejamento: 'bg-blue-100 text-blue-700',
  orcamento: 'bg-cyan-100 text-cyan-700',
  solicitacao_verba: 'bg-cyan-100 text-cyan-700',
  aprovacao: 'bg-amber-100 text-amber-700',
  programacao: 'bg-purple-100 text-purple-700',
  execucao: 'bg-orange-100 text-orange-700',
  evidencias: 'bg-indigo-100 text-indigo-700',
  medicao_resultado: 'bg-teal-100 text-teal-700',
  prestacao_contas: 'bg-rose-100 text-rose-700',
  encerramento: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
}

export const PRIORITY_COLORS: Record<string, string> = {
  baixa: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-600',
  alta: 'bg-amber-100 text-amber-600',
  urgente: 'bg-orange-100 text-orange-600',
  critica: 'bg-red-100 text-red-600',
}

export interface TradeMarketingAction {
  id: string
  title: string
  description: string
  action_type: string
  objective: string
  company: string
  branch: string
  responsible_id: string
  responsible_name: string
  team: string
  supplier: string
  industry: string
  brand: string
  product: string
  category: string
  region: string
  channel: string
  client: string
  pdv: string
  start_date: string
  end_date: string
  time: string
  recurrence: string
  priority: string
  status: string
  budget_planned: string
  verba_id: string
  verba_name: string
  cost_actual: string
  campaign_id: string
  campaign_name: string
  promotion_id: string
  promotion_name: string
  goal_id: string
  goal_name: string
  checklist: Array<{ label: string; checked: boolean }>
  indicators: Record<string, unknown>
  observations: string
  agenda_event_id: string
  workflow_id: string
  attachments: Record<string, unknown>
  evidence: Record<string, unknown>
  results: Record<string, unknown>
  location_city: string
  location_state: string
  created_by: string
  created_by_name: string
  created: string
  updated: string
}

export interface TmFilters {
  scope: string
  tipo: string
  status: string
  priority: string
  supplier: string
  campaign: string
  startDate: string
  endDate: string
}

export interface TmConflict {
  type: 'responsible' | 'pdv' | 'team' | 'budget'
  actionIds: string[]
  message: string
}

export type CalendarView = 'month' | 'week' | 'list' | 'kanban'
