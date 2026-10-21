import { useMemo } from 'react'
import { useAuthorization } from '@/hooks/use-authorization'

export interface OrgFilterResult {
  filter: string | undefined
  mergeFilter: (existing?: string) => string | undefined
  empresaId: string
  filialId: string
  isGlobal: boolean
  /**
   * Indica se o usuário não é global e ainda não possui vínculo de empresa ou filial configurado.
   */
  hasMissingOrgBinding: boolean
  /**
   * Mensagem padrão amigável para orientação do usuário em telas filtradas por empresa/filial.
   */
  missingOrgMessage: string
}

export const MISSING_ORG_MESSAGE =
  'Usuário sem empresa/filial vinculada — procure o Administrador para configurar seu acesso.'

export function useOrgFilter(): OrgFilterResult {
  // Degrada com segurança caso useAuthorization falhe ou não tenha contexto
  let authContext: { empresaId: string; filialId: string; isGlobal: boolean } = {
    empresaId: '',
    filialId: '',
    isGlobal: true,
  }

  try {
    authContext = useAuthorization()
  } catch (err) {
    console.warn('[useOrgFilter] Contexto de autorização não encontrado ou com erro:', err)
  }

  const { empresaId = '', filialId = '', isGlobal = false } = authContext

  // Usuário não-global que não possui empresa vinculada
  const hasMissingOrgBinding = !isGlobal && !empresaId

  const filter = useMemo<string | undefined>(() => {
    if (isGlobal) return undefined
    if (hasMissingOrgBinding) {
      return 'id = "__SEM_EMPRESA__"'
    }
    if (empresaId) {
      const safeEmpresa = String(empresaId).replace(/"/g, '\\"')
      return `empresa = "${safeEmpresa}"`
    }
    return undefined
  }, [empresaId, isGlobal, hasMissingOrgBinding])

  const mergeFilter = (existing?: string): string | undefined => {
    if (!filter) return existing
    return existing ? `(${existing}) && (${filter})` : filter
  }

  return {
    filter,
    mergeFilter,
    empresaId,
    filialId,
    isGlobal,
    hasMissingOrgBinding,
    missingOrgMessage: MISSING_ORG_MESSAGE,
  }
}
