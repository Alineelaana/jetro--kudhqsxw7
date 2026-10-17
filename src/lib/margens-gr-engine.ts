/**
 * Engine de cálculo de Margens Gran Romano (Comparativo Margens GR)
 *
 * FÓRMULAS OFICIAIS EXTRAÍDAS DA PLANILHA MODELO (MARGENS MODELO-76a19.xlsx):
 * - ICMS = Preço Rivoli × Alíquota ICMS (padrão 1,20%)
 * - PIS = Preço Rivoli × Alíquota PIS (padrão 1,45%)
 * - COFINS = Preço Rivoli × Alíquota COFINS (padrão 6,68%)
 * - Comissão = Preço Rivoli × Alíquota Comissão (padrão 3,00%)
 * - Frete = Preço Rivoli × Alíquota Frete (padrão 3,00%)
 *
 * Preço mínimo c/ tributos = CMV + ICMS + PIS + COFINS
 * (Premissa documental: "considera apenas CMV + tributos", sem comissão e sem frete)
 *
 * Margem final R$ = Preço Rivoli − CMV − ICMS − PIS − COFINS − Comissão − Frete
 * Margem final % = Margem final R$ ÷ Preço Rivoli (0 se Preço Rivoli <= 0)
 *
 * RESUMO:
 * - Total Tributos % = ICMS % + PIS % + COFINS %
 * - Total Comercial/Logístico % = Comissão % + Frete %
 * - Margem média final % = média aritmética das margens finais % dos SKUs com preço válido
 * - SKUs com margem negativa = quantidade de produtos com Margem final R$ < 0
 */

export interface MargemParametros {
  icmsPercentual: number // ex: 1.2
  pisPercentual: number // ex: 1.45
  cofinsPercentual: number // ex: 6.68
  comissaoPercentual: number // ex: 3.0
  fretePercentual: number // ex: 3.0
}

export const PARAMETROS_DEFAULT: MargemParametros = {
  icmsPercentual: 1.2,
  pisPercentual: 1.45,
  cofinsPercentual: 6.68,
  comissaoPercentual: 3.0,
  fretePercentual: 3.0,
}

export interface MargemInputRow {
  id: string
  produto: string
  cmv: number
  preco_rivoli: number
  ativo?: boolean
  ordem?: number
}

export interface MargemCalculadaRow extends MargemInputRow {
  icmsValor: number
  pisValor: number
  cofinsValor: number
  comissaoValor: number
  freteValor: number
  totalTributosValor: number
  totalDeducoesValor: number
  precoMinimoComTributos: number
  margemFinalRs: number
  margemFinalPercentual: number
  isMargemNegativa: boolean
}

export interface MargemResumo {
  totalSkus: number
  totalTributosPercentual: number // ICMS + PIS + COFINS (ex: 9.33%)
  totalComissaoFretePercentual: number // Comissao + Frete (ex: 6.00%)
  totalDeducoesPercentual: number // 15.33%
  margemMediaFinalPercentual: number
  skusNegativosCount: number
  somaCmv: number
  somaPrecoRivoli: number
  somaMargemFinalRs: number
}

/**
 * Realiza o cálculo para uma linha de produto única.
 */
