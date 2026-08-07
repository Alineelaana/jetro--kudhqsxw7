import {
  VERBAS_PERMISSION_KEY,
  VERBAS_PERMISSION_SCREENS,
  VERBAS_PERMISSION_ACTIONS,
} from '@/lib/verbas-permission-screens'
import { VERBAS_SEARCH_ENTITIES } from '@/lib/verbas-search-entities'
import {
  canViewSA,
  canCreateAgreements,
  canEditAgreements,
  canDeleteAgreements,
  canAccrue,
  canApproveAccrual,
  canSettle,
  canApproveSettlement,
  canConsume,
  canAppropriate,
  canExportSA,
} from '@/lib/supplier-allowance-permissions'

export const VERBAS_MODULE_CONFIG = {
  key: VERBAS_PERMISSION_KEY,
  label: 'Verbas de Fornecedores',
  icon: 'HandCoins',
  route: '/admin/verbas',
  section: 'Financeiro',
  permissionFn: canViewSA,
  screens: VERBAS_PERMISSION_SCREENS,
  actions: VERBAS_PERMISSION_ACTIONS,
  searchEntities: VERBAS_SEARCH_ENTITIES,
  rolePermissions: {
    SUP: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      approve: true,
      settle: true,
      export: true,
      admin: true,
      config: true,
    },
    FINANCEIRO: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      approve: false,
      settle: true,
      export: true,
      admin: false,
      config: false,
    },
    COMERCIAL: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      approve: true,
      settle: true,
      export: true,
      admin: true,
      config: false,
    },
    PADRAO: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      approve: false,
      settle: true,
      export: true,
      admin: false,
      config: false,
    },
    SDR: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      approve: false,
      settle: false,
      export: false,
      admin: false,
      config: false,
    },
    Vendedor: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      approve: false,
      settle: false,
      export: false,
      admin: false,
      config: false,
    },
  },
  permissionFunctions: {
    canViewSA,
    canCreateAgreements,
    canEditAgreements,
    canDeleteAgreements,
    canAccrue,
    canApproveAccrual,
    canSettle,
    canApproveSettlement,
    canConsume,
    canAppropriate,
    canExportSA,
  },
} as const

export type VerbasRole = keyof typeof VERBAS_MODULE_CONFIG.rolePermissions

export function getVerbasRolePermissions(role: string | undefined) {
  if (!role) return null
  return VERBAS_MODULE_CONFIG.rolePermissions[role as VerbasRole] || null
}
