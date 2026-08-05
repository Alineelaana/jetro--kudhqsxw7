export const ATENDIMENTO_STATUS = [
  'Aberto',
  'Aguardando Atendimento',
  'Em Atendimento',
  'Aguardando Cliente',
  'Aguardando Outro Setor',
  'Em Análise',
  'Resolvido',
  'Finalizado',
  'Cancelado',
] as const

export const PRIORIDADES = ['Baixa', 'Normal', 'Alta', 'Urgente'] as const
export const ORIGENS = [
  'Telefone',
  'WhatsApp',
  'Portal do Cliente',
  'E-mail',
  'Comercial',
  'Representante',
  'Presencial',
  'Chat',
  'Inteligência Artificial',
] as const
export const TIPOS = [
  'Reclamação',
  'Solicitação',
  'Informação',
  'Dúvida',
  'Sugestão',
  'Elogio',
] as const
export const PROBLEM_TYPES = [
  'Avariado',
  'Faltante',
  'Incorreto',
  'Vencido',
  'Divergência de quantidade',
  'Divergência de valor',
  'Outro',
] as const
export const FLUXO_STATUS = ['Ativo', 'Inativo', 'Em Configuração'] as const
export const STAGE_STATUS = [
  'Pendente',
  'Em Andamento',
  'Aguardando Aprovação',
  'Aguardando Outro Setor',
  'Concluída',
  'Cancelada',
] as const

export const STATUS_BADGE_COLORS: Record<string, string> = {
  Aberto: 'bg-blue-100 text-blue-700',
  'Aguardando Atendimento': 'bg-cyan-100 text-cyan-700',
  'Em Atendimento': 'bg-amber-100 text-amber-700',
  'Aguardando Cliente': 'bg-purple-100 text-purple-700',
  'Aguardando Outro Setor': 'bg-orange-100 text-orange-700',
  'Em Análise': 'bg-indigo-100 text-indigo-700',
  Resolvido: 'bg-emerald-100 text-emerald-700',
  Finalizado: 'bg-green-100 text-green-700',
  Cancelado: 'bg-red-100 text-red-700',
}

export interface AtendimentoRecord {
  id: string
  protocol: string
  client_id: string
  client_name: string
  client_email: string
  client_phone: string
  motivo_id: string
  setor_id: string
  origem: string
  tipo: string
  prioridade: string
  status: string
  descricao: string
  pedido_id: string
  nf_id: string
  chave_nf: string
  data_abertura: string
  hora_abertura: string
  usuario_abertura: string
  empresa: string
  filial: string
  sla_limite: string
  sla_cumprido: boolean
  data_encerramento: string
  flow_id: string
  current_stage_id: string
  data_hora_limite: string
  affected_items: unknown[]
  internal_comments: unknown[]
  client_messages: unknown[]
  cancel_reason: string
  created: string
  updated: string
}

export interface MotivoRecord {
  id: string
  nome: string
  setor_id: string
  sla_horas: number
  active: boolean
}

export interface SetorRecord {
  id: string
  nome: string
  gerente_id: string
  email: string
  active: boolean
}

export interface FluxoRecord {
  id: string
  nome: string
  motivo_id: string
  setor_id: string
  empresa: string
  filial: string
  prioridade: string
  sla_hours: number
  status: string
  documentos_obrigatorios: string[]
}

export interface FluxoEtapaRecord {
  id: string
  fluxo_id: string
  ordem: number
  nome: string
  setor_id: string
  usuario_id: string
  tempo_maximo_minutos: number
  descricao_atividade: string
  obrigatoria: boolean
  permitir_anexos: boolean
  exigir_observacao: boolean
  exigir_aprovacao: boolean
  checklist: Array<{ name: string; required: boolean }>
  parallel: boolean
}

export interface StageStatusRecord {
  id: string
  atendimento_id: string
  etapa_id: string
  status: string
  data_inicio: string
  data_fim: string
  usuario_responsavel: string
  observacoes: string
  tempo_gasto_minutos: number
  data_hora_limite: string
  checklist_progress: Record<string, boolean>
  approval_status: string
  approval_comment: string
}

export interface HistoricoRecord {
  id: string
  atendimento_id: string
  tipo: string
  usuario_id: string
  data_hora: string
  conteudo: string
  old_value: string
  new_value: string
}
