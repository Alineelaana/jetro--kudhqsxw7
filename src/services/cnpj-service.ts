/**
 * Serviço de Validação e Consulta de CNPJ Público (BrasilAPI com fallback para ReceitaWS)
 * ERP Jetro
 */

export interface CnpjParsedData {
  cnpj: string
  cnpjFormatado: string
  razaoSocial: string
  nomeFantasia: string
  dataFundacao: string // Formato YYYY-MM-DD para inputs do tipo date
  dataFundacaoPtBr?: string // Formato DD/MM/YYYY
  cnaePrincipal: string
  cnaeDescricao?: string
  cnaesSecundarios?: Array<{ codigo: string; descricao: string }>
  inscricaoEstadual?: string
  situacaoCadastral?: string
  situacaoIe?: 'contribuinte' | 'isento' | 'nao_contribuinte'
  // Endereço
  cep: string
  uf: string
  municipio: string
  bairro: string
  logradouro: string
  numero: string
  complemento: string
  // Contatos
  email?: string
  telefone?: string
  // Metadados da consulta
  origem: 'BrasilAPI' | 'ReceitaWS'
  consultadoEm: string // ISO string
  consultadoEmTexto: string // Ex: "19/10/2026 14:35"
  provedorDescricao: string // Ex: "Receita Federal via BrasilAPI"
}

export type CnpjLookupErrorType = 'INVALID_CNPJ' | 'NOT_FOUND' | 'SERVICE_UNAVAILABLE' | 'TIMEOUT'

export class CnpjLookupError extends Error {
  type: CnpjLookupErrorType

  constructor(message: string, type: CnpjLookupErrorType) {
    super(message)
    this.name = 'CnpjLookupError'
    this.type = type
  }
}

/**
 * Validação dos dígitos verificadores do CNPJ brasileiro (módulo 11)
 */
export function validarCNPJ(raw: string): boolean {
  if (!raw) return false
  const clean = raw.replace(/\D/g, '')
  if (clean.length !== 14) return false

  // Elimina CNPJs conhecidos inválidos (todos dígitos repetidos)
  if (/^(\d)\1{13}$/.test(clean)) return false

  // Validação do primeiro dígito verificador
  let tamanho = 12
  let numeros = clean.substring(0, tamanho)
  const digitos = clean.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--
    if (pos < 2) pos = 9
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(0), 10)) return false

  // Validação do segundo dígito verificador
  tamanho = 13
  numeros = clean.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--
    if (pos < 2) pos = 9
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(1), 10)) return false

  return true
}

/**
 * Formata um CNPJ para o padrão XX.XXX.XXX/XXXX-XX
 */
export function formatarCNPJ(raw: string): string {
  const clean = raw.replace(/\D/g, '').slice(0, 14)
  if (clean.length <= 2) return clean
  if (clean.length <= 5) return clean.replace(/^(\d{2})(\d+)/, '$1.$2')
  if (clean.length <= 8) return clean.replace(/^(\d{2})(\d{3})(\d+)/, '$1.$2.$3')
  if (clean.length <= 12) return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4')
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5')
}

/**
 * Formata CEP para XXXXX-XXX
 */
export function formatarCEP(raw: string): string {
  const clean = raw.replace(/\D/g, '').slice(0, 8)
  return clean.replace(/^(\d{5})(\d{1,3})/, '$1-$2')
}

/**
 * Converte data da BrasilAPI (geralmente YYYY-MM-DD) ou ReceitaWS (DD/MM/YYYY) para YYYY-MM-DD
 */
function normalizarDataParaInput(dataStr?: string | null): { ymd: string; ptBr: string } {
  if (!dataStr) return { ymd: '', ptBr: '' }
  const s = dataStr.trim()

  // Se já estiver em YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-')
    return { ymd: s, ptBr: `${d}/${m}/${y}` }
  }

  // Se estiver em DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/')
    return { ymd: `${y}-${m}-${d}`, ptBr: s }
  }

  return { ymd: '', ptBr: '' }
}

/**
 * Formata código de CNAE (ex: 4771701 -> 4771-7/01 ou 47.71-7-01)
 */
function normalizarCnae(raw?: string | number | null): string {
  if (!raw) return ''
  const clean = String(raw).replace(/\D/g, '')
  if (clean.length === 7) {
    // Padrão CNAE: 0000-0/00
    return `${clean.slice(0, 4)}-${clean.slice(4, 5)}/${clean.slice(5)}`
  }
  return String(raw).trim()
}

/**
 * Formata data/hora brasileira para exibição legível
 */
