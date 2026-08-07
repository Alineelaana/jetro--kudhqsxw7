import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getAuthorizationLevel,
  getOrganizationalScope,
  canAccessEmpresa,
  canAccessFilial,
  type AuthorizationLevel,
  type OrganizationalScope,
} from '@/lib/auth-model'

interface AuthorizationContextType {
  level: AuthorizationLevel
  scope: OrganizationalScope
  empresaId: string
  filialId: string
  canAccessEmpresa: (empresaId: string) => boolean
  canAccessFilial: (filialId: string) => boolean
  isGlobal: boolean
}

const AuthorizationContext = createContext<AuthorizationContextType | undefined>(undefined)

export function useAuthorization() {
  const ctx = useContext(AuthorizationContext)
  if (!ctx) throw new Error('useAuthorization must be used within AuthorizationProvider')
  return ctx
}

export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const value = useMemo<AuthorizationContextType>(() => {
    const userRecord = user as Record<string, unknown> | null
    const level = getAuthorizationLevel(userRecord?.role as string)
    const scope = getOrganizationalScope(userRecord)
    const empresaId = (userRecord?.empresa_id as string) || ''
    const filialId = (userRecord?.filial_id as string) || ''

    return {
      level,
      scope,
      empresaId,
      filialId,
      canAccessEmpresa: (eid: string) => canAccessEmpresa(userRecord, eid),
      canAccessFilial: (fid: string) => canAccessFilial(userRecord, fid),
      isGlobal: scope === 'ALL',
    }
  }, [user])

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>
}
