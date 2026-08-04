import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

interface SystemParamsMap {
  [module: string]: { [key: string]: { value: string; value_type: string } }
}

interface SystemParamsContextType {
  getParam: (module: string, key: string, defaultValue: string) => string
  getParamNumber: (module: string, key: string, defaultValue: number) => number
  getParamBool: (module: string, key: string, defaultValue: boolean) => boolean
  loading: boolean
}

const SystemParamsContext = createContext<SystemParamsContextType | undefined>(undefined)

export const useSystemParams = () => {
  const ctx = useContext(SystemParamsContext)
  if (!ctx) throw new Error('useSystemParams must be used within SystemParamsProvider')
  return ctx
}

export function SystemParamsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [params, setParams] = useState<SystemParamsMap>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const records = await pb.collection('system_parameters').getFullList({
        filter: 'active != false',
      })
      const map: SystemParamsMap = {}
      for (const r of records as Array<Record<string, unknown>>) {
        const module = r.module as string
        const key = r.key as string
        if (!module || !key) continue
        if (!map[module]) map[module] = {}
        map[module][key] = {
          value: (r.value as string) ?? '',
          value_type: (r.value_type as string) ?? 'text',
        }
      }
      setParams(map)
    } catch {
      setParams({})
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      load()
    } else {
      setParams({})
      setLoading(false)
    }
  }, [isAuthenticated, load])

  useRealtime('system_parameters', () => {
    if (isAuthenticated) load()
  })

  const getParam = (m: string, k: string, d: string): string => params[m]?.[k]?.value ?? d

  const getParamNumber = (m: string, k: string, d: number): number => {
    const v = getParam(m, k, '')
    if (!v) return d
    const n = parseFloat(v.replace(',', '.'))
    return isNaN(n) ? d : n
  }

  const getParamBool = (m: string, k: string, d: boolean): boolean => {
    const v = getParam(m, k, '')
    if (!v) return d
    return v === 'true' || v === '1'
  }

  return (
    <SystemParamsContext.Provider value={{ getParam, getParamNumber, getParamBool, loading }}>
      {children}
    </SystemParamsContext.Provider>
  )
}
