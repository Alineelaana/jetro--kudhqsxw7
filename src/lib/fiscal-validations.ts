/**
 * Utilitários de Validação Fiscal e Decimal Estrita
 * Conforme Roteiro Técnico Huram:
 * - Validação de NCM preservando máscara e formato textual (sem conversão para inteiro)
 * - Validação de GTIN com algoritmo oficial EAN-8, EAN-12, EAN-13, EAN-14 com dígito verificador
 * - Suporte explícito a "SEM GTIN"
 * - Rejeição estrita de fatores de conversão zero ou negativos
 * - Formatação e precisão decimal exata por campo (sem ponto flutuante binário que perde precisão)
 */

/**
 * Validação do NCM (Nomenclatura Comum do Mercosul):
 * Deve possuir exatamente 8 dígitos numéricos (com ou sem pontos, ex: "4819.10.00" ou "48191000")
 */
export function isValidNcm(ncm: string | undefined | null): boolean {
  if (!ncm) return false
  const clean = ncm.replace(/\D/g, '')
  return clean.length === 8
}

/**
 * Normaliza o NCM para o formato padrão mascarado "0000.00.00" mantendo como texto
 */
export function formatNcm(ncm: string | undefined | null): string {
  if (!ncm) return ''
  const clean = ncm.replace(/\D/g, '').slice(0, 8)
  if (clean.length <= 4) return clean
  if (clean.length <= 6) return `${clean.slice(0, 4)}.${clean.slice(4)}`
  return `${clean.slice(0, 4)}.${clean.slice(4, 6)}.${clean.slice(6, 8)}`
}

/**
 * Valida CEST (Código Especificador da Substituição Tributária):
 * Opcional, mas quando informado deve ter 7 dígitos (ex: "01.001.00")
 */
export function isValidCest(cest: string | undefined | null): boolean {
  if (!cest) return true // Não é obrigatório para todo produto
  const clean = cest.replace(/\D/g, '')
  return clean.length === 7
}

export function formatCest(cest: string | undefined | null): string {
  if (!cest) return ''
  const clean = cest.replace(/\D/g, '').slice(0, 7)
  if (clean.length <= 2) return clean
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 7)}`
}

/**
 * Validação de GTIN / EAN (EAN-8, EAN-12, EAN-13, EAN-14) usando o cálculo de dígito verificador da GS1
 */
export function isValidGtin(gtin: string | undefined | null, allowSemGtin = true): boolean {
  if (!gtin) return allowSemGtin
  const upper = gtin.trim().toUpperCase()
  if (allowSemGtin && (upper === 'SEM GTIN' || upper === 'SEMGTIN' || upper === '')) {
    return true
  }
  const clean = gtin.replace(/\D/g, '')
  if (![8, 12, 13, 14].includes(clean.length)) {
    return false
  }

  // Algoritmo GS1 de verificação do último dígito
  const digits = clean.split('').map(Number)
  const checkDigit = digits[digits.length - 1]
  const baseDigits = digits.slice(0, -1)

  // Pesa alternando 3 e 1 da direita para a esquerda
  let sum = 0
  let weight = 3
  for (let i = baseDigits.length - 1; i >= 0; i--) {
    sum += baseDigits[i] * weight
    weight = weight === 3 ? 1 : 3
  }

  const calculatedCheck = (10 - (sum % 10)) % 10
  return calculatedCheck === checkDigit
}

/**
 * Valida fator de conversão de unidade.
 * Rejeita estritamente valores <= 0 ou não numéricos.
 */
export function isValidConversionFactor(factor: string | number | undefined | null): boolean {
  if (factor === undefined || factor === null) return false
  const str = String(factor).replace(',', '.').trim()
  if (!str) return false
  const num = parseFloat(str)
  return !isNaN(num) && num > 0
}

/**
 * Decimal exato: formata string decimal com precisão fixa sem usar float binário solto
 */
export function formatExactDecimal(
  value: string | number | undefined | null,
  decimals = 4,
): string {
  if (value === undefined || value === null || value === '') return '0.' + '0'.repeat(decimals)
  const clean = String(value).replace(',', '.').trim()
  const parts = clean.split('.')
  const integerPart = parts[0].replace(/\D/g, '') || '0'
  const decimalPart = (parts[1] || '').replace(/\D/g, '')
  const paddedDecimal = (decimalPart + '0'.repeat(decimals)).slice(0, decimals)
  return `${integerPart}.${paddedDecimal}`
}

/**
 * Avaliação do estado fiscal do produto:
 * Retorna se o produto cumpre os requisitos mínimos para estar "Pronto para Operação Fiscal" (validado)
 * ou se permanece como "Rascunho" (permitido incompleto).
 */
export interface FiscalValidationResult {
  isReadyForFiscal: boolean
  errors: string[]
  warnings: string[]
}

export interface ProductFiscalEvaluationInput {
  name: string
  ncm: string
  unit: string
  tipo_finalidade?: string
  origin?: string
  ean?: string
  sem_gtin?: boolean
  cest?: string
  cfop?: string
  cst_csosn?: string
}

export function evaluateProductFiscalReadiness(
  input: ProductFiscalEvaluationInput,
): FiscalValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. Descrição e Unidade Base
  if (!input.name || input.name.trim().length < 2) {
    errors.push('Descrição/Nome do produto é obrigatória.')
  }
  if (!input.unit || input.unit.trim().length === 0) {
    errors.push('Unidade de medida base é obrigatória.')
  }

  // 2. NCM
  if (!input.ncm || !input.ncm.trim()) {
    errors.push('NCM é obrigatório para operações fiscais.')
  } else if (!isValidNcm(input.ncm)) {
    errors.push('NCM inválido. Deve conter 8 dígitos numéricos válidos.')
  }

  // 3. Origem da Mercadoria (0 a 8)
  if (input.origin === undefined || input.origin === null || input.origin === '') {
    errors.push('Origem da mercadoria é obrigatória (Tabela A CST).')
  }

  // 4. GTIN / EAN
  if (!input.sem_gtin && input.ean && input.ean.trim()) {
    if (!isValidGtin(input.ean, false)) {
      errors.push('Código GTIN/EAN informado possui dígito verificador inválido.')
    }
  }

  // 5. Tipo/Finalidade
  if (!input.tipo_finalidade) {
    warnings.push(
      'Tipo/finalidade do produto não foi categorizado (ex: revenda, fabricação própria).',
    )
  }

  // 6. CEST quando aplicável
  if (input.cest && input.cest.trim() && !isValidCest(input.cest)) {
    errors.push('CEST informado inválido. Deve possuir 7 dígitos numéricos.')
  }

  // 7. CFOP
  if (!input.cfop || !input.cfop.trim()) {
    warnings.push(
      'CFOP padrão não foi definido no cadastro geral (será exigido nas regras por empresa).',
    )
  }

  // 8. CST / CSOSN
  if (!input.cst_csosn || !input.cst_csosn.trim()) {
    warnings.push('CST/CSOSN básico não definido (pode ser sobrescrito nas regras da empresa).')
  }

  return {
    isReadyForFiscal: errors.length === 0,
    errors,
    warnings,
  }
}
