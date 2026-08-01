import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import pbClient from '@/lib/pocketbase/client-client'

interface ClientAuthContextType {
  client: Record<string, unknown> | null
  isClientAuthenticated: boolean
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

export const ClientAuthProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<Record<string, unknown> | null>(
    pbClient.authStore.isValid ? pbClient.authStore.record : null,
  )
  const [isClientAuthenticated, setIsClientAuthenticated] = useState(pbClient.authStore.isValid)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pbClient.authStore.onChange((_token, record) => {
      setClient(pbClient.authStore.isValid ? record : null)
      setIsClientAuthenticated(pbClient.authStore.isValid)
    })
    if (pbClient.authStore.isValid) {
      pbClient
        .collection('clients')
        .authRefresh()
        .catch(() => pbClient.authStore.clear())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
    return () => {
      unsubscribe()
    }
  }, [])

  const clientLogin = async (email: string, password: string) => {
    try {
      await pbClient.collection('clients').authWithPassword(email, password)
      return { error: null }
    } catch {
      return { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' }
    }
  }

  const clientLogout = () => {
    pbClient.authStore.clear()
    setClient(null)
    setIsClientAuthenticated(false)
  }

  return (
    <ClientAuthContext.Provider
      value={{ client, isClientAuthenticated, clientLogin, clientLogout, loading }}
    >
      {children}
    </ClientAuthContext.Provider>
  )
}
