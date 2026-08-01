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

function isClientRecord(record: unknown): boolean {
  if (!record || typeof record !== 'object') return false
  const r = record as { collectionName?: string }
  return r.collectionName === 'clients'
}

export const ClientAuthProvider = ({ children }: { children: ReactNode }) => {
  const initialRecord = pbClient.authStore.isValid ? pbClient.authStore.record : null
  const initialIsClient = pbClient.authStore.isValid && isClientRecord(initialRecord)

  const [client, setClient] = useState<Record<string, unknown> | null>(
    initialIsClient ? (initialRecord as Record<string, unknown>) : null,
  )
  const [isClientAuthenticated, setIsClientAuthenticated] = useState(initialIsClient)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pbClient.authStore.onChange((_token, record) => {
      const isValid = pbClient.authStore.isValid && isClientRecord(record)
      setClient(isValid ? (record as Record<string, unknown>) : null)
      setIsClientAuthenticated(isValid)
    })

    const currentRecord = pbClient.authStore.record
    const isValidClient = pbClient.authStore.isValid && isClientRecord(currentRecord)

    if (isValidClient) {
      pbClient
        .collection('clients')
        .authRefresh()
        .catch(() => {
          pbClient.authStore.clear()
        })
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
