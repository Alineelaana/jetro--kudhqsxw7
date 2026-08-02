import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pbClient from '@/lib/pocketbase/client-client'

interface ClientAuthContextType {
  client: any
  isAuthenticated: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined)

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext)
  if (!context) throw new Error('useClientAuth must be used within ClientAuthProvider')
  return context
}

export const ClientAuthProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    if (typeof pbClient.authStore.onChange === 'function') {
      unsubscribe = pbClient.authStore.onChange((_token, record) => {
        const isClient = record?.collectionName === 'clients'
        setClient(isClient ? record : null)
        setIsAuthenticated(isClient && pbClient.authStore.isValid)
      })
    }

    const record = pbClient.authStore.record
    const isClientRecord = record?.collectionName === 'clients'

    if (pbClient.authStore.isValid && isClientRecord) {
      pbClient
        .collection('clients')
        .authRefresh()
        .catch(() => pbClient.authStore.clear())
        .finally(() => setLoading(false))
    } else {
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

  const signOut = () => {
    pbClient.authStore.clear()
  }

  return (
    <ClientAuthContext.Provider
      value={{ client, isAuthenticated, signUp, signIn, signOut, loading }}
    >
      {children}
    </ClientAuthContext.Provider>
  )
}
