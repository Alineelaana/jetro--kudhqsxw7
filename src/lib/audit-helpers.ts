import type { AuditLogFilters } from '@/services/audit-logs'

export interface AuditFilterState {
  user: string
  startDate: string
  endDate: string
  module: string
  action: string
  role: string
  keyword: string
  criticidade: string
  empresa: string
  filial: string
  ipAddress: string
  browser: string
  os: string
  device: string
  origem: string
  sessionId: string
}

export const DEFAULT_AUDIT_FILTERS: AuditFilterState = {
  user: '',
  startDate: '',
  endDate: '',
  module: '',
  action: '',
  role: '',
  keyword: '',
  criticidade: '',
  empresa: '',
  filial: '',
  ipAddress: '',
  browser: '',
  os: '',
  device: '',
  origem: '',
  sessionId: '',
}

export function toLogFilters(
  state: AuditFilterState,
  page: number,
  perPage: number,
): AuditLogFilters {
  return {
    page,
    perPage,
    user: state.user,
    startDate: state.startDate,
    endDate: state.endDate,
    module: state.module,
    action: state.action,
    role: state.role,
    keyword: state.keyword,
    criticidade: state.criticidade,
    empresa: state.empresa,
    filial: state.filial,
    ipAddress: state.ipAddress,
    browser: state.browser,
    os: state.os,
    device: state.device,
    origem: state.origem,
    sessionId: state.sessionId,
  }
}

export function getActiveFilterLabels(state: AuditFilterState): string[] {
  const labels: string[] = []
  if (state.user) labels.push(`Usuário: ${state.user}`)
  if (state.startDate) labels.push(`Data inicial: ${state.startDate}`)
  if (state.endDate) labels.push(`Data final: ${state.endDate}`)
  if (state.module) labels.push(`Módulo: ${state.module}`)
  if (state.action) labels.push(`Ação: ${state.action}`)
  if (state.role) labels.push(`Perfil: ${state.role}`)
  if (state.criticidade) labels.push(`Criticidade: ${state.criticidade}`)
  if (state.empresa) labels.push(`Empresa: ${state.empresa}`)
  if (state.filial) labels.push(`Filial: ${state.filial}`)
  if (state.ipAddress) labels.push(`IP: ${state.ipAddress}`)
  if (state.browser) labels.push(`Navegador: ${state.browser}`)
  if (state.os) labels.push(`SO: ${state.os}`)
  if (state.device) labels.push(`Dispositivo: ${state.device}`)
  if (state.origem) labels.push(`Origem: ${state.origem}`)
  if (state.sessionId) labels.push(`Sessão: ${state.sessionId}`)
  if (state.keyword) labels.push(`Palavra-chave: ${state.keyword}`)
  return labels
}

export const AUDIT_MODULE_OPTIONS = [
  { value: 'auth', label: 'Autenticação' },
  { value: 'users', label: 'Usuários' },
  { value: 'partners', label: 'Parceiros' },
  { value: 'services_offered', label: 'Serviços' },
  { value: 'budgets', label: 'Orçamentos' },
  { value: 'site_management', label: 'Gestão do Site' },
  { value: 'vitrine', label: 'Vitrine' },
  { value: 'files', label: 'Arquivos' },
  { value: 'settings', label: 'Configurações' },
  { value: 'pricing', label: 'Precificação' },
  { value: 'stock', label: 'Estoque' },
]

export const AUDIT_ACTION_OPTIONS = [
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'login_failed', label: 'Login Falhou' },
  { value: 'create', label: 'Criação' },
  { value: 'update', label: 'Edição' },
  { value: 'delete', label: 'Exclusão' },
  { value: 'activate', label: 'Ativação' },
  { value: 'deactivate', label: 'Desativação' },
  { value: 'upload', label: 'Upload' },
  { value: 'delete_file', label: 'Excluir Arquivo' },
  { value: 'permission_change', label: 'Alt. Permissão' },
  { value: 'settings_change', label: 'Alt. Configuração' },
  { value: 'publish', label: 'Publicação' },
]

export const AUDIT_ROLE_OPTIONS = [
  { value: 'SUP', label: 'SUP' },
  { value: 'PADRAO', label: 'PADRÃO' },
  { value: 'SDR', label: 'SDR' },
  { value: 'Vendedor', label: 'Vendedor' },
  { value: 'FINANCEIRO', label: 'Financeiro' },
  { value: 'COMERCIAL', label: 'Comercial' },
]

export const CRITICIDADE_OPTIONS = [
  { value: 'Baixa', label: 'Baixa' },
  { value: 'Média', label: 'Média' },
  { value: 'Alta', label: 'Alta' },
  { value: 'Crítica', label: 'Crítica' },
]

export const ORIGEM_OPTIONS = [
  { value: 'Área da Empresa', label: 'Área da Empresa' },
  { value: 'Portal do Cliente', label: 'Portal do Cliente' },
  { value: 'Portal do Fornecedor', label: 'Portal do Fornecedor' },
  { value: 'Aplicativo', label: 'Aplicativo' },
  { value: 'API', label: 'API' },
  { value: 'Integração', label: 'Integração' },
  { value: 'Importação', label: 'Importação' },
  { value: 'Exportação', label: 'Exportação' },
  { value: 'Inteligência Artificial', label: 'Inteligência Artificial' },
  { value: 'Automação', label: 'Automação' },
  { value: 'Fluxo Inteligente', label: 'Fluxo Inteligente' },
]

export const BROWSER_OPTIONS = [
  { value: 'Google Chrome', label: 'Google Chrome' },
  { value: 'Mozilla Firefox', label: 'Mozilla Firefox' },
  { value: 'Microsoft Edge', label: 'Microsoft Edge' },
  { value: 'Safari', label: 'Safari' },
  { value: 'Desconhecido', label: 'Desconhecido' },
]

export const OS_OPTIONS = [
  { value: 'Windows', label: 'Windows' },
  { value: 'macOS', label: 'macOS' },
  { value: 'Android', label: 'Android' },
  { value: 'iOS', label: 'iOS' },
  { value: 'Linux', label: 'Linux' },
  { value: 'Desconhecido', label: 'Desconhecido' },
]

export const DEVICE_OPTIONS = [
  { value: 'Desktop', label: 'Desktop' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'Tablet', label: 'Tablet' },
]

export const ENTITY_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'usuario', label: 'Usuário' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'fornecedor', label: 'Fornecedor' },
  { value: 'produto', label: 'Produto' },
  { value: 'pedido', label: 'Pedido' },
  { value: 'nota_fiscal', label: 'Nota Fiscal' },
  { value: 'titulo_financeiro', label: 'Título Financeiro' },
  { value: 'chamado', label: 'Chamado' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'filial', label: 'Filial' },
]

export const COLLECTION_ROUTE_MAP: Record<string, string> = {
  products: '/admin/produtos',
  partners: '/admin/cadastros',
  budget_requests: '/admin',
  sales_orders: '/admin/vendas/pedidos',
  nfe_records: '/admin/vendas/nfe',
  nfce_records: '/admin/vendas/nfce',
  contracts_operations: '/admin/vendas/contratos',
  users: '/admin',
  services_offered: '/admin',
  vitrine_items: '/admin',
  settings: '/admin',
  chat_conversations: '/admin',
}
