import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: Record<string, unknown> | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (username: string, password: string) => Promise<{ error: string | null }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

const ADMIN_EMAIL = 'veloralog@veloralog.com'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Record<string, unknown> | null>(
    pb.authStore.isValid ? (pb.authStore.record as Record<string, unknown>) : null,
  )
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? (record as Record<string, unknown>) : null)
      setIsAuthenticated(pb.authStore.isValid)
    })
    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch(() => pb.authStore.clear())
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setLoading(false)
    }
    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (username: string, password: string) => {
    const email = username.trim() === 'veloralog' ? ADMIN_EMAIL : username.trim()
    try {
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error: unknown) {
      const err = error as { status?: number }
      if (err?.status === 0) {
        return { error: 'Erro de conexão. Verifique sua internet e tente novamente.' }
      }
      return { error: 'Credenciais inválidas. Verifique usuário e senha.' }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  const isAdmin = isAuthenticated && (user?.email as string) === ADMIN_EMAIL

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
