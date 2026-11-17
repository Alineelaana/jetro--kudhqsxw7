/**
 * Cálculo do prazo médio das condições de pagamento selecionadas em uma
 * tabela de preços, comparado com o prazo médio declarado da tabela.
 */

/** Condição de pagamento real da coleção `condicoes_pagamento` */
export interface CondicaoPagamento {
  id: string
  name: string
  parcelas?: number | string
  intervalo?: number | string
  entrada?: string
}

/** Representação de uma regra de pagamento ("28 dias no boleto", "21/35", "PIX") */
export interface CondicaoRegra {
  id: string
  name: string
  parcelas: number
  intervalo: number
  entrada: boolean
}

const toNum = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'))
  return isNaN(n) ? fallback : n
}

/**
 * Interpreta o nome de uma condição de pagamento para extrair os prazos das
 * parcelas, ex.: "21/35 dias no boleto" -> [21, 35]; "PIX" -> [0];
 * "7 dias no boleto" -> [7]. "28/33/63" -> [28, 33, 63].
 */
export function parseCondicaoPrazos(name: string): number[] {
  const nome = (name || '').toLowerCase()
  if (/pix|dinheiro|à vista|a vista|cartão de crédito|cred./.test(nome)) return [0]
  const seq = nome.match(/(\d+(?:\s*\/\s*\d+)+)/)
  if (seq) {
    return seq[1]
      .split('/')
      .map((p) => toNum(p.trim(), 0))
      .filter((n) => n >= 0)
  }
  const dias = nome.match(/(\d+)\s*(?:dias|d)\b/)
  if (dias) return [toNum(dias[1], 0)]
  return [0]
}

/** Média simples dos dias das parcelas de uma condição (ex.: 21/35 -> 28) */
export function prazoMedioCondicao(c: CondicaoRegra | { name: string }): number {
  const prazos = parseCondicaoPrazos(c.name)
  if (prazos.length === 0) return 0
  return prazos.reduce((a, b) => a + b, 0) / prazos.length
}

/**
 * Prazo médio do conjunto de condições escolhidas: média simples dos prazos
 * médios de cada condição selecionada.
 */
export function prazoMedioTotal(condicoes: { name: string }[]): number {
  if (condicoes.length === 0) return 0
  return condicoes.reduce((acc, c) => acc + prazoMedioCondicao(c), 0) / condicoes.length
}

/** Prazo médio declarado no nome/observação da tabela, ex.: "Tabela 7 dias" -> 7 */
export function prazoMedioDaTabela(nomeTabela: string, observacoes: string): number {
  const fonte = `${nomeTabela || ''} ${observacoes || ''}`.toLowerCase()
  const seq = fonte.match(/(\d+(?:\s*\/\s*\d+)+)/)
  if (seq) {
    const dias = seq[1]
      .split('/')
      .map((p) => toNum(p.trim(), 0))
      .filter((n) => n > 0)
    if (dias.length) return dias.reduce((a, b) => a + b, 0) / dias.length
  }
  const dias = fonte.match(/(\d+)\s*(?:dias|d)\b/)
  if (dias) return toNum(dias[1], 0)
  return 0
}

export interface ComparacaoPrazo {
  prazoTabela: number
  prazoCondicoes: number
  diferenca: number
  /** true quando há condições selecionadas e a diferença é relevante */
  divergente: boolean
}

export const TOLERANCIA_PRAZO_DIAS = 2

export function compararPrazos(
  nomeTabela: string,
  observacoes: string,
  condicoes: { name: string }[],
): ComparacaoPrazo {
  const prazoTabela = prazoMedioDaTabela(nomeTabela, observacoes)
  const prazoCondicoes = prazoMedioTotal(condicoes)
  const diferenca = prazoCondicoes - prazoTabela
  const temCondicoes = condicoes.length > 0
  return {
    prazoTabela,
    prazoCondicoes,
    diferenca,
    divergente: temCondicoes && prazoTabela > 0 && Math.abs(diferenca) > TOLERANCIA_PRAZO_DIAS,
  }
}

/**
 * Mapeia os IDs de `rules.condicoes_pagamento` para as condições reais
 * carregadas da coleção `condicoes_pagamento`.
 */
export function mapearCondicoesSelecionadas(
  idsOuNomes: string[],
  catalogo: CondicaoPagamento[],
): { name: string }[] {
  const byId = new Map(catalogo.map((c) => [c.id, c]))
  const byName = new Map(catalogo.map((c) => [String(c.name || '').trim(), c]))
  return idsOuNomes
    .map((v) => byId.get(v) || byName.get(String(v).trim()))
    .filter((c): c is CondicaoPagamento => !!c)
    .map((c) => ({ name: String(c.name || '') }))
}
