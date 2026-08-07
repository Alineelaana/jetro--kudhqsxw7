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
  'Videoconferência',
  'E-mail',
  'WhatsApp',
  'Follow-up',
  'Apresentação',
  'Demonstração',
  'Tarefa Interna',
  'Outro',
] as const
export const ACTIVITY_STATUS = [
  'Agendada',
  'Em Andamento',
  'Concluída',
  'Reagendada',
  'Não Realizada',
  'Cancelada',
] as const
export const ACTIVITY_PRIORITIES = ['Baixa', 'Normal', 'Alta', 'Urgente'] as const
export const PROPOSAL_STATUS = [
  'Em Elaboração',
  'Aguardando Aprovação',
  'Aprovada Internamente',
  'Enviada',
  'Visualizada',
  'Em Negociação',
  'Aceita',
  'Rejeitada',
  'Expirada',
  'Cancelada',
] as const
export const PAYMENT_OPTIONS = [
  'À vista',
  '30 dias',
  '30/60 dias',
  '30/60/90 dias',
  'Parcelado',
] as const
export const DEADLINE_OPTIONS = [
  'Imediata',
  '7 dias',
  '15 dias',
  '30 dias',
  '45 dias',
  '60 dias',
] as const
export const GOAL_TYPES = [
  'Vendas',
  'Leads',
  'Oportunidades',
  'Propostas',
  'Valor Vendido',
  'Margem',
  'Taxa de Conversão',
  'Ticket Médio',
] as const
export const GOAL_DIMENSIONS = [
  'Vendedor',
  'Equipe',
  'Produto',
  'Serviço',
  'Categoria',
  'Região',
  'Empresa',
  'Filial',
] as const
export const AGENDA_VIEWS = [
  'Diária',
  'Semanal',
  'Mensal',
  'Por Responsável',
  'Por Equipe',
] as const
export const CRM_REPORT_TYPES = [
  'Leads por Origem',
  'Leads por Responsável',
  'Leads por Situação',
  'Taxa de Conversão',
  'Oportunidades por Etapa',
  'Oportunidades Ganhas',
  'Oportunidades Perdidas',
  'Motivos de Perda',
  'Valor do Funil',
  'Previsão de Vendas',
  'Tempo Médio de Fechamento',
  'Propostas Enviadas',
  'Propostas Aceitas',
  'Atividades Comerciais',
  'Produtividade por Vendedor',
  'Metas Comerciais',
  'Clientes sem Contato',
  'Histórico de Atendimento',
] as const
export const AUTOMATION_ACTIONS = [
  'Distribuir leads entre vendedores',
  'Criar atividade ao receber novo lead',
  'Enviar lembrete de follow-up',
  'Alertar oportunidade parada',
  'Alterar etapa por ação concluída',
  'Criar tarefa após proposta enviada',
  'Criar pós-venda após oportunidade ganha',
  'Reativar leads sem contato',
  'Notificar gestor sobre oportunidade de alto valor',
] as const
export const DEFAULT_LOSS_REASONS = [
  'Preço',
  'Prazo',
  'Concorrência',
  'Falta de Interesse',
  'Sem Orçamento',
  'Produto Inadequado',
  'Cliente sem Retorno',
  'Condição Comercial',
  'Localização',
  'Outro',
] as const
export interface CrmProposalItem {
  id: string
  product_service: string
  quantity: string
  table_price: string
  unit_price: string
  discount: string
  addition: string
  total: string
  margin: string
  observations: string
}
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
  contacts: unknown[]
  attachments: string[]
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
  expected_margin: string
  weighted_value: string
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
  funnel_type: string
  company: string
  team: string
  segment: string
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
  version: number
  parent_version_id: string
  approval_status: string
  approval_user: string
  approval_date: string
  converted_order_id: string
  converted_order_number: string
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
  'Em Elaboração': 'bg-gray-100 text-gray-600',
  'Aguardando Aprovação': 'bg-amber-100 text-amber-700',
  'Aprovada Internamente': 'bg-blue-100 text-blue-700',
  Enviada: 'bg-cyan-100 text-cyan-700',
  Visualizada: 'bg-indigo-100 text-indigo-700',
  'Em Negociação': 'bg-purple-100 text-purple-700',
  Aceita: 'bg-emerald-100 text-emerald-700',
  Rejeitada: 'bg-red-100 text-red-700',
  Expirada: 'bg-gray-100 text-gray-600',
  Cancelada: 'bg-red-100 text-red-700',
}
export const TEMPERATURE_COLORS: Record<string, string> = {
  Frio: 'bg-blue-100 text-blue-700',
  Morno: 'bg-amber-100 text-amber-700',
  Quente: 'bg-red-100 text-red-700',
}
