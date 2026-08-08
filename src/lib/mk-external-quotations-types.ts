export const EQ_STATUS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'em_preparacao', label: 'Em Preparação' },
  { value: 'aguardando_fornecedores', label: 'Aguardando Fornecedores' },
  { value: 'propostas_recebidas', label: 'Propostas Recebidas' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'em_negociacao', label: 'Em Negociação' },
  { value: 'aguardando_aprovacao', label: 'Aguardando Aprovação' },
  { value: 'aprovada', label: 'Aprovada' },
  { value: 'rejeitada', label: 'Rejeitada' },
  { value: 'encaminhada_compras', label: 'Encaminhada para Compras' },
  { value: 'contratada', label: 'Contratada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'encerrada', label: 'Encerrada' },
] as const

export const EQ_PRIORITY = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
  { value: 'critica', label: 'Crítica' },
] as const

export const EQ_SUPPLIER_STATUS = [
  { value: 'solicitado', label: 'Solicitado' },
  { value: 'visualizado', label: 'Visualizado' },
  { value: 'proposta_recebida', label: 'Proposta Recebida' },
  { value: 'recusou_participar', label: 'Recusou Participar' },
  { value: 'prazo_vencido', label: 'Prazo Vencido' },
  { value: 'proposta_revisada', label: 'Proposta Revisada' },
] as const

export const EQ_STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  em_preparacao: 'bg-blue-100 text-blue-700',
  aguardando_fornecedores: 'bg-cyan-100 text-cyan-700',
  propostas_recebidas: 'bg-indigo-100 text-indigo-700',
  em_analise: 'bg-amber-100 text-amber-700',
  em_negociacao: 'bg-purple-100 text-purple-700',
  aguardando_aprovacao: 'bg-orange-100 text-orange-700',
  aprovada: 'bg-emerald-100 text-emerald-700',
  rejeitada: 'bg-red-100 text-red-700',
  encaminhada_compras: 'bg-teal-100 text-teal-700',
  contratada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-700',
  encerrada: 'bg-gray-100 text-gray-700',
}

export const EQ_TIMELINE_STEPS = [
  { key: 'dados', label: 'Dados da Necessidade' },
  { key: 'fornecedores', label: 'Fornecedores' },
  { key: 'propostas', label: 'Propostas' },
  { key: 'comparativo', label: 'Comparativo' },
  { key: 'recomendacao', label: 'Recomendação' },
  { key: 'aprovacao', label: 'Aprovação' },
  { key: 'contratacao', label: 'Contratação' },
] as const

export interface MkQuotationSupplier {
  supplier_id: string
  supplier_name: string
  trade_name: string
  cnpj_cpf: string
  contact: string
  phone: string
  email: string
  city: string
  state: string
  category: string
  status: string
  invited_at: string
  viewed_at?: string
  proposal_received_at?: string
  refused_at?: string
}

export interface MkQuotationProposal {
  id: string
  supplier_id: string
  supplier_name: string
  supplier_quotation_number: string
  proposal_date: string
  validity: string
  description: string
  quantity: string
  unit_price: string
  total_value: string
  discount: string
  freight: string
  taxes: string
  other_expenses: string
  final_value: string
  production_deadline: string
  delivery_deadline: string
  payment_condition: string
  entry: string
  installments: string
  warranty: string
  technical_specifications: string
  observations: string
  internal_observations: string
  attachments: string[]
  original_pdf: string
}

export interface MkNegotiationRound {
  id: string
  supplier_id: string
  supplier_name: string
  round: number
  previous_value: string
  new_value: string
  date: string
  user: string
  notes: string
}

export interface MkApprovalEntry {
  id: string
  action:
    | 'approve'
    | 'reject'
    | 'request_adjustment'
    | 'request_new_quotation'
    | 'return_for_negotiation'
  user: string
  user_id: string
  date: string
  notes: string
  level: string
}

export interface MkExternalQuotation {
  id: string
  quotation_number: string
  title: string
  requester: string
  requester_id: string
  area: string
  company: string
  branch: string
  cost_center: string
  campaign_id: string
  campaign_name: string
  action_id: string
  action_name: string
  job_id: string
  event_id: string
  sponsoring_supplier_id: string
  sponsoring_supplier_name: string
  verba_id: string
  verba_name: string
  contract_type: string
  description: string
  specifications: string
  quantity: string
  unit: string
  desired_deadline: string
  delivery_location: string
  proposal_deadline: string
  priority: string
  observations: string
  status: string
  suppliers: MkQuotationSupplier[]
  proposals: MkQuotationProposal[]
  negotiation_history: MkNegotiationRound[]
  recommended_supplier_id: string
  recommended_supplier_name: string
  recommendation_justification: string
  approval_data: MkApprovalEntry[]
  workflow_id: string
  purchase_request_id: string
  purchase_request_number: string
  budget_info: Record<string, unknown>
  verba_info: Record<string, unknown>
  created_by: string
  created_by_name: string
  created: string
  updated: string
}

export function getApprovalLevel(value: number): { level: string; label: string; roles: string[] } {
  if (value <= 5000)
    return { level: 'gestor_marketing', label: 'Gestor de Marketing', roles: ['SUP', 'COMERCIAL'] }
  if (value <= 20000)
    return {
      level: 'gestor_diretor',
      label: 'Gestor + Diretor Comercial',
      roles: ['SUP', 'COMERCIAL'],
    }
  return {
    level: 'diretor_financeiro',
    label: 'Diretor + Financeiro',
    roles: ['SUP', 'FINANCEIRO'],
  }
}
