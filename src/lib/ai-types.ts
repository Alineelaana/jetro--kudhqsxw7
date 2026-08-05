export interface AiAgent {
  id: string
  name: string
  description: string
  objective: string
  empresa: string
  filial: string
  departamento: string
  module: string
  responsible: string
  behavior_model: string
  knowledge_base: string[]
  allowed_tools: string[]
  permissions: Record<string, unknown>
  working_hours: string
  status: string
  agent_type: string
  identity: Record<string, unknown>
  objectives: Record<string, unknown>
  integrations: Record<string, unknown>
  created: string
  updated: string
}

export interface AiAutomation {
  id: string
  name: string
  description: string
  start_event: string
  conditions: Record<string, unknown>[]
  actions: Record<string, unknown>[]
  responsible: string
  empresa: string
  filial: string
  frequency: string
  schedule: string
  priority: string
  status: string
  last_run: string
  run_count: number
  created: string
  updated: string
}

export interface AiSmartFlow {
  id: string
  name: string
  description: string
  flow_type: string
  stages: Record<string, unknown>[]
  status: string
  version: number
  responsible: string
  empresa: string
  filial: string
  execution_history: Record<string, unknown>[]
  created: string
  updated: string
}

export interface AiKnowledgeItem {
  id: string
  title: string
  category: string
  description: string
  empresa: string
  filial: string
  departamento: string
  linked_agents: string[]
  content_type: string
  format: string
  content: string
  file_url: string
  responsible: string
  version: number
  expiry_date: string
  status: string
  versions: Record<string, unknown>[]
  created: string
  updated: string
}

export interface AiInteraction {
  id: string
  user_id: string
  user_name: string
  agent_id: string
  agent_name: string
  channel: string
  subject: string
  question: string
  response: string
  action_executed: string
  result: string
  evaluation: string
  evaluation_comment: string
  status: string
  module: string
  empresa: string
  filial: string
  departamento: string
  ip_address: string
  data_consulted: Record<string, unknown>
  error: string
  created: string
  updated: string
}

export interface AiApproval {
  id: string
  agent_id: string
  agent_name: string
  action_type: string
  proposed_action: string
  reason: string
  source_data: Record<string, unknown>
  current_values: Record<string, unknown>
  proposed_values: Record<string, unknown>
  impacts: string
  status: string
  approver: string
  justification: string
  module: string
  empresa: string
  filial: string
  created: string
  updated: string
}

export interface AiTrainingV2 {
  id: string
  question: string
  expected_answer: string
  correct_example: string
  incorrect_example: string
  communication_tone: string
  allowed_terms: string[]
  forbidden_terms: string[]
  applicable_rule: string
  departamento: string
  agent_id: string
  status: string
  source: string
  approver: string
  rejection_reason: string
  created: string
  updated: string
}

export interface AiModuleSettings {
  id: string
  assistant_name: string
  language: string
  communication_tone: string
  working_hours: string
  interaction_limit: number
  response_time: number
  transfer_time: number
  autonomy_level: string
  actions_requiring_confirmation: string[]
  actions_requiring_approval: string[]
  history_retention: number
  allowed_channels: string[]
  empresas: string[]
  perfis_acesso: string[]
  created: string
  updated: string
}

export interface AiErrorMonitor {
  id: string
  error_type: string
  agent_id: string
  agent_name: string
  description: string
  module: string
  status: string
  solution: string
  resolved_by: string
  resolved_at: string
  created: string
  updated: string
}

export const AGENT_TYPES = [
  'Atendimento ao Cliente',
  'Vendas',
  'Cobrança',
  'Compras',
  'Estoque',
  'Financeiro',
  'Fiscal',
  'RH',
  'Logística',
  'Produção',
  'Marketing',
  'Suporte Interno',
  'Auditoria',
  'Análise de Dados',
]

export const AGENT_STATUS = [
  'Em Configuração',
  'Em Teste',
  'Ativo',
  'Pausado',
  'Com Erro',
  'Inativo',
]

export const AUTOMATION_STATUS = ['Rascunho', 'Em Teste', 'Ativa', 'Pausada', 'Com Erro', 'Inativa']

export const AUTOMATION_START_EVENTS = [
  'Ao criar um registro',
  'Ao alterar um status',
  'Ao atingir uma data',
  'Ao vencer um prazo',
  'Ao identificar uma condição',
  'Em horário programado',
  'Por solicitação manual',
  'Por ação de outro agente',
]

