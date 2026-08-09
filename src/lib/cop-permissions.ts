import pb from '@/lib/pocketbase/client'

export const COP_PROFILES = [
  'TI Operacional',
  'Suporte',
  'DevOps',
  'Segurança',
  'Engenharia',
  'Administrador da Plataforma',
] as const

export type CopProfile = (typeof COP_PROFILES)[number]

const AREA_ACCESS: Record<string, string[]> = {
  cockpit: [
    'TI Operacional',
    'Suporte',
    'DevOps',
    'Segurança',
    'Engenharia',
    'Administrador da Plataforma',
  ],
  errors: ['TI Operacional', 'Suporte', 'DevOps', 'Engenharia', 'Administrador da Plataforma'],
  migrations: ['Engenharia', 'DevOps', 'Administrador da Plataforma'],
  releases: ['DevOps', 'Administrador da Plataforma'],
  backups: ['TI Operacional', 'DevOps', 'Administrador da Plataforma'],
  security: ['Segurança', 'Administrador da Plataforma'],
}

export function getUserPerfilAcesso(): string | undefined {
  const user = pb.authStore.record as Record<string, unknown> | null
  return user?.perfil_acesso as string | undefined
}

export function canAccessCopMenu(role: string | undefined): boolean {
  if (role === 'SUP') return true
  const perfil = getUserPerfilAcesso()
  if (!perfil) return false
  return (COP_PROFILES as readonly string[]).includes(perfil)
}

export function canAccessCop(role: string | undefined, perfilAcesso: string | undefined): boolean {
  if (role === 'SUP') return true
  if (!perfilAcesso) return false
  return (COP_PROFILES as readonly string[]).includes(perfilAcesso)
}

export function canAccessCopArea(
  area: string,
  role: string | undefined,
  perfilAcesso: string | undefined,
): boolean {
  if (role === 'SUP') return true
  const allowed = AREA_ACCESS[area] || []
  if (!perfilAcesso) return false
  return allowed.includes(perfilAcesso)
}

export function canPromoteRelease(
  role: string | undefined,
  perfilAcesso: string | undefined,
): boolean {
  if (role === 'SUP') return true
  return perfilAcesso === 'DevOps' || perfilAcesso === 'Administrador da Plataforma'
}

export function canRestoreBackup(
  role: string | undefined,
  perfilAcesso: string | undefined,
): boolean {
  if (role === 'SUP') return true
  return perfilAcesso === 'Administrador da Plataforma'
}

export function canManageSecurity(
  role: string | undefined,
  perfilAcesso: string | undefined,
): boolean {
  if (role === 'SUP') return true
  return perfilAcesso === 'Segurança' || perfilAcesso === 'Administrador da Plataforma'
}
