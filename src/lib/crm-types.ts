export const LEAD_SOURCES = [
  'Site',
  'Redes Sociais',
  'Indicação',
  'Evento',
  'WhatsApp',
  'Ligação',
  'E-mail',
  'Campanha',
  'Prospecção Ativa',
  'Parceiro',
  'Outro',
] as const
export const LEAD_STATUS = [
  'Novo',
  'Em Contato',
  'Em Qualificação',
  'Qualificado',
  'Não Qualificado',
  'Convertido',
  'Perdido',
] as const
export const LEAD_TEMPERATURES = ['Frio', 'Morno', 'Quente'] as const
export const PERSON_TYPES = ['PF', 'PJ'] as const
export const COMPANY_SIZES = ['Micro', 'Pequena', 'Média', 'Grande'] as const
export const OPPORTUNITY_STATUS = [
  'Em Aberto',
  'Em Negociação',
  'Aguardando Cliente',
  'Proposta Enviada',
  'Ganha',
  'Perdida',
  'Suspensa',
  'Cancelada',
] as const
export const ACTIVITY_TYPES = [
  'Ligação',
  'Reunião',
  'Visita',
  'E-mail',
  'WhatsApp',
  'Proposta',
  'Follow-up',
  'Outro',
] as const
export const ACTIVITY_STATUS = ['Pendente', 'Concluída', 'Cancelada', 'Reagendada'] as const
export const ACTIVITY_PRIORITIES = ['Baixa', 'Normal', 'Alta', 'Urgente'] as const
export const PROPOSAL_STATUS = [
  'Rascunho',
  'Aguardando Aprovação',
  'Aprovada',
  'Rejeitada',
  'Enviada',
  'Aceita',
  'Expirada',
] as const
export const GOAL_TYPES = ['Vendas', 'Leads', 'Oportunidades', 'Propostas'] as const
export const AUTOMATION_TRIGGERS = [
  'Lead Criado',
  'Lead Qualificado',
  'Oportunidade Criada',
  'Oportunidade Ganha',
  'Oportunidade Perdida',
  'Proposta Enviada',
  'Proposta Aprovada',
  'Atividade Concluída',
] as const

export interface CrmLead {
  id: string
  lead_number: string
  name: string
  trade_name: string
  person_type: string
  cpf_cnpj: string
  phone: string
  whatsapp: string
  email: string
  city: string
  state: string
  segment: string
  company_size: string
  lead_source: string
  campaign: string
  product_interest: string
  responsible_id: string
  responsible_name: string
  entry_date: string
  next_action: string
  observations: string
  status: string
  company: string
  filial: string
  qualification_data: Record<string, unknown>
  temperature: string
  qualification_score: number
  converted: boolean
  client_id: string
  opportunity_id: string
  created: string
  updated: string
}
export interface CrmOpportunity {
  id: string
  opportunity_number: string
  lead_id: string
  client_id: string
  client_name: string
  title: string
  company: string
  filial: string
  responsible_id: string
  responsible_name: string
  product_service: string
  estimated_value: string
  probability: number
  open_date: string
  expected_close_date: string
  stage_id: string
  stage_name: string
  competitors: unknown[]
  next_action: string
  observations: string
  status: string
  loss_reason_id: string
  loss_competitor: string
  loss_value: string
  loss_observations: string
  loss_reopenable: boolean
  loss_recontact_date: string
  proposal_id: string
  order_id: string
  contract_id: string
  stage_entered_at: string
  created: string
  updated: string
}
export interface CrmFunnelStage {
  id: string
  name: string
  order: number
  probability: number
  color: string
  sla_days: number
  active: boolean
}
export interface CrmActivity {
  id: string
  type: string
  title: string
  description: string
  lead_id: string
  opportunity_id: string
  client_id: string
  client_name: string
  responsible_id: string
  responsible_name: string
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  status: string
  priority: string
  result: string
  follow_up_required: boolean
  follow_up_date: string
  company: string
  filial: string
  created: string
  updated: string
}
export interface CrmProposal {
  id: string
  proposal_number: string
  opportunity_id: string
  client_name: string
  title: string
  responsible_id: string
  responsible_name: string
  items: unknown[]
  subtotal: string
  discount: string
  total: string
  payment_terms: string
  delivery_terms: string
  validity_date: string
  status: string
  sent_date: string
  approved_date: string
  rejected_reason: string
  company: string
  filial: string
  created: string
  updated: string
}
export interface CrmLossReason {
  id: string
  name: string
  active: boolean
}
export interface CrmGoal {
  id: string
  title: string
  type: string
  target_value: string
  realized_value: string
  period: string
  responsible_id: string
  responsible_name: string
  company: string
  filial: string
  product_service: string
  category: string
  region: string
  active: boolean
}
export interface CrmAutomationRule {
  id: string
  name: string
  trigger: string
  conditions: unknown
  actions: unknown
  active: boolean
}
export interface CrmHistory {
  id: string
  entity_type: string
  entity_id: string
  entity_name: string
  type: string
  description: string
  user_id: string
  user_name: string
  date: string
  company: string
  filial: string
  created: string
}

export const LEAD_STATUS_COLORS: Record<string, string> = {
  Novo: 'bg-blue-100 text-blue-700',
  'Em Contato': 'bg-cyan-100 text-cyan-700',
  'Em Qualificação': 'bg-amber-100 text-amber-700',
  Qualificado: 'bg-emerald-100 text-emerald-700',
  'Não Qualificado': 'bg-gray-100 text-gray-600',
  Convertido: 'bg-green-100 text-green-700',
  Perdido: 'bg-red-100 text-red-700',
}
export const OPP_STATUS_COLORS: Record<string, string> = {
  'Em Aberto': 'bg-blue-100 text-blue-700',
  'Em Negociação': 'bg-amber-100 text-amber-700',
  'Aguardando Cliente': 'bg-purple-100 text-purple-700',
  'Proposta Enviada': 'bg-cyan-100 text-cyan-700',
  Ganha: 'bg-green-100 text-green-700',
  Perdida: 'bg-red-100 text-red-700',
  Suspensa: 'bg-gray-100 text-gray-600',
  Cancelada: 'bg-red-100 text-red-700',
}
export const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  Rascunho: 'bg-gray-100 text-gray-600',
  'Aguardando Aprovação': 'bg-amber-100 text-amber-700',
  Aprovada: 'bg-green-100 text-green-700',
  Rejeitada: 'bg-red-100 text-red-700',
  Enviada: 'bg-blue-100 text-blue-700',
  Aceita: 'bg-emerald-100 text-emerald-700',
  Expirada: 'bg-gray-100 text-gray-600',
}
export const TEMPERATURE_COLORS: Record<string, string> = {
  Frio: 'bg-blue-100 text-blue-700',
  Morno: 'bg-amber-100 text-amber-700',
  Quente: 'bg-red-100 text-red-700',
}