export const FLOW_STAGES = [
  'Início',
  'Condição',
  'Consulta de Dados',
  'Análise da IA',
  'Criação de Registro',
  'Atualização de Registro',
  'Envio de Mensagem',
  'Solicitação de Aprovação',
  'Espera',
  'Decisão',
  'Transferência para Humano',
  'Finalização',
]

export const FLOW_TYPES = [
  'Atendimento',
  'Vendas',
  'Cobrança',
  'Compras',
  'Aprovações',
  'Financeiro',
  'Fiscal',
  'RH',
  'Logística',
  'Produção',
  'Pós-venda',
]

export const KB_CONTENT_TYPES = [
  'Manuais',
  'Procedimentos',
  'Políticas',
  'Contratos',
  'Perguntas Frequentes',
  'Catálogos',
  'Tabelas',
  'Apresentações',
  'Documentos internos',
  'Modelos de atendimento',
  'Informações sobre produtos e serviços',
  'Regras comerciais',
  'Regras financeiras',
  'Regras fiscais',
]

export const KB_FORMATS = [
  'PDF',
  'Word',
  'Excel',
  'Texto',
  'Imagem',
  'Link autorizado',
  'Conteúdo digitado',
]

export const KB_STATUS = [
  'Aguardando Processamento',
  'Em Processamento',
  'Ativo',
  'Com Erro',
  'Desatualizado',
  'Inativo',
]

export const TRAINING_STATUS = [
  'Em Preparação',
  'Aguardando Aprovação',
  'Aprovado',
  'Aplicado',
  'Rejeitado',
  'Inativo',
]

export const EVALUATION_OPTIONS = [
  'Correta',
  'Parcialmente Correta',
  'Incorreta',
  'Inadequada',
  'Precisa de Revisão',
  'Não Avaliada',
]

export const INTERACTION_STATUS = [
  'Em Andamento',
  'Concluída',
  'Transferida para Humano',
  'Aguardando Aprovação',
  'Cancelada',
]

export const APPROVAL_STATUS = [
  'Aguardando',
  'Aprovada',
  'Reprovada',
  'Ajuste Solicitado',
  'Executada',
]

export const APPROVAL_ACTION_TYPES = [
  'Alteração de preço',
  'Desconto comercial',
  'Liberação de crédito',
  'Pagamento',
  'Cancelamento',
  'Estorno',
  'Ajuste de estoque',
  'Alteração fiscal',
  'Envio de comunicação sensível',
  'Alteração de cadastro',
  'Aplicação de treinamento',
]

export const AUTONOMY_LEVELS = [
  'Somente Consultar',
  'Consultar e Sugerir',
  'Preparar Ações',
  'Executar com Confirmação',
  'Executar Ações Autorizadas',
]

export const ERROR_TYPES = [
  'Falhas de execução',
  'Respostas incorretas',
  'Integrações indisponíveis',
  'Ações não autorizadas',
  'Dados não encontrados',
  'Fluxos interrompidos',
  'Agentes sem resposta',
  'Documentos não processados',
]

export const ERROR_STATUS = ['Aberto', 'Em Análise', 'Resolvido', 'Ignorado']

export const SUGGESTED_QUESTIONS = [
  'Quais contas vencem hoje?',
  'Quais pedidos estão atrasados?',
  'Quais produtos estão com estoque baixo?',
  'Quais clientes estão inadimplentes?',
  'Quais notas fiscais foram rejeitadas?',
  'Quais entregas estão atrasadas?',
  'Quais compras aguardam aprovação?',
  'Qual foi o faturamento do mês?',
  'Quais produtos estão com margem negativa?',
]

export const REPORT_TYPES = [
  'Interações por Agente',
  'Interações por Módulo',
  'Interações por Canal',
  'Ações Executadas',
  'Ações Aprovadas',
  'Ações Reprovadas',
  'Transferências para Humanos',
  'Tempo Médio de Resposta',
  'Taxa de Resolução',
  'Avaliação das Respostas',
  'Erros por Agente',
  'Automações Executadas',
  'Tempo Economizado',
  'Usuários Atendidos',
  'Bases Mais Utilizadas',
  'Conteúdos Desatualizados',
]
