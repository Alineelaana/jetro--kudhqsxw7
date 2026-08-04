import {
  canManagePartners,
  canRegisterPartners,
  canEditPartners,
  canDeletePartners,
  canViewSales,
  canViewStock,
  canConsultCosts,
  canMakeMovements,
  canMakeAdjustments,
  canViewConfiguracoes,
  canManageConfiguracoes,
  canViewAuditLogs,
  canManageBackups,
  canManageUsers,
  canManageCms,
  canManageAiTraining,
  canViewPurchasing,
} from '@/lib/permissions'
import {
  canViewPriceTables,
  canCreatePriceTable,
  canEditPriceTable,
} from '@/lib/price-table-permissions'

export const PROFILES = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'] as const

export interface MatrixScreen {
  key: string
  label: string
  category: string
  view: (role: string | undefined) => boolean
  create?: (role: string | undefined) => boolean
  edit?: (role: string | undefined) => boolean
  delete?: (role: string | undefined) => boolean
}

const all = () => true
const sup = (r: string | undefined) => r === 'SUP'
const supPadrao = (r: string | undefined) => !!r && ['SUP', 'PADRAO'].includes(r)

export const MATRIX_SCREENS: MatrixScreen[] = [
  { key: 'dashboard', label: 'Dashboard', category: 'Operacional', view: all },
  {
    key: 'budgets',
    label: 'Orçamentos',
    category: 'Operacional',
    view: all,
    create: all,
    edit: (r) => !!r && ['SUP', 'PADRAO', 'SDR', 'COMERCIAL'].includes(r),
    delete: sup,
  },
  {
    key: 'services',
    label: 'Serviços',
    category: 'Operacional',
    view: all,
    create: sup,
    edit: sup,
    delete: sup,
  },
  { key: 'chat', label: 'Chat', category: 'Operacional', view: all },
  { key: 'notifications', label: 'Notificações', category: 'Operacional', view: all },
  {
    key: 'partners',
    label: 'Parceiros',
    category: 'Operacional',
    view: canManagePartners,
    create: canRegisterPartners,
    edit: canEditPartners,
    delete: canDeletePartners,
  },
  {
    key: 'cadastros',
    label: 'Cadastros',
    category: 'Comercial',
    view: canViewConfiguracoes,
    create: canManageConfiguracoes,
    edit: canManageConfiguracoes,
    delete: canManageConfiguracoes,
  },
  {
    key: 'products',
    label: 'Produtos',
    category: 'Comercial',
    view: all,
    create: supPadrao,
    edit: supPadrao,
    delete: sup,
  },
  {
    key: 'sales',
    label: 'Vendas',
    category: 'Comercial',
    view: canViewSales,
    create: canViewSales,
    edit: canViewSales,
    delete: sup,
  },
  {
    key: 'stock',
    label: 'Estoque',
    category: 'Operacional',
    view: canViewStock,
    create: canMakeMovements,
    edit: canMakeAdjustments,
    delete: sup,
  },
  {
    key: 'contracts',
    label: 'Contratos',
    category: 'Comercial',
    view: canViewSales,
    create: canViewSales,
    edit: canViewSales,
    delete: sup,
  },
  {
    key: 'purchasing',
    label: 'Compras',
    category: 'Comercial',
    view: canViewPurchasing,
    create: canViewPurchasing,
    edit: canViewPurchasing,
    delete: sup,
  },
  {
    key: 'pricing',
    label: 'Precificação',
    category: 'Comercial',
    view: canConsultCosts,
    create: canConsultCosts,
    edit: canConsultCosts,
    delete: sup,
  },
  {
    key: 'price_tables',
    label: 'Tabelas de Preços',
    category: 'Comercial',
    view: canViewPriceTables,
    create: canCreatePriceTable,
    edit: canEditPriceTable,
    delete: sup,
  },
  {
    key: 'users',
    label: 'Usuários',
    category: 'Administração',
    view: canManageUsers,
    create: canManageUsers,
    edit: canManageUsers,
    delete: canManageUsers,
  },
  {
    key: 'cms',
    label: 'CMS',
    category: 'Administração',
    view: canManageCms,
    create: canManageCms,
    edit: canManageCms,
    delete: canManageCms,
  },
  { key: 'audit', label: 'Auditoria', category: 'Administração', view: canViewAuditLogs },
  {
    key: 'backups',
    label: 'Backups',
    category: 'Administração',
    view: canManageBackups,
    create: canManageBackups,
    edit: canManageBackups,
    delete: canManageBackups,
  },
  {
    key: 'ai_training',
    label: 'Treinamento IA',
    category: 'Administração',
    view: canManageAiTraining,
    create: canManageAiTraining,
    edit: canManageAiTraining,
    delete: canManageAiTraining,
  },
  {
    key: 'configuracoes',
    label: 'Configurações',
    category: 'Administração',
    view: canViewConfiguracoes,
    create: canManageConfiguracoes,
    edit: canManageConfiguracoes,
    delete: canManageConfiguracoes,
  },
]