export function calcularLinhaMargem(
  row: MargemInputRow,
  params: MargemParametros,
): MargemCalculadaRow {
  const cmv = Number.isFinite(row.cmv) ? row.cmv : 0
  const precoRivoli = Number.isFinite(row.preco_rivoli) ? row.preco_rivoli : 0

  const icmsAliq = (params.icmsPercentual || 0) / 100
  const pisAliq = (params.pisPercentual || 0) / 100
  const cofinsAliq = (params.cofinsPercentual || 0) / 100
  const comissaoAliq = (params.comissaoPercentual || 0) / 100
  const freteAliq = (params.fretePercentual || 0) / 100

  // Deduções calculadas diretamente sobre o PREÇO RIVOLI (preço efetivo de venda)
  const icmsValor = precoRivoli * icmsAliq
  const pisValor = precoRivoli * pisAliq
  const cofinsValor = precoRivoli * cofinsAliq
  const comissaoValor = precoRivoli * comissaoAliq
  const freteValor = precoRivoli * freteAliq

  const totalTributosValor = icmsValor + pisValor + cofinsValor
  const totalDeducoesValor = totalTributosValor + comissaoValor + freteValor

  // Preço mínimo c/ tributos = CMV + ICMS + PIS + COFINS
  const precoMinimoComTributos = cmv + totalTributosValor

  // Margem final R$ = Preço Rivoli − CMV − ICMS − PIS − COFINS − Comissão − Frete
  const margemFinalRs = precoRivoli - cmv - totalDeducoesValor

  // Margem final % = Margem final R$ ÷ Preço Rivoli
  const margemFinalPercentual = precoRivoli > 0 ? margemFinalRs / precoRivoli : 0

  const isMargemNegativa = margemFinalRs < -0.000001

  return {
    ...row,
    cmv,
    preco_rivoli: precoRivoli,
    icmsValor,
    pisValor,
    cofinsValor,
    comissaoValor,
    freteValor,
    totalTributosValor,
    totalDeducoesValor,
    precoMinimoComTributos,
    margemFinalRs,
    margemFinalPercentual,
    isMargemNegativa,
  }
}

/**
 * Calcula todas as linhas e totalizadores do bloco Resumo.
 */
export function calcularTabelaMargens(
  rows: MargemInputRow[],
  params: MargemParametros,
): {
  linhasCalculadas: MargemCalculadaRow[]
  resumo: MargemResumo
} {
  const linhasCalculadas = rows.map((r) => calcularLinhaMargem(r, params))

  const totalSkus = linhasCalculadas.length
  const totalTributosPercentual =
    (params.icmsPercentual || 0) + (params.pisPercentual || 0) + (params.cofinsPercentual || 0)
  const totalComissaoFretePercentual =
    (params.comissaoPercentual || 0) + (params.fretePercentual || 0)
  const totalDeducoesPercentual = totalTributosPercentual + totalComissaoFretePercentual

  let somaMargensPerc = 0
  let skusNegativosCount = 0
  let somaCmv = 0
  let somaPrecoRivoli = 0
  let somaMargemFinalRs = 0

  for (const l of linhasCalculadas) {
    somaCmv += l.cmv
    somaPrecoRivoli += l.preco_rivoli
    somaMargemFinalRs += l.margemFinalRs
    somaMargensPerc += l.margemFinalPercentual
    if (l.isMargemNegativa) {
      skusNegativosCount++
    }
  }

  // Média aritmética da Margem final % (conforme modelo Excel line 18)
  const margemMediaFinalPercentual = totalSkus > 0 ? somaMargensPerc / totalSkus : 0

  const resumo: MargemResumo = {
    totalSkus,
    totalTributosPercentual,
    totalComissaoFretePercentual,
    totalDeducoesPercentual,
    margemMediaFinalPercentual,
    skusNegativosCount,
    somaCmv,
    somaPrecoRivoli,
    somaMargemFinalRs,
  }

  return {
    linhasCalculadas,
    resumo,
  }
}

/**
 * Utilitários de formatação pt-BR
 */
export function formatCurrencyBRL(val: number): string {
  if (!Number.isFinite(val)) return 'R$ 0,00'
  return val.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatCurrencyPrecise(val: number, decimals = 4): string {
  if (!Number.isFinite(val)) return 'R$ 0,00'
  return (
    'R$ ' +
    val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    })
  )
}

export function formatPercent(val: number, decimals = 2): string {
  if (!Number.isFinite(val)) return '0,00%'
  const perc = val * 100
  return (
    perc.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + '%'
  )
}

export function formatPercentDirect(val: number, decimals = 2): string {
  if (!Number.isFinite(val)) return '0,00%'
  return (
    val.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + '%'
  )
}
