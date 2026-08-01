import type { BudgetRecord } from '@/lib/types'

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}min`
  if (minutes > 0) return `${minutes}min`
  return `${seconds}s`
}

export function formatDurationHuman(ms: number): string {
  if (ms <= 0) return 'menos de 1 minuto'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} ${days === 1 ? 'dia' : 'dias'}`
  if (hours > 0) return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
  if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  return 'menos de 1 minuto'
}

export function getResponseTime(
  createdAt: string,
  quoteCreatedAt?: string,
): { text: string; hasQuote: boolean } {
  const created = new Date(createdAt)
  if (isNaN(created.getTime())) return { text: '—', hasQuote: false }

  if (quoteCreatedAt) {
    const quoteCreated = new Date(quoteCreatedAt)
    if (isNaN(quoteCreated.getTime())) return { text: '—', hasQuote: false }
    const diff = quoteCreated.getTime() - created.getTime()
    return { text: formatDuration(diff), hasQuote: true }
  }

  const diff = Date.now() - created.getTime()
  return { text: formatDuration(diff), hasQuote: false }
}

export function getAverageResponseTime(records: BudgetRecord[]): string {
  const withQuote = records.filter((r) => r.quote_created_at)
  if (withQuote.length === 0) return ''

  let totalMs = 0
  let count = 0
  for (const r of withQuote) {
    const created = new Date(r.created).getTime()
    const quoteCreated = new Date(r.quote_created_at!).getTime()
    if (!isNaN(created) && !isNaN(quoteCreated)) {
      totalMs += quoteCreated - created
      count++
    }
  }

  if (count === 0) return ''
  return formatDurationHuman(totalMs / count)
}