export function formatarDataHoraPtBr(date: Date = new Date()): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Helper para fetch com timeout configurável (padrão 15 segundos)
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 15000,
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Parser para resposta da BrasilAPI
 */
function parseBrasilApiResponse(data: any, cleanCnpj: string, consultadoEm: Date): CnpjParsedData {
  const dataFund = normalizarDataParaInput(data.data_inicio_atividade)
  const cnaePrincipal = normalizarCnae(data.cnae_fiscal)
  const cnaeDesc = data.cnae_fiscal_descricao || ''

  const cnaesSecundarios: Array<{ codigo: string; descricao: string }> = []
  if (Array.isArray(data.cnaes_secundarios)) {
    for (const c of data.cnaes_secundarios) {
      if (c && c.codigo) {
        cnaesSecundarios.push({
          codigo: normalizarCnae(c.codigo),
          descricao: c.descricao || '',
        })
      }
    }
  }

  // Montagem do telefone
  let telefone = ''
  if (data.ddd_telefone_1) {
    const tClean = String(data.ddd_telefone_1).replace(/\D/g, '')
    if (tClean.length >= 10) {
      telefone =
        tClean.length === 11
          ? `(${tClean.slice(0, 2)}) ${tClean.slice(2, 7)}-${tClean.slice(7)}`
          : `(${tClean.slice(0, 2)}) ${tClean.slice(2, 6)}-${tClean.slice(6)}`
    } else {
      telefone = data.ddd_telefone_1
    }
  }

  const situacao =
    data.descricao_situacao_cadastral || (data.situacao_cadastral === 2 ? 'ATIVA' : 'INATIVA')

  return {
    cnpj: cleanCnpj,
    cnpjFormatado: formatarCNPJ(cleanCnpj),
    razaoSocial: (data.razao_social || '').trim(),
    nomeFantasia: (data.nome_fantasia || '').trim(),
    dataFundacao: dataFund.ymd,
    dataFundacaoPtBr: dataFund.ptBr,
    cnaePrincipal: cnaePrincipal ? `${cnaePrincipal}${cnaeDesc ? ` - ${cnaeDesc}` : ''}` : '',
    cnaeDescricao: cnaeDesc,
    cnaesSecundarios,
    inscricaoEstadual: '', // BrasilAPI de CNPJ padrão não traz IE de todos estados
    situacaoCadastral: situacao,
    situacaoIe: 'contribuinte',
    cep: data.cep ? formatarCEP(String(data.cep)) : '',
    uf: (data.uf || '').toUpperCase().trim(),
    municipio: (data.municipio || '').trim(),
    bairro: (data.bairro || '').trim(),
    logradouro: (data.logradouro || '').trim(),
    numero: (data.numero || '').trim(),
    complemento: (data.complemento || '').trim(),
    email: (data.email || '').toLowerCase().trim(),
    telefone,
    origem: 'BrasilAPI',
    consultadoEm: consultadoEm.toISOString(),
    consultadoEmTexto: formatarDataHoraPtBr(consultadoEm),
    provedorDescricao: 'Receita Federal via BrasilAPI',
  }
}

/**
 * Parser para resposta da ReceitaWS
 */
function parseReceitaWsResponse(data: any, cleanCnpj: string, consultadoEm: Date): CnpjParsedData {
  const dataFund = normalizarDataParaInput(data.abertura)
  let cnaePrincipal = ''
  let cnaeDesc = ''
  if (Array.isArray(data.atividade_principal) && data.atividade_principal.length > 0) {
    const act = data.atividade_principal[0]
    cnaePrincipal = normalizarCnae(act.code)
    cnaeDesc = act.text || ''
  }

  const cnaesSecundarios: Array<{ codigo: string; descricao: string }> = []
  if (Array.isArray(data.atividades_secundarias)) {
    for (const act of data.atividades_secundarias) {
      if (act && act.code) {
        cnaesSecundarios.push({
          codigo: normalizarCnae(act.code),
          descricao: act.text || '',
        })
      }
    }
  }

  return {
    cnpj: cleanCnpj,
    cnpjFormatado: formatarCNPJ(cleanCnpj),
    razaoSocial: (data.nome || '').trim(),
    nomeFantasia: (data.fantasia || '').trim(),
    dataFundacao: dataFund.ymd,
    dataFundacaoPtBr: dataFund.ptBr,
    cnaePrincipal: cnaePrincipal ? `${cnaePrincipal}${cnaeDesc ? ` - ${cnaeDesc}` : ''}` : '',
    cnaeDescricao: cnaeDesc,
    cnaesSecundarios,
    inscricaoEstadual: '',
    situacaoCadastral: (data.situacao || 'ATIVA').trim(),
    situacaoIe: 'contribuinte',
    cep: data.cep ? formatarCEP(String(data.cep)) : '',
    uf: (data.uf || '').toUpperCase().trim(),
    municipio: (data.municipio || '').trim(),
    bairro: (data.bairro || '').trim(),
    logradouro: (data.logradouro || '').trim(),
    numero: (data.numero || '').trim(),
    complemento: (data.complemento || '').trim(),
    email: (data.email || '').toLowerCase().trim(),
    telefone: (data.telefone || '').trim(),
    origem: 'ReceitaWS',
    consultadoEm: consultadoEm.toISOString(),
    consultadoEmTexto: formatarDataHoraPtBr(consultadoEm),
    provedorDescricao: 'Receita Federal via ReceitaWS',
  }
}

