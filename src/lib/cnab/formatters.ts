/**
 * Utilitários de formatação para arquivos de texto CNAB (tamanho fixo, preenchimento com zeros ou espaços)
 */

export function padLeftZeros(value: string | number, length: number): string {
  const str = String(value || '').replace(/\D/g, '')
  if (str.length >= length) return str.slice(0, length)
  return '0'.repeat(length - str.length) + str
}

export function padRightSpaces(value: string | number | undefined | null, length: number): string {
  const raw = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toUpperCase()
  if (raw.length >= length) return raw.slice(0, length)
  return raw + ' '.repeat(length - raw.length)
}

export function formatCnabDate(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date()
    const d = String(now.getDate()).padStart(2, '0')
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const y = String(now.getFullYear())
    return `${d}${m}${y}`
  }
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}${parts[1]}${parts[0]}` // DDMMAAAA
  }
  return padLeftZeros('', 8)
}

export function formatCnabDate6(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date()
    const d = String(now.getDate()).padStart(2, '0')
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const y = String(now.getFullYear()).slice(-2)
    return `${d}${m}${y}`
  }
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}${parts[1]}${parts[0].slice(-2)}` // DDMMAA
  }
  return padLeftZeros('', 6)
}

export function formatCnabCurrency(value: string | number, length: number): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value || '0').replace(',', '.'))
  const cents = Math.round(Math.abs(num) * 100)
  return padLeftZeros(cents, length)
}

export function parseCnabDate(str: string): string {
  if (!str || str === '00000000' || str === '000000' || str.trim().length === 0) {
    return ''
  }
  const cleaned = str.trim()
  if (cleaned.length === 8) {
    // DDMMAAAA
    const day = cleaned.slice(0, 2)
    const month = cleaned.slice(2, 4)
    const year = cleaned.slice(4, 8)
    return `${year}-${month}-${day}`
  }
  if (cleaned.length === 6) {
    // DDMMAA
    const day = cleaned.slice(0, 2)
    const month = cleaned.slice(2, 4)
    const year = '20' + cleaned.slice(4, 6)
    return `${year}-${month}-${day}`
  }
  return ''
}

export function parseCnabCurrency(str: string): number {
  if (!str) return 0
  const cents = parseInt(str.replace(/\D/g, ''), 10)
  if (isNaN(cents)) return 0
  return cents / 100
}

export function simpleChecksum(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // 32bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')
}
