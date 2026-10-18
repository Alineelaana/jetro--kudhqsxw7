import { type TableDataType } from './types'

/**
 * Normaliza valores de acordo com o tipo semântico para comparação determinística
 */
export function normalizeValueForSort(
  val: unknown,
  dataType: TableDataType = 'text',
): number | string | boolean {
  if (val === null || val === undefined) {
    return dataType === 'number' ||
      dataType === 'currency' ||
      dataType === 'percent' ||
      dataType === 'date'
      ? Number.NEGATIVE_INFINITY
      : ''
  }

  switch (dataType) {
    case 'number': {
      if (typeof val === 'number') return isNaN(val) ? Number.NEGATIVE_INFINITY : val
      const str = String(val).trim().replace(/\./g, '').replace(',', '.')
      const num = parseFloat(str)
      return isNaN(num) ? Number.NEGATIVE_INFINITY : num
    }
    case 'currency': {
      if (typeof val === 'number') return isNaN(val) ? Number.NEGATIVE_INFINITY : val
      // Limpa R$, espaços, pontos de milhar
      const str = String(val)
        .replace(/R\$\s?/gi, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
      const num = parseFloat(str)
      return isNaN(num) ? Number.NEGATIVE_INFINITY : num
    }
    case 'percent': {
      if (typeof val === 'number') return isNaN(val) ? Number.NEGATIVE_INFINITY : val
      const str = String(val)
        .replace(/%/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
      const num = parseFloat(str)
      return isNaN(num) ? Number.NEGATIVE_INFINITY : num
    }
    case 'date': {
      if (val instanceof Date) return val.getTime()
      if (typeof val === 'number') return val
      const s = String(val).trim()
      if (!s) return Number.NEGATIVE_INFINITY
      // Verifica formato DD/MM/AAAA ou DD/MM/AAAA HH:mm
      const ptMatch = s.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/,
      )
      if (ptMatch) {
        const [, d, m, y, h, min, sec] = ptMatch
        const dt = new Date(
          parseInt(y, 10),
          parseInt(m, 10) - 1,
          parseInt(d, 10),
          parseInt(h || '0', 10),
          parseInt(min || '0', 10),
          parseInt(sec || '0', 10),
        )
        return isNaN(dt.getTime()) ? Number.NEGATIVE_INFINITY : dt.getTime()
      }
      const parsed = Date.parse(s)
      return isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed
    }
    case 'boolean': {
      return Boolean(val)
    }
    case 'text':
    default: {
      return String(val).trim().toLowerCase()
    }
  }
}

/**
 * Função de ordenação genérica entre dois valores tipados
 */
export function compareValues(
  a: unknown,
  b: unknown,
  dataType: TableDataType = 'text',
  direction: 'asc' | 'desc' = 'asc',
): number {
  const normA = normalizeValueForSort(a, dataType)
  const normB = normalizeValueForSort(b, dataType)

  let cmp = 0
  if (typeof normA === 'number' && typeof normB === 'number') {
    cmp = normA - normB
  } else if (typeof normA === 'boolean' && typeof normB === 'boolean') {
    cmp = normA === normB ? 0 : normA ? 1 : -1
  } else {
    cmp = String(normA).localeCompare(String(normB), 'pt-BR', {
      numeric: true,
      sensitivity: 'base',
    })
  }

  return direction === 'asc' ? cmp : -cmp
}
