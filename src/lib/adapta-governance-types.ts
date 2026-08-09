export interface GovernanceConfig {
  id: string
  module_perms: Record<string, boolean>
  data_type_perms: Record<string, boolean>
  action_perms: Record<string, boolean>
  corporate_policies: Record<string, boolean>
  default_mode: string
  enforce_org_scope: boolean
  enforce_audit: boolean
  traceability_enabled: boolean
  active: boolean
}

export interface AiProfile {
  id: string
  profile_name: string
  profile_key: string
  description: string
  module_perms: Record<string, boolean>
  data_type_perms: Record<string, boolean>
  action_perms: Record<string, boolean>
  corporate_policies: Record<string, boolean>
  allowed_agents: string[]
  active: boolean
}

export interface EnforcementResult {
  allowed: boolean
  blocked_reasons: string[]
  enforce_audit: boolean
  config_snapshot: Record<string, unknown>
}

export const GOVERNANCE_MODULES = [
  { key: 'comercial', label: 'Comercial' },
  { key: 'crm', label: 'CRM' },
  { key: 'financeiro', label: 'Financeiro' },
  { key: 'fiscal', label: 'Fiscal' },
  { key: 'industrial', label: 'Industrial' },
  { key: 'compras', label: 'Compras' },
  { key: 'estoque', label: 'Estoque' },
  { key: 'wms', label: 'WMS' },
  { key: 'logistica', label: 'Logística' },
  { key: 'rh', label: 'RH' },
  { key: 'qualidade', label: 'Qualidade' },
  { key: 'trade', label: 'Trade' },
  { key: 'remuneracao_variavel', label: 'Remuneração Variável' },
  { key: 'bi', label: 'BI' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'documentos', label: 'Documentos' },
  { key: 'auditoria', label: 'Auditoria' },
]

export const GOVERNANCE_DATA_TYPES = [
  { key: 'faturamento', label: 'Faturamento', defaultAllowed: true },
  { key: 'vendas', label: 'Vendas', defaultAllowed: true },
  { key: 'estoque', label: 'Estoque', defaultAllowed: true },
  { key: 'pedidos', label: 'Pedidos', defaultAllowed: true },
  { key: 'indicadores', label: 'Indicadores', defaultAllowed: true },
  { key: 'salarios', label: 'Salários', defaultAllowed: false },
  { key: 'custos_industriais', label: 'Custos Industriais', defaultAllowed: false },
  { key: 'margem', label: 'Margem', defaultAllowed: false },
  { key: 'lucro', label: 'Lucro', defaultAllowed: false },
  { key: 'dados_bancarios', label: 'Dados Bancários', defaultAllowed: false },
  { key: 'documentos_pessoais', label: 'Documentos Pessoais', defaultAllowed: false },
  { key: 'certificados', label: 'Certificados', defaultAllowed: false },
  { key: 'tokens', label: 'Tokens', defaultAllowed: false },
  { key: 'chaves', label: 'Chaves', defaultAllowed: false },
  { key: 'senhas', label: 'Senhas', defaultAllowed: false },
  { key: 'segredos', label: 'Segredos', defaultAllowed: false },
  { key: 'credenciais', label: 'Credenciais', defaultAllowed: false },
  { key: 'dados_lgpd', label: 'Dados LGPD', defaultAllowed: false },
]

export const GOVERNANCE_ACTIONS = [
  { key: 'CONSULTAR', label: 'Consultar' },
  { key: 'ANALISAR', label: 'Analisar' },
  { key: 'SUGERIR', label: 'Sugerir' },
  { key: 'SIMULAR', label: 'Simular' },
  { key: 'EXPORTAR', label: 'Exportar' },
  { key: 'CRIAR', label: 'Criar' },
  { key: 'ALTERAR', label: 'Alterar' },
  { key: 'EXCLUIR', label: 'Excluir' },
  { key: 'APROVAR', label: 'Aprovar' },
  { key: 'LIBERAR', label: 'Liberar' },
  { key: 'ENCERRAR', label: 'Encerrar' },
  { key: 'CANCELAR', label: 'Cancelar' },
]

export const GOVERNANCE_POLICIES = [
  { key: 'can_see_margem', label: 'Visualizar Margem' },
  { key: 'can_see_lucro', label: 'Visualizar Lucro' },
  { key: 'can_see_salarios', label: 'Visualizar Salários' },
  { key: 'can_see_comissao', label: 'Visualizar Comissões' },
  { key: 'can_see_custos', label: 'Visualizar Custos' },
  { key: 'can_see_fornecedores_estrategicos', label: 'Visualizar Fornecedores Estratégicos' },
  { key: 'can_see_fluxo_caixa', label: 'Visualizar Fluxo de Caixa' },
  { key: 'can_see_certificados', label: 'Visualizar Certificados' },
  { key: 'can_see_dados_lgpd', label: 'Visualizar Dados LGPD' },
]
