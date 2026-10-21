import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { getCurrentUserTenant } from '@/lib/multitenancy'
import {
  logoHuramLight,
  logoHuramDark,
  logoGranRomanoOfficial,
  logoDecEldoradoOfficial,
  BRAND_NAME,
  BRAND_TAGLINE,
  HURAM_PALETTE,
} from '@/lib/brand-assets'

export interface EmpresaBrand {
  id: string
  code?: string
  name: string
  razao_social?: string
  nome_fantasia?: string
  marca_nome_exibicao?: string
  marca_cor_primaria?: string
  marca_cor_secundaria?: string
  marca_cor_complementar?: string
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
  corComplementar: string
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
  corComplementar: HURAM_PALETTE.emerald, // #116B50
  isCustom: false,
  empresaPadrao: true,
}

interface BrandContextType {
  brand: ActiveBrand
  loginBrand: ActiveBrand
  empresasDisponiveis: EmpresaBrand[]
  empresasDoUsuario: EmpresaBrand[]
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

export function resolveOfficialLogoFallback(empresa?: EmpresaBrand | null): string | null {
  if (!empresa) return null
  const code = (empresa.code || '').toUpperCase()
  const name = (
    empresa.name ||
    empresa.nome_fantasia ||
    empresa.razao_social ||
    empresa.marca_nome_exibicao ||
    ''
  ).toLowerCase()

  if (code.includes('GRAN-ROMANO') || name.includes('gran romano')) {
    return logoGranRomanoOfficial
  }
  if (code.includes('DEC-ELDORADO') || name.includes('dec eldorado')) {
    return logoDecEldoradoOfficial
  }
  return null
}

export function buildBrandFromEmpresa(empresa?: EmpresaBrand | null): ActiveBrand {
  if (!empresa) return DEFAULT_BRAND

  const hasUploadedLogo = !!(empresa.marca_logo || empresa.logo)
  const logoFile = empresa.marca_logo || empresa.logo
  const uploadedLogoUrl = logoFile ? getFileUrl('empresas', empresa.id, logoFile) : ''
  const officialFallback = resolveOfficialLogoFallback(empresa)
  const effectiveLogoUrl = uploadedLogoUrl || officialFallback || logoHuramLight
  const effectiveLogoDarkUrl = uploadedLogoUrl || officialFallback || logoHuramDark

  const corPrimaria = empresa.marca_cor_primaria?.trim() || HURAM_PALETTE.green
  const corSecundaria = empresa.marca_cor_secundaria?.trim() || HURAM_PALETTE.gold
  const corComplementar =
    empresa.marca_cor_complementar?.trim() ||
    (corPrimaria === '#003DA5'
      ? '#F5B324'
      : corPrimaria === '#4A2E1B'
        ? '#8B5A2B'
        : HURAM_PALETTE.emerald)

  const nomeExibicao =
    empresa.marca_nome_exibicao?.trim() ||
    empresa.nome_fantasia?.trim() ||
    empresa.name?.trim() ||
    BRAND_NAME

  const isCustom =
    !!empresa.marca_nome_exibicao ||
    !!empresa.marca_cor_primaria ||
    !!empresa.marca_cor_secundaria ||
    !!empresa.marca_cor_complementar ||
    hasUploadedLogo ||
    !!officialFallback

  return {
    empresaId: empresa.id,
    empresaNome: empresa.name || empresa.razao_social || BRAND_NAME,
    nomeExibicao,
    logoUrl: effectiveLogoUrl,
    logoDarkUrl: effectiveLogoDarkUrl,
    corPrimaria,
    corSecundaria,
    corComplementar,
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

  // Lista de empresas às quais o usuário autenticado tem acesso
  const empresasDoUsuario = useMemo<EmpresaBrand[]>(() => {
    if (!isAuthenticated) return []
    const { isSup, empresasIds } = getCurrentUserTenant(user)
    if (isSup) {
      return empresas.filter((e) => e.active !== false)
    }
    if (empresasIds.length > 0) {
      return empresas.filter((e) => empresasIds.includes(e.id) && e.active !== false)
    }
    return []
  }, [isAuthenticated, user, empresas])

  return (
    <BrandContext.Provider
      value={{
        brand,
        loginBrand,
        empresasDisponiveis: empresas,
        empresasDoUsuario,
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

/**
 * Converte uma cor hexadecimal (#RRGGBB ou #RGB) em componentes HSL no formato
 * usado pelos tokens do Tailwind ("H S% L%"), para alimentar as CSS variables
 * de marca consumidas pelos utilitários da identidade visual do shell.
 */
export function hexToHslString(hex: string): string {
  const clean = hex.trim().replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return ''
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) {
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    } else if (max === g) {
      h = ((b - r) / d + 2) / 6
    } else {
      h = ((r - g) / d + 4) / 6
    }
  }
  const hDeg = Math.round(h * 360)
  const sPct = Math.round(s * 100)
  const lPct = Math.round(l * 100)
  return `${hDeg} ${sPct}% ${lPct}%`
}

/**
 * Escurece/clareia uma cor hexadecimal para derivar variações (hover, borda de fundo etc.)
 */
export function shadeHexColor(hex: string, amount: number): string {
  const clean = hex.trim().replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return hex
  let r = parseInt(full.slice(0, 2), 16)
  let g = parseInt(full.slice(2, 4), 16)
  let b = parseInt(full.slice(4, 6), 16)
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  if (amount >= 0) {
    r = r + (255 - r) * amount
    g = g + (255 - g) * amount
    b = b + (255 - b) * amount
  } else {
    const k = 1 + amount
    r = r * k
    g = g * k
    b = b * k
  }
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
