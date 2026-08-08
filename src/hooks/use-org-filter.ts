import { useMemo } from 'react'
import { useAuthorization } from '@/hooks/use-authorization'

export function useOrgFilter() {
  const { empresaId, filialId, isGlobal } = useAuthorization()

  const filter = useMemo<string | undefined>(() => {
    if (isGlobal) return undefined
    if (filialId) return `filial = "${filialId}" || filial = ""`
    if (empresaId) return `empresa = "${empresaId}" || empresa = ""`
    return undefined
  }, [empresaId, filialId, isGlobal])

  const mergeFilter = (existing?: string): string | undefined => {
    if (!filter) return existing
    return existing ? `(${existing}) && (${filter})` : filter
  }

  return { filter, mergeFilter, empresaId, filialId, isGlobal }
}
