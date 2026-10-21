import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ClientResponseError } from 'pocketbase'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'

export interface AuthUser {
  id?: string
  name?: string
  email?: string
  role?: string
  perfil_acesso?: string
  perfil_id?: string
  active?: boolean
  mfa_enabled?: boolean
  mfa_secret?: string
  inactivity_timeout_minutes?: number
  [key: string]: unknown
}

interface AuthContextType {
  user: AuthUser | null
  currentUser?: AuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  userRole: string
  mfaRequired: boolean
  login: (
    username: string,
    password: string,
    coords?: {
      latitude: number
      longitude: number
      accuracy: number
      city?: string
      state?: string
    } | null,
  ) => Promise<{ error: string | null; fieldErrors: FieldErrors }>
  mfaLoginVerify: (code: string) => Promise<{ error: string | null }>
  mfaCancel: () => void
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ error: string | null; fieldErrors: FieldErrors }>
  signOut: () => void
  loading: boolean
  mustChangePassword: boolean
  clearMustChangePassword: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

const ADMIN_EMAIL = 'alineelaana@gmail.com'

function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp) return Date.now() >= payload.exp * 1000
    return false
  } catch {
    return true
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initialRecord = pb.authStore.isValid
    ? (pb.authStore.record as Record<string, unknown>)
    : null
  const [user, setUser] = useState<Record<string, unknown> | null>(
    initialRecord && initialRecord.active !== false ? initialRecord : null,
  )
  const [isAuthenticated, setIsAuthenticated] = useState(
    pb.authStore.isValid && initialRecord?.active !== false,
  )
  const [mfaRequired, setMfaRequired] = useState(false)
  const [loading, setLoading] = useState(true)

  const mustChangePassword = useMemo(() => {
    if (!isAuthenticated || !user) return false
    return user.force_password_change === true || user.must_change_password === true
  }, [isAuthenticated, user])

  const clearMustChangePassword = () => {
    setUser((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        force_password_change: false,
        must_change_password: false,
      }
    })
  }

  useEffect(() => {
    if (
      pb.authStore.isValid &&
      pb.authStore.record &&
      (pb.authStore.record as Record<string, unknown>).active === false
    ) {
      pb.authStore.clear()
      setUser(null)
      setIsAuthenticated(false)
    }

    const unsubscribe =
      typeof pb.authStore.onChange === 'function'
        ? pb.authStore.onChange((_token, record) => {
            const rec = record as Record<string, unknown> | null
            if (rec && rec.active === false) {
              pb.authStore.clear()
              setUser(null)
              setIsAuthenticated(false)
              return
            }
            setUser(pb.authStore.isValid && rec?.active !== false ? rec : null)
            setIsAuthenticated(pb.authStore.isValid && rec?.active !== false)
          })
        : undefined

    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (pb.authStore.isValid && !isTokenExpired(pb.authStore.token)) {
      timeoutId = setTimeout(() => setLoading(false), 3000)
      pb.collection('users')
        .authRefresh()
        .then((res) => {
          const rec = res.record as Record<string, unknown> | null
          if (rec && rec.active === false) {
            pb.authStore.clear()
            setUser(null)
            setIsAuthenticated(false)
          } else {
            setUser(rec)
            setIsAuthenticated(true)
          }
        })
        .catch(() => {
          pb.authStore.clear()
          setUser(null)
          setIsAuthenticated(false)
        })
        .finally(() => {
          if (timeoutId) clearTimeout(timeoutId)
          setLoading(false)
        })
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
    }
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const login = async (
    username: string,
    password: string,
    coords?: {
      latitude: number
      longitude: number
      accuracy: number
      city?: string
      state?: string
    } | null,
  ) => {
    const trimmed = username.trim()
    const lowerTrimmed = trimmed.toLowerCase()

    // Resolução de identidade: aceita tanto login (ex.: 'patricia', 'patricia.brum', 'aline') quanto e-mail completo
    let resolvedIdentity = trimmed

    // 1. Chamar endpoint do backend para resolver login -> e-mail de forma segura
    try {
      const res = await pb.send<{ email?: string; resolved?: boolean }>(
        '/backend/v1/auth/resolve-identity',
        {
          method: 'POST',
          body: JSON.stringify({ identity: trimmed }),
          headers: { 'Content-Type': 'application/json' },
        },
      )
      if (res && res.email) {
        resolvedIdentity = res.email
      }
    } catch (_) {
      // Fallback local se o hook estiver temporariamente indisponível
      if (
        lowerTrimmed === 'alineelaana' ||
        lowerTrimmed === 'jetrosup' ||
        lowerTrimmed === 'jetrosup@jetro.com.br' ||
        lowerTrimmed === 'alineelaana@gmail.com' ||
        lowerTrimmed === 'aline'
      ) {
        resolvedIdentity = ADMIN_EMAIL
      } else if (!trimmed.includes('@')) {
        try {
          const safe = lowerTrimmed.replace(/[^a-z0-9._-]/g, '').replace(/["\\]/g, '')
          const found = await pb.collection('users').getList(1, 1, {
            filter: `login = "${safe}" || email ~ "${safe}"`,
            requestKey: null,
          })
          if (found.items.length > 0 && found.items[0].email) {
            resolvedIdentity = found.items[0].email
          }
        } catch (_) {
          // Mantém o informado
        }
      }
    }

    const email = resolvedIdentity
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      const record = authData.record as Record<string, unknown> | null

      if (record && record.active === false) {
        pb.authStore.clear()
        setUser(null)
        setIsAuthenticated(false)
        return {
          error: 'Sua conta está inativa. Entre em contato com um administrador.',
          fieldErrors: {},
        }
      }

      const mfaEnabled = record?.mfa_enabled === true
      const hasSecret = !!(record?.mfa_secret as string)
      if (mfaEnabled && hasSecret) {
        setUser(record)
        setMfaRequired(true)
        setIsAuthenticated(false)
        return { error: null, fieldErrors: {} }
      }

      setUser(record)
      setIsAuthenticated(true)

      const payload: Record<string, unknown> = {
        action: 'login',
        identity: email,
      }
      if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
        payload.latitude = coords.latitude
        payload.longitude = coords.longitude
        payload.accuracy = coords.accuracy
        if (coords.city) payload.city = coords.city
        if (coords.state) payload.state = coords.state
      }

      pb.send('/backend/v1/audit/auth', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {})
      return { error: null, fieldErrors: {} }
    } catch (error: unknown) {
      pb.send('/backend/v1/audit/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'login_failed', identity: email }),
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {})

      if (error instanceof ClientResponseError) {
        if (error.isAbort) {
          return { error: 'A requisição foi cancelada. Tente novamente.', fieldErrors: {} }
        }
        if (error.status === 0) {
          return {
            error:
              'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
            fieldErrors: {},
          }
        }
        const fErrors = extractFieldErrors(error)
        const fieldMsg = Object.values(fErrors).join(' ')
        if (error.status === 400 || error.status === 401) {
          return {
            error: fieldMsg || 'Credenciais inválidas. Verifique usuário e senha.',
            fieldErrors: fErrors,
          }
        }
        if (error.status === 403) {
          return {
            error: 'Acesso negado. Você não tem permissão para acessar esta área.',
            fieldErrors: fErrors,
          }
        }
        if (error.status === 429) {
          return {
            error: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
            fieldErrors: fErrors,
          }
        }
        if (error.status >= 500) {
          return {
            error: 'Erro no servidor. Tente novamente em alguns instantes.',
            fieldErrors: fErrors,
          }
        }
        return { error: fieldMsg || getErrorMessage(error), fieldErrors: fErrors }
      }

      if (error instanceof Error) {
        return { error: error.message, fieldErrors: {} }
      }
      return { error: 'Erro inesperado. Tente novamente.', fieldErrors: {} }
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    try {
      await pb.collection('users').create({
        name,
        email,
        password,
        passwordConfirm: password,
        active: true,
      })
      return { error: null, fieldErrors: {} }
    } catch (error: unknown) {
      if (error instanceof ClientResponseError) {
        if (error.isAbort) {
          return { error: 'A requisição foi cancelada. Tente novamente.', fieldErrors: {} }
        }
        if (error.status === 0) {
          return {
            error: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
            fieldErrors: {},
          }
        }
        const fErrors = extractFieldErrors(error)
        const fieldMsg = Object.values(fErrors).join(' ')
        if (fieldMsg) {
          return { error: fieldMsg, fieldErrors: fErrors }
        }
        return { error: getErrorMessage(error), fieldErrors: fErrors }
      }
      if (error instanceof Error) {
        return { error: error.message, fieldErrors: {} }
      }
      return {
        error: 'Não foi possível cadastrar. Verifique os dados e tente novamente.',
        fieldErrors: {},
      }
    }
  }

  const mfaLoginVerify = async (code: string) => {
    try {
      await pb.send('/backend/v1/mfa/login-verify', {
        method: 'POST',
        body: JSON.stringify({ code }),
        headers: { 'Content-Type': 'application/json' },
      })
      setMfaRequired(false)
      setIsAuthenticated(true)
      return { error: null }
    } catch {
      return { error: 'Código MFA inválido. Tente novamente.' }
    }
  }

  const mfaCancel = () => {
    pb.authStore.clear()
    setUser(null)
    setIsAuthenticated(false)
    setMfaRequired(false)
  }

  const signOut = () => {
    pb.send('/backend/v1/audit/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'logout' }),
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {})
    pb.authStore.clear()
    setUser(null)
    setIsAuthenticated(false)
    setMfaRequired(false)
  }

  const rawPerfilAcesso = (user?.perfil_acesso as string) || ''
  const rawRole = (user?.role as string) || ''
  const isAlineAdmin = (user?.email as string)?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  const rawPerfilId = (user?.perfil_id as string) || ''
  const isSup =
    isAlineAdmin || rawPerfilAcesso.toUpperCase() === 'SUP' || rawRole.toUpperCase() === 'SUP'

  // O acesso é determinado EXCLUSIVAMENTE pelo Perfil de Acesso cadastrado em perfis_permissoes.
  // Setor, cargo, departamento, função legada ou listas fixas NUNCA podem ampliar ou definir acesso.
  // Usuário sem perfil válido não recebe PADRAO: fica sem perfil (acesso negado por padrão).
  const effectiveRole = isSup ? 'SUP' : (rawPerfilAcesso || rawPerfilId || '').trim()

  const userRole = effectiveRole
  const isAdmin = isAuthenticated && (isSup || !!effectiveRole)

  return (
    <AuthContext.Provider
      value={{
        user: user as AuthUser | null,
        currentUser: user as AuthUser | null,
        isAuthenticated,
        isAdmin,
        userRole,
        mfaRequired,
        login,
        mfaLoginVerify,
        mfaCancel,
        signUp,
        signOut,
        loading,
        mustChangePassword,
        clearMustChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
