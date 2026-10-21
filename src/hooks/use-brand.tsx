import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { getCurrentUserTenant } from '@/lib/multitenancy'
import {
  logoHuramLight,
  logoHuramDark,
  BRAND_NAME,
  BRAND_TAGLINE,
  HURAM_PALETTE,
} from '@/lib/brand-assets'

export interface EmpresaBrand {
  id: string
  name: string
  razao_social?: string
  nome_fantasia?: string
  marca_nome_exibicao?: string
  marca_cor_primaria?: string
  marca_cor_secundaria?: string
  marca_logo?: string
  logo?: string
  padrao?: boolean
  active?: boolean
}

export interface ActiveBrand {
  empresaId: string | null
  empresaNome: string
  nomeExibicao: string
  logoUrl: string
  logoDarkUrl: string
  corPrimaria: string
  corSecundaria: string
  isCustom: boolean
  empresaPadrao: boolean
}

const DEFAULT_BRAND: ActiveBrand = {
  empresaId: null,
  empresaNome: BRAND_NAME,
  nomeExibicao: BRAND_NAME,
  logoUrl: logoHuramLight,
  logoDarkUrl: logoHuramDark,
  corPrimaria: HURAM_PALETTE.green, // #063D30
  corSecundaria: HURAM_PALETTE.gold, // #C69B45
  isCustom: false,
  empresaPadrao: true,
}

interface BrandContextType {
  brand: ActiveBrand
  loginBrand: ActiveBrand
  empresasDisponiveis: EmpresaBrand[]
  empresaAtivaId: string | null
  setEmpresaAtivaId: (id: string) => void
  loading: boolean
  refreshBrand: () => Promise<void>
}

const BrandContext = createContext<BrandContextType | undefined>(undefined)

const ACTIVE_EMPRESA_STORAGE_KEY = 'huram_empresa_ativa_id'

export function getFileUrl(
  collectionNameOrId: string,
  recordId: string,
  fileName?: string,
): string {
  if (!fileName) return ''
  const base = (import.meta.env.VITE_POCKETBASE_URL || '').replace(/\/$/, '')
  return `${base}/api/files/${collectionNameOrId}/${recordId}/${fileName}`
}

export function buildBrandFromEmpresa(empresa?: EmpresaBrand | null): ActiveBrand {
  if (!empresa) return DEFAULT_BRAND

  const hasCustomLogo = !!(empresa.marca_logo || empresa.logo)
  const logoFile = empresa.marca_logo || empresa.logo
  const customLogoUrl = logoFile ? getFileUrl('empresas', empresa.id, logoFile) : ''

  const corPrimaria = empresa.marca_cor_primaria?.trim() || HURAM_PALETTE.green
  const corSecundaria = empresa.marca_cor_secundaria?.trim() || HURAM_PALETTE.gold
  const nomeExibicao =
    empresa.marca_nome_exibicao?.trim() ||
    empresa.nome_fantasia?.trim() ||
    empresa.name?.trim() ||
    BRAND_NAME

  const isCustom =
    !!empresa.marca_nome_exibicao ||
    !!empresa.marca_cor_primaria ||
    !!empresa.marca_cor_secundaria ||
    hasCustomLogo

  return {
    empresaId: empresa.id,
    empresaNome: empresa.name || empresa.razao_social || BRAND_NAME,
    nomeExibicao,
    logoUrl: customLogoUrl || logoHuramLight,
    logoDarkUrl: customLogoUrl || logoHuramDark,
    corPrimaria,
    corSecundaria,
    isCustom,
    empresaPadrao: !!empresa.padrao,
  }
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [empresas, setEmpresas] = useState<EmpresaBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [empresaAtivaId, setEmpresaAtivaIdState] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_EMPRESA_STORAGE_KEY)
  })

  const loadEmpresas = async () => {
    try {
      // Ler empresas cadastradas no sistema
      const records = await pb.collection('empresas').getFullList<EmpresaBrand>({
        sort: '-padrao,name',
      })
      setEmpresas(records)
    } catch (err) {
      console.warn('Não foi possível carregar empresas para marca:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmpresas()
  }, [])

  const setEmpresaAtivaId = (id: string) => {
    setEmpresaAtivaIdState(id)
    if (id) {
      localStorage.setItem(ACTIVE_EMPRESA_STORAGE_KEY, id)
    } else {
      localStorage.removeItem(ACTIVE_EMPRESA_STORAGE_KEY)
    }
  }

  // Marca para a tela de Login (anterior ao login ou quando usuário não identificado):
  // Busca a empresa marcada como "padrao" ou a primeira empresa cadastrada com marca
  const loginBrand = useMemo<ActiveBrand>(() => {
    if (!empresas.length) return DEFAULT_BRAND
    const padrao = empresas.find((e) => e.padrao && e.active !== false)
    if (padrao) return buildBrandFromEmpresa(padrao)
    // Se não houver marcada como 'padrao', pega a primeira ativa
    const primeiraAtiva = empresas.find((e) => e.active !== false)
    if (
      primeiraAtiva &&
      (primeiraAtiva.marca_nome_exibicao ||
        primeiraAtiva.marca_cor_primaria ||
        primeiraAtiva.marca_logo)
    ) {
      return buildBrandFromEmpresa(primeiraAtiva)
    }
    return DEFAULT_BRAND
  }, [empresas])

  // Marca pós-login (shell):
  // Quando o usuário tem uma única empresa vinculada, aplica a marca dele.
  // Usuário multiempresa: usa a empresa ativa selecionada ou a padrão/primeira.
  // Se não autenticado ou sem vínculo, usa o loginBrand.
  const brand = useMemo<ActiveBrand>(() => {
    if (!isAuthenticated) {
      return loginBrand
    }

    const { isSup, empresasIds } = getCurrentUserTenant(user)

    // Lista de empresas às quais o usuário tem acesso
    let userEmpresas: EmpresaBrand[] = []
    if (isSup) {
      userEmpresas = empresas
    } else if (empresasIds.length > 0) {
      userEmpresas = empresas.filter((e) => empresasIds.includes(e.id))
    }

    if (userEmpresas.length === 0) {
      return loginBrand
    }

    // Se usuário tiver apenas 1 empresa vinculada
    if (userEmpresas.length === 1) {
      return buildBrandFromEmpresa(userEmpresas[0])
    }

    // Multiempresa: verificar se há empresa ativa salva e válida
    if (empresaAtivaId) {
      const encontrada = userEmpresas.find((e) => e.id === empresaAtivaId)
      if (encontrada) {
        return buildBrandFromEmpresa(encontrada)
      }
    }

    // Fallback para empresa marcada como padrão ou primeira vinculada
    const padrao = userEmpresas.find((e) => e.padrao) || userEmpresas[0]
    return buildBrandFromEmpresa(padrao)
  }, [isAuthenticated, user, empresas, empresaAtivaId, loginBrand])

  return (
    <BrandContext.Provider
      value={{
        brand,
        loginBrand,
        empresasDisponiveis: empresas,
        empresaAtivaId,
        setEmpresaAtivaId,
        loading,
        refreshBrand: loadEmpresas,
      }}
    >
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand() {
  const ctx = useContext(BrandContext)
  if (!ctx) {
    throw new Error('useBrand deve ser utilizado dentro de um BrandProvider')
  }
  return ctx
}
