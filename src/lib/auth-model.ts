export type AuthorizationLevel =
  | 'SUP'
  | 'COMPANY_ADMIN'
  | 'MANAGER'
  | 'OPERATIONAL'
  | 'CONSULTATION'
export type OrganizationalScope = 'ALL' | 'EMPRESA' | 'FILIAL'
export type SensitiveDataCategory =
  | 'financial'
  | 'fiscal'
  | 'payroll'
  | 'costs'
  | 'margins'
  | 'prices'
  | 'commissions'
  | 'credentials'
  | 'admin_settings'
  | 'audit'
  | 'personal_data'
  | 'integrations'
  | 'secrets'
export type CriticalOperation =
  | 'approve_purchase'
  | 'cancel_billed_order'
  | 'reverse_financial'
  | 'delete_critical'
  | 'change_cost'
  | 'change_price'
  | 'change_permissions'
  | 'disable_mfa'
  | 'access_admin_settings'

export const ROLE_LEVEL_MAP: Record<string, AuthorizationLevel> = {
  SUP: 'SUP',
  FINANCEIRO: 'COMPANY_ADMIN',
  COMERCIAL: 'MANAGER',
  PADRAO: 'OPERATIONAL',
  SDR: 'OPERATIONAL',
  Vendedor: 'OPERATIONAL',
}

export const LEVEL_LABELS: Record<AuthorizationLevel, string> = {
  SUP: 'Superusuário',
  COMPANY_ADMIN: 'Administrador da Empresa',
  MANAGER: 'Gerente',
  OPERATIONAL: 'Operacional',
  CONSULTATION: 'Consulta',
}

export const SENSITIVE_CATEGORIES: Record<SensitiveDataCategory, string> = {
  financial: 'Dados Financeiros',
  fiscal: 'Dados Fiscais',
  payroll: 'Folha de Pagamento',
  costs: 'Custos',
  margins: 'Margens',
  prices: 'Preços',
  commissions: 'Comissões',
  credentials: 'Credenciais',
  admin_settings: 'Configurações Administrativas',
  audit: 'Auditoria',
  personal_data: 'Dados Pessoais',
  integrations: 'Integrações',
  secrets: 'Tokens e Segredos',
}

export const CRITICAL_OPERATIONS: Record<
  CriticalOperation,
  { label: string; description: string }
> = {
  approve_purchase: { label: 'Aprovar Compras', description: 'Aprovação de pedidos de compra' },
  cancel_billed_order: {
    label: 'Cancelar Pedido Faturado',
    description: 'Cancelamento de pedidos já faturados',
  },
  reverse_financial: {
    label: 'Estornar Lançamento Financeiro',
    description: 'Estorno de títulos e movimentações',
  },
  delete_critical: {
    label: 'Excluir Registro Crítico',
    description: 'Exclusão de registros sensíveis',
  },
  change_cost: { label: 'Alterar Custo', description: 'Alteração de custos de produtos' },
  change_price: { label: 'Alterar Preço', description: 'Alteração de preços e tabelas' },
  change_permissions: { label: 'Alterar Permissões', description: 'Gestão de perfis e permissões' },
  disable_mfa: { label: 'Desativar MFA', description: 'Desativação de autenticação dupla' },
  access_admin_settings: {
    label: 'Acessar Configurações',
    description: 'Acesso a configurações administrativas',
  },
}

const SENSITIVE_ACCESS: Record<SensitiveDataCategory, string[]> = {
  financial: ['SUP', 'FINANCEIRO', 'COMERCIAL'],
  fiscal: ['SUP', 'FINANCEIRO', 'COMERCIAL'],
  payroll: ['SUP', 'FINANCEIRO'],
  costs: ['SUP', 'FINANCEIRO', 'COMERCIAL'],
  margins: ['SUP', 'FINANCEIRO', 'COMERCIAL'],
  prices: ['SUP', 'COMERCIAL'],
  commissions: ['SUP', 'COMERCIAL'],
  credentials: ['SUP'],
  admin_settings: ['SUP'],
  audit: ['SUP', 'FINANCEIRO', 'COMERCIAL'],
  personal_data: ['SUP', 'FINANCEIRO'],
  integrations: ['SUP'],
  secrets: ['SUP'],
}

export function getAuthorizationLevel(role: string | undefined): AuthorizationLevel {
  if (!role) return 'CONSULTATION'
  return ROLE_LEVEL_MAP[role] || 'OPERATIONAL'
}

export function getOrganizationalScope(user: Record<string, unknown> | null): OrganizationalScope {
  if (!user) return 'ALL'
  if ((user.role as string) === 'SUP') return 'ALL'
  const empresaId = user.empresa_id as string
  const filialId = user.filial_id as string
  if (!empresaId && !filialId) return 'ALL'
  if (filialId) return 'FILIAL'
  return 'EMPRESA'
}

export function canAccessEmpresa(user: Record<string, unknown> | null, empresaId: string): boolean {
  if (!user) return false
  if ((user.role as string) === 'SUP') return true
  const userEmpresa = user.empresa_id as string
  if (!userEmpresa) return true
  return userEmpresa === empresaId
}

export function canAccessFilial(user: Record<string, unknown> | null, filialId: string): boolean {
  if (!user) return false
  if ((user.role as string) === 'SUP') return true
  const userFilial = user.filial_id as string
  if (!userFilial) return true
  return userFilial === filialId
}

export function isSensitiveData(
  category: SensitiveDataCategory,
  role: string | undefined,
): boolean {
  if (!role) return false
  if (role === 'SUP') return true
  return SENSITIVE_ACCESS[category].includes(role)
}
