export interface BaselineRoute {
  route: string
  label: string
  group: string
  classification: 'A' | 'C'
}

export const NAVIGATION_BASELINE: BaselineRoute[] = [
  { route: '/admin', label: 'Dashboard', group: 'Principal', classification: 'A' },
  { route: '/admin/notificacoes', label: 'Notificações', group: 'Principal', classification: 'A' },
  { route: '/admin/atendimento', label: 'Atendimento', group: 'Principal', classification: 'A' },
  { route: '/admin/vendas', label: 'Vendas', group: 'Comercial', classification: 'A' },
  { route: '/admin/produtos', label: 'Produtos', group: 'Comercial', classification: 'A' },
  { route: '/admin/cadastros', label: 'Cadastros', group: 'Comercial', classification: 'A' },
  {
    route: '/admin/tabelas-precos',
    label: 'Tabelas de Preços',
    group: 'Comercial',
    classification: 'A',
  },
  { route: '/admin/crm', label: 'CRM', group: 'Comercial', classification: 'A' },
  { route: '/admin/promocoes', label: 'Promoções', group: 'Comercial', classification: 'A' },
  { route: '/admin/financeiro', label: 'Financeiro', group: 'Financeiro', classification: 'A' },
  { route: '/admin/logistica', label: 'Logística', group: 'Operação', classification: 'A' },
  { route: '/admin/estoque', label: 'Estoque', group: 'Operação', classification: 'A' },
  { route: '/admin/industria', label: 'Indústria', group: 'Operação', classification: 'A' },
  { route: '/admin/fiscal', label: 'Fiscal', group: 'Fiscal & RH', classification: 'A' },
  {
    route: '/admin/conformidade',
    label: 'Conformidade',
    group: 'Fiscal & RH',
    classification: 'A',
  },
  { route: '/admin/rh', label: 'Recursos Humanos', group: 'Fiscal & RH', classification: 'A' },
  { route: '/admin/dp', label: 'Departamento Pessoal', group: 'Fiscal & RH', classification: 'A' },
  { route: '/admin/sst', label: 'SST', group: 'Fiscal & RH', classification: 'A' },
  { route: '/admin/bi', label: 'BI', group: 'Inteligência', classification: 'A' },
  {
    route: '/admin/ia/dashboard',
    label: 'Inteligência Artificial',
    group: 'Inteligência',
    classification: 'A',
  },
  {
    route: '/admin/remuneracao',
    label: 'Remuneração Variável',
    group: 'Inteligência',
    classification: 'A',
  },
  {
    route: '/admin/configuracoes',
    label: 'Configurações',
    group: 'Administração',
    classification: 'A',
  },
  {
    route: '/admin/phase0-foundation',
    label: 'Phase0 Foundation',
    group: 'Administração',
    classification: 'A',
  },
  {
    route: '/admin/platform-layer',
    label: 'Platform Layer',
    group: 'Administração',
    classification: 'A',
  },
  {
    route: '/admin/precificacao',
    label: 'Precificação',
    group: 'Comercial',
    classification: 'A',
  },
  {
    route: '/admin/auditoria',
    label: 'Auditoria',
    group: 'Administração',
    classification: 'A',
  },
  {
    route: '/admin/controladoria',
    label: 'Controladoria',
    group: 'Inteligência',
    classification: 'A',
  },
  {
    route: '/admin/verbas-fornecedores',
    label: 'Verbas de Fornecedores',
    group: 'Financeiro',
    classification: 'A',
  },
]

export const STABLE_ROUTES: string[] = NAVIGATION_BASELINE.filter(
  (r) => r.classification === 'A',
).map((r) => r.route)

export const ALL_ALLOWED_ROUTES: string[] = NAVIGATION_BASELINE.map((r) => r.route)

export const STABLE_PERMISSION_KEYS: string[] = [
  'dashboard',
  'budgets',
  'services',
  'chat',
  'notifications',
  'partners',
  'cadastros',
  'products',
  'sales',
  'stock',
  'contracts',
  'purchasing',
  'pricing',
  'price_tables',
  'users',
  'cms',
  'audit',
  'backups',
  'ai_training',
  'configuracoes',
  'ai_module',
  'wms_consultar',
  'wms_recebimento',
  'wms_conferencia',
  'wms_aprovar_divergencia',
  'wms_enderecamento',
  'wms_armazenagem',
  'wms_reabastecimento',
  'wms_criar_ondas',
  'wms_liberar_ondas',
  'wms_separar',
  'wms_conferir_expedicao',
  'wms_liberar_expedicao',
  'wms_inventario',
  'wms_aprovar_inventario',
  'wms_transferencias',
  'wms_bloquear_lotes',
  'wms_liberar_lotes',
  'wms_custos',
  'wms_exportar',
  'wms_parametros',
  'log_consultar',
  'log_criar_rotas',
  'log_alterar_rotas',
  'log_planejar',
  'log_liberar_carregamento',
  'log_confirmar_saida',
  'log_atualizar_entregas',
  'log_registrar_ocorrencias',
  'log_aprovar_fretes',
  'log_alterar_valores_frete',
  'log_cadastrar_veiculos',
  'log_cadastrar_motoristas',
  'log_consultar_custos',
  'log_consultar_rastreamento',
  'log_consultar_comprovantes',
  'log_cancelar_entregas',
  'log_exportar',
  'fin_consultar',
  'fin_saldos',
  'fin_custos',
  'fin_criar_titulos',
  'fin_editar_titulos',
  'fin_aprovar_pagamentos',
  'fin_realizar_pagamentos',
  'fin_realizar_recebimentos',
  'fin_aplicar_descontos',
  'fin_alterar_vencimentos',
  'fin_renegociar',
  'fin_estornar',
  'fin_cancelar',
  'fin_emitir_boletos',
  'fin_gerar_pix',
  'fin_conciliar',
  'fin_abrir_caixa',
  'fin_fechar_caixa',
  'fin_reabrir_periodo',
  'fin_exportar',
  'fin_todas_empresas',
  'ind_access',
  'ind_engineering',
  'ind_production',
  'ind_planning',
  'ind_costs',
  'ind_quality',
  'ind_maintenance',
  'ind_kpis',
  'ind_traceability',
  'ind_executive',
]

export const RECOVERED_ROUTES: string[] = [
  '/admin/precificacao',
  '/admin/auditoria',
  '/admin/controladoria',
  '/admin/verbas-fornecedores',
]

export const ALLOWED_ADDITION_PREFIXES: string[] = []

export function isAllowedAddition(_key: string): boolean {
  return false
}

export function isAllowedRoute(route: string): boolean {
  if (ALL_ALLOWED_ROUTES.includes(route)) return true
  return ALL_ALLOWED_ROUTES.some((base) => route.startsWith(base + '/'))
}
