export function canManagePartners(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canManageRestrictions(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canRegisterPartners(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}

export function canEditPartners(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canDeletePartners(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewSales(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canViewStock(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canConsultCosts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canMakeMovements(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canCreateInventories(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canApproveInventories(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canCreateTransfers(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canApproveTransfers(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canMakeAdjustments(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canApproveAdjustments(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canBlockLots(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canUnblockLots(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canPickOrders(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR'].includes(role)
}

export function canCheckProducts(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canDispatchExpedition(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO'].includes(role)
}

export function canAllowNegativeStock(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canExportInfo(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canViewConfiguracoes(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}

/**
 * Permissão de visualização e gerenciamento de Agendamento de Relatórios.
 * Liberado para SUP e perfil Gestão (PADRAO), além de outros perfis com permissão específica.
 */
export function canViewReportSchedules(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'GESTAO', 'DIRETORIA'].includes(role)
}

/**
 * Verifica se o usuário tem autorização para consultar/agendar relatórios de determinado módulo do ERP.
 */
export function canUserAccessReportModule(role: string | undefined, moduleName: string): boolean {
  if (!role) return false
  if (role === 'SUP') return true

  switch (moduleName) {
    case 'Comercial':
      return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
    case 'Financeiro':
      return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
    case 'Estoque':
      return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
    case 'Logística':
      return ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO'].includes(role)
    case 'Fiscal':
      return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
    case 'DP & RH':
      return ['SUP', 'PADRAO', 'RH', 'DP'].includes(role)
    case 'Compras':
      return ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO'].includes(role)
    default:
      return ['SUP', 'PADRAO'].includes(role)
  }
}

export function canManageConfiguracoes(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewAuditLogs(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canManageIntegrations(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageBackups(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageApis(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManagePermissions(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageSystemParams(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageUsers(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewUserAuditHistory(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewUserPreciseCoords(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canTerminateUserSessions(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canExportUserAudit(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageRetentionPolicy(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canManageCms(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP'].includes(role)
}

export function canManageAiTraining(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canChangeAiSettings(role: string | undefined): boolean {
  return role === 'SUP'
}

/**
 * Permissão específica para a Central de Configurações do Jetro On-line
 * Apenas administradores e supervisores autorizados.
 */
export function canManageJetroOnline(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'ADMIN'].includes(role)
}

/**
 * Permissão para telas técnicas de infraestrutura/template da plataforma (Phase0 Foundation e Platform Layer).
 * Restrito exclusivamente ao perfil SUP (Superusuário / Desenvolvedor).
 * Oculto para usuários do perfil Gestão (PADRAO) e outros perfis operacionais.
 */
export function canViewPlatformInfra(role: string | undefined): boolean {
  if (!role) return false
  return role === 'SUP'
}

export function canViewFiscal(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canViewPurchasing(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}

export function canViewBudgets(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canViewChat(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canViewAiModule(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canApprove(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}

export function canCancelCritical(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}

export function canReverse(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canSettle(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canExportData(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canImportData(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO'].includes(role)
}

export function canReopenPeriod(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canViewSensitiveData(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canAccessReports(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

export function canAdminSettings(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canDeleteCritical(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canChangePermissions(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canDisableMfa(role: string | undefined): boolean {
  return role === 'SUP'
}

export function canChangeCost(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO'].includes(role)
}

export function canChangePrice(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL'].includes(role)
}

export function canViewConformidade(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

/**
 * Permissão para acessar o módulo "Segundo Cérebro da Empresa".
 * Acesso geral ao módulo: Gestão, Diretoria, Comercial e Financeiro.
 */
export function canViewSegundoCerebro(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

/**
 * Permissão para consultar documentos gerais e base de conhecimento.
 */
export function canConsultSegundoCerebroDocs(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

/**
 * Permissão para interagir com o Assistente de IA do Segundo Cérebro.
 */
export function canUseSegundoCerebroAI(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

/**
 * Permissão para visualizar informações estratégicas (Conselheiro, Radar e Insights).
 */
export function canViewStrategicIntelligence(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

/**
 * Permissão para acessar documentos confidenciais no Segundo Cérebro.
 */
export function canViewConfidentialDocs(role: string | undefined): boolean {
  if (!role) return false
  return role === 'SUP'
}

/**
 * Permissão para administrar integrações (conectar Obsidian, upload de cofres).
 */
export function canAdminSegundoCerebroIntegrations(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'COMERCIAL', 'FINANCEIRO'].includes(role)
}

/**
 * Permissão para acessar a Central de Documentação Técnica e o Drawer de Lógica da Tela.
 * Exclusivo para usuários autorizados: perfil SUP (Superusuário / Administrador / TI).
 */
export function canViewScreenDocs(role: string | undefined): boolean {
  if (!role) return false
  return role === 'SUP'
}

/**
 * Permissão para visualizar o módulo "Planilhas Convertidas" e Comparativo Margens GR.
 * Acessível a perfis operacionais de custos, comercial, financeiro e supervisores.
 */
export function canViewPlanilhasConvertidas(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

/**
 * Permissão específica para a tela Tabela Mãe GR
 */
export function canViewPlanilhasTabelaMaeGr(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}

/**
 * Permissão para editar células e fórmulas nas Planilhas Convertidas
 */
export function canEditPlanilhasConvertidas(role: string | undefined): boolean {
  if (!role) return false
  return ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)
}