export interface PermissionGap {
  screen: string
  issue: string
  severity: 'Baixa' | 'Média' | 'Alta' | 'Crítica'
  status: 'Corrigido' | 'Pendente'
  fix: string
}

export const IDENTIFIED_GAPS: PermissionGap[] = [
  {
    screen: 'Contratos',
    issue: 'Item do sidebar acessível sem verificação de permissão',
    severity: 'Média',
    status: 'Corrigido',
    fix: 'Adicionado canViewSales ao item',
  },
  {
    screen: 'Compras',
    issue: 'Item do sidebar acessível sem verificação de permissão',
    severity: 'Média',
    status: 'Corrigido',
    fix: 'Adicionado canViewPurchasing ao item',
  },
  {
    screen: 'Precificação',
    issue: 'Módulo sensível acessível sem verificação de permissão',
    severity: 'Alta',
    status: 'Corrigido',
    fix: 'Adicionado canConsultCosts ao item',
  },
  {
    screen: 'Usuários',
    issue: 'Módulo crítico acessível sem verificação de permissão',
    severity: 'Crítica',
    status: 'Corrigido',
    fix: 'Adicionado canManageUsers ao item',
  },
  {
    screen: 'CMS',
    issue: 'Módulo de conteúdo acessível sem verificação de permissão',
    severity: 'Alta',
    status: 'Corrigido',
    fix: 'Adicionado canManageCms ao item',
  },
  {
    screen: 'Auditoria',
    issue: 'Módulo sensível acessível sem verificação de permissão',
    severity: 'Alta',
    status: 'Corrigido',
    fix: 'Adicionado canViewAuditLogs ao item',
  },
  {
    screen: 'Backups',
    issue: 'Módulo crítico acessível sem verificação de permissão',
    severity: 'Crítica',
    status: 'Corrigido',
    fix: 'Adicionado canManageBackups ao item',
  },
  {
    screen: 'Treinamento IA',
    issue: 'Módulo acessível sem verificação de permissão',
    severity: 'Média',
    status: 'Corrigido',
    fix: 'Adicionado canManageAiTraining ao item',
  },
  {
    screen: 'Configurações',
    issue: 'Módulo crítico acessível sem verificação de permissão',
    severity: 'Crítica',
    status: 'Corrigido',
    fix: 'Adicionado canViewConfiguracoes ao item',
  },
  {
    screen: 'Tabelas de Preços',
    issue: 'Verificação de permissão já existente no sidebar',
    severity: 'Baixa',
    status: 'Corrigido',
    fix: 'Permissão confirmada e mantida',
  },
  {
    screen: 'Dados da Empresa',
    issue: 'Configuração sensível sem validação adicional na tela',
    severity: 'Alta',
    status: 'Corrigido',
    fix: 'Tela protegida por canViewConfiguracoes',
  },
]
