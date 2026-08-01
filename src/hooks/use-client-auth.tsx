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
  const initialRecord = pbClient.authStore.isValid ? pbClient.authStore.record : null
  const initialIsClient = pbClient.authStore.isValid && isClientRecord(initialRecord)

  const [client, setClient] = useState<Record<string, unknown> | null>(
    initialIsClient ? (initialRecord as Record<string, unknown>) : null,
  )
  const [isClientAuthenticated, setIsClientAuthenticated] = useState(initialIsClient)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    if (typeof pbClient.authStore.onChange === 'function') {
      unsubscribe = pbClient.authStore.onChange((_token, record) => {
        const isValid = pbClient.authStore.isValid && isClientRecord(record)
        setClient(isValid ? (record as Record<string, unknown>) : null)
        setIsClientAuthenticated(isValid)
      })
    }

    const currentRecord = pbClient.authStore.record
    const isValidClient = pbClient.authStore.isValid && isClientRecord(currentRecord)

    if (isValidClient && !isTokenExpired(pbClient.authStore.token)) {
      pbClient
        .collection('clients')
        .authRefresh()
        .catch((err: unknown) => {
          const status = (err as { status?: number })?.status
          if (status === 403 || status === 401) {
            pbClient.authStore.clear()
            setClient(null)
            setIsClientAuthenticated(false)
          }
        })
        .finally(() => setLoading(false))
    } else {
      if (pbClient.authStore.isValid) {
        pbClient.authStore.clear()
        setClient(null)
        setIsClientAuthenticated(false)
      }
      setLoading(false)
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
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