/**
 * Consulta de CNPJ com fallback automático:
 * 1º tenta BrasilAPI (https://brasilapi.com.br/api/cnpj/v1/{cnpj})
 * 2º se falhar (ou 503/timeout), tenta ReceitaWS (https://receitaws.com.br/v1/cnpj/{cnpj})
 * Timeout de 15 segundos por tentativa.
 */
export async function consultarCNPJPublico(rawCnpj: string): Promise<CnpjParsedData> {
  const clean = rawCnpj.replace(/\D/g, '')

  if (!validarCNPJ(clean)) {
    throw new CnpjLookupError(
      'CNPJ inválido. Verifique os 14 dígitos e os dígitos verificadores informados.',
      'INVALID_CNPJ',
    )
  }

  const agora = new Date()
  let brasilApiFailed = false
  let brasilApiNotFound = false

  // 1. Tentar BrasilAPI
  try {
    const res = await fetchWithTimeout(
      `https://brasilapi.com.br/api/cnpj/v1/${clean}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      },
      15000,
    )

    if (res.ok) {
      const data = await res.json()
      if (data && (data.razao_social || data.cnpj)) {
        return parseBrasilApiResponse(data, clean, agora)
      }
    } else if (res.status === 404) {
      brasilApiNotFound = true
      brasilApiFailed = true
    } else {
      brasilApiFailed = true
    }
  } catch (err: any) {
    brasilApiFailed = true
  }

  // 2. Fallback para ReceitaWS
  try {
    const res = await fetchWithTimeout(
      `https://receitaws.com.br/v1/cnpj/${clean}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      },
      15000,
    )

    if (res.ok) {
      const data = await res.json()
      if (data && data.status === 'ERROR') {
        if (/não encontrado|nao encontrado/i.test(data.message || '')) {
          throw new CnpjLookupError(
            `CNPJ ${formatarCNPJ(clean)} não foi encontrado na base da Receita Federal.`,
            'NOT_FOUND',
          )
        }
        throw new CnpjLookupError(
          data.message || 'Erro retornado pela consulta da Receita Federal.',
          'SERVICE_UNAVAILABLE',
        )
      }

      if (data && data.nome) {
        return parseReceitaWsResponse(data, clean, agora)
      }
    } else if (res.status === 404) {
      throw new CnpjLookupError(
        `CNPJ ${formatarCNPJ(clean)} não foi encontrado na base da Receita Federal.`,
        'NOT_FOUND',
      )
    } else {
      throw new CnpjLookupError(
        'Serviço público de consulta de CNPJ temporariamente indisponível. Sugerimos o preenchimento manual dos dados.',
        'SERVICE_UNAVAILABLE',
      )
    }
  } catch (err: any) {
    if (err instanceof CnpjLookupError) throw err

    if (brasilApiNotFound) {
      throw new CnpjLookupError(
        `CNPJ ${formatarCNPJ(clean)} não foi encontrado na base da Receita Federal.`,
        'NOT_FOUND',
      )
    }

    if (err?.name === 'AbortError') {
      throw new CnpjLookupError(
        'Tempo limite de consulta excedido (15 segundos). Por favor, tente novamente ou preencha manualmente.',
        'TIMEOUT',
      )
    }

    throw new CnpjLookupError(
      'Não foi possível consultar os dados na Receita Federal (BrasilAPI e ReceitaWS indisponíveis). Sugerimos preenchimento manual.',
      'SERVICE_UNAVAILABLE',
    )
  }

  throw new CnpjLookupError(
    'Serviço público de consulta de CNPJ indisponível. Sugerimos o preenchimento manual dos dados.',
    'SERVICE_UNAVAILABLE',
  )
}
