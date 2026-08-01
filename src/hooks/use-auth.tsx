import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: Record<string, unknown> | null
  isAuthenticated: boolean
  isAdmin: boolean
  userRole: string
  login: (username: string, password: string) => Promise<{ error: string | null }>
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>
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

    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (pb.authStore.isValid) {
      timeoutId = setTimeout(() => setLoading(false), 5000)
      pb.collection('users')
        .authRefresh()
        .catch(() => pb.authStore.clear())
        .finally(() => {
          if (timeoutId) clearTimeout(timeoutId)
          setLoading(false)
        })
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setLoading(false)
    }
    return () => {
      unsubscribe()
      if (timeoutId) clearTimeout(timeoutId)
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

  const signUp = async (name: string, email: string, password: string) => {
    try {
      await pb.collection('users').create({
        name,
        email,
        password,
        passwordConfirm: password,
      })
      return { error: null }
    } catch (error: unknown) {
      const err = error as {
        status?: number
        response?: { data?: { email?: { message?: string }; password?: { message?: string } } }
      }
      if (err?.status === 0) return { error: 'Erro de conexão. Verifique sua internet.' }
      if (err?.response?.data?.email) return { error: 'Este e-mail já está cadastrado.' }
      if (err?.response?.data?.password)
        return { error: 'A senha deve ter no mínimo 8 caracteres.' }
      return { error: 'Não foi possível cadastrar. Verifique os dados e tente novamente.' }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  const userRole =
    (user?.role as string) || ((user?.email as string) === ADMIN_EMAIL ? 'SUP' : 'PADRAO')
  const isAdmin = isAuthenticated && userRole === 'SUP'

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isAdmin, userRole, login, signUp, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
