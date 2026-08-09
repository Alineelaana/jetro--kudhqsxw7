const NETWORK_VIEW_ROLES = ['SUP', 'FINANCEIRO', 'COMERCIAL', 'PADRAO']
const NETWORK_MANAGE_ROLES = ['SUP', 'FINANCEIRO', 'COMERCIAL']
const NETWORK_ADMIN_ROLES = ['SUP', 'FINANCEIRO']

export function canViewNetworks(role: string | undefined): boolean {
  if (!role) return false
  return NETWORK_VIEW_ROLES.includes(role)
}

export function canCreateNetwork(role: string | undefined): boolean {
  if (!role) return false
  return NETWORK_MANAGE_ROLES.includes(role)
}

export function canLinkClientNetwork(role: string | undefined): boolean {
  if (!role) return false
  return NETWORK_MANAGE_ROLES.includes(role)
}

export function canUnlinkClientNetwork(role: string | undefined): boolean {
  if (!role) return false
  return NETWORK_MANAGE_ROLES.includes(role)
}

export function canEditNetwork(role: string | undefined): boolean {
  if (!role) return false
  return NETWORK_MANAGE_ROLES.includes(role)
}

export function canManageNetworkCreditPolicy(role: string | undefined): boolean {
  if (!role) return false
  return NETWORK_ADMIN_ROLES.includes(role)
}
