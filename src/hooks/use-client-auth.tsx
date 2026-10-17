import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import pbClient from '@/lib/pocketbase/client-client'

interface ClientAuthContextType {
  client: Record<string, unknown> | null
  isAuthenticated: boolean
  isClientAuthenticated: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ error: unknown }>
  signIn: (email: string, password: string) => Promise<{ error: unknown }>
  signOut: () => void
  clientLogin: (email: string, password: string) => Promise<{ error: string | null }>
  clientLogout: () => void
  loading: boolean
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined)

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext)
  if (!context) throw new Error('useClientAuth must be used within ClientAuthProvider')
  return context
}

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

export const ClientAuthProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<Record<string, unknown> | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    try {
      if (typeof pbClient.authStore.onChange === 'function') {
        unsubscribe = pbClient.authStore.onChange((_token, record) => {
          const rec = record as Record<string, unknown> | null
          const isClient = rec?.collectionName === 'clients'
          setClient(isClient ? rec : null)
          setIsAuthenticated(isClient && pbClient.authStore.isValid)
        })
      }
    } catch {
      /* onChange not supported — skip safely */
    }

    const record = pbClient.authStore.record as Record<string, unknown> | null
    const isClientRecord = record?.collectionName === 'clients'
    const tokenValid = pbClient.authStore.isValid && !isTokenExpired(pbClient.authStore.token)

    if (tokenValid && isClientRecord) {
      pbClient
        .collection('clients')
        .authRefresh()
        .then((res) => {
          const rec = res.record as Record<string, unknown> | null
          const isClient = rec?.collectionName === 'clients'
          setClient(isClient ? rec : null)
          setIsAuthenticated(isClient)
        })
        .catch(() => {
          pbClient.authStore.clear()
          setClient(null)
          setIsAuthenticated(false)
        })
        .finally(() => setLoading(false))
    } else {
      if (!tokenValid && pbClient.authStore.record) {
        pbClient.authStore.clear()
      }
      setClient(null)
      setIsAuthenticated(false)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe()
        } catch {
          /* intentionally ignored */
        }
      }
    }
  }, [])

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const data: Record<string, unknown> = { email, password, passwordConfirm: password }
      if (name) data.name = name
      await pbClient.collection('clients').create(data)
      await pbClient.collection('clients').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await pbClient.collection('clients').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const clientLogin = async (
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    try {
      await pbClient.collection('clients').authWithPassword(email, password)
      return { error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha na autenticação'
      return { error: msg }
    }
  }

  const signOut = () => {
    pbClient.authStore.clear()
    setClient(null)
    setIsAuthenticated(false)
  }

  const clientLogout = () => {
    signOut()
  }

  return (
    <ClientAuthContext.Provider
      value={{
        client,
        isAuthenticated,
        isClientAuthenticated: isAuthenticated,
        signUp,
        signIn,
        signOut,
        clientLogin,
        clientLogout,
        loading,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  )
}
