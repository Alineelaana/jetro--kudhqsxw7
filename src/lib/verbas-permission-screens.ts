export const VERBAS_PERMISSION_KEY = 'supplier_allowances'

export type VerbasPermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'settle'
  | 'export'
  | 'admin'
  | 'config'

export interface VerbasPermissionScreen {
  key: string
  label: string
  route: string
  actions: VerbasPermissionAction[]
}

export const VERBAS_PERMISSION_ACTIONS: { key: VerbasPermissionAction; label: string }[] = [
  { key: 'view', label: 'Visualizar' },
  { key: 'create', label: 'Cadastrar' },
  { key: 'edit', label: 'Editar' },
  { key: 'delete', label: 'Excluir' },
  { key: 'approve', label: 'Aprovar' },
  { key: 'settle', label: 'Liquidar' },
  { key: 'export', label: 'Exportar' },
  { key: 'admin', label: 'Administrar' },
  { key: 'config', label: 'Configurar' },
]

export const VERBAS_PERMISSION_SCREENS: VerbasPermissionScreen[] = [
  { key: 'cockpit', label: 'Cockpit', route: '/admin/verbas/cockpit', actions: ['view'] },
  {
    key: 'acordos',
    label: 'Acordos',
    route: '/admin/verbas/acordos',
    actions: ['view', 'create', 'edit', 'delete', 'admin'],
  },
  {
    key: 'conta-corrente',
    label: 'Conta Corrente',
    route: '/admin/verbas/conta-corrente',
    actions: ['view', 'export'],
  },
  {
    key: 'movimentacoes',
    label: 'Movimentações',
    route: '/admin/verbas/movimentacoes',
    actions: ['view', 'create', 'export'],
  },
  {
    key: 'apuracoes',
    label: 'Apurações',
    route: '/admin/verbas/apuracoes',
    actions: ['view', 'approve', 'export'],
  },
  {
    key: 'apropriacoes',
    label: 'Apropriações',
    route: '/admin/verbas/apropriacoes',
    actions: ['view', 'create', 'export'],
  },
  {
    key: 'consumos',
    label: 'Consumos',
    route: '/admin/verbas/consumos',
    actions: ['view', 'create', 'export'],
  },
  {
    key: 'liquidacoes',
    label: 'Liquidações',
    route: '/admin/verbas/liquidacoes',
    actions: ['view', 'settle', 'approve', 'export'],
  },
  {
    key: 'relatorios',
    label: 'Relatórios',
    route: '/admin/verbas/relatorios',
    actions: ['view', 'export'],
  },
  {
    key: 'configuracoes',
    label: 'Configurações',
    route: '/admin/verbas/configuracoes',
    actions: ['view', 'config'],
  },
]

export function buildVerbasPermissionKey(
  screenKey: string,
  action: VerbasPermissionAction,
): string {
  return `${VERBAS_PERMISSION_KEY}.${screenKey}.${action}`
}

export function hasVerbasPermission(
  permissions: Record<string, boolean> | null | undefined,
  screenKey: string,
  action: VerbasPermissionAction,
): boolean {
  if (!permissions) return false
  const key = buildVerbasPermissionKey(screenKey, action)
  return permissions[key] === true || permissions[`${VERBAS_PERMISSION_KEY}.${action}`] === true
}
