import type { BudgetRecord } from '@/lib/types'

export interface AttendantOption {
  value: string
  label: string
}

function formatDateBR(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function matchesSearch(record: BudgetRecord, term: string): boolean {
  if (!term.trim()) return true
  const lower = term.toLowerCase().trim()
  const fields = [
    record.budget_number,
    record.client_name,
    record.client_email,
    record.client_phone,
    record.service,
    record.status,
    record.responsible_email,
    record.responsible_phone,
  ]
  if (fields.some((f) => f?.toLowerCase().includes(lower))) return true
  if (formatDateBR(record.created).toLowerCase().includes(lower)) return true
  if (record.data) {
    for (const value of Object.values(record.data)) {
      if (value != null && String(value).toLowerCase().includes(lower)) return true
    }
  }
  return false
}

export function matchesClient(record: BudgetRecord, term: string): boolean {
  if (!term.trim()) return true
  const lower = term.toLowerCase().trim()
  return (
    record.client_name?.toLowerCase().includes(lower) ||
    record.client_email?.toLowerCase().includes(lower) ||
    record.client_phone?.toLowerCase().includes(lower)
  )
}

export function matchesAttendant(record: BudgetRecord, attendant: string): boolean {
  if (!attendant) return true
  return record.responsible_email === attendant || record.responsible_phone === attendant
}

export function matchesDateRange(
  record: BudgetRecord,
  startDate: string,
  endDate: string,
): boolean {
  if (!startDate && !endDate) return true
  const recordDate = new Date(record.created)
  if (startDate && recordDate < new Date(startDate + 'T00:00:00')) return false
  if (endDate && recordDate > new Date(endDate + 'T23:59:59')) return false
  return true
}

export function extractAttendants(records: BudgetRecord[]): AttendantOption[] {
  const map = new Map<string, string>()
  for (const r of records) {
    const email = r.responsible_email?.trim()
    const phone = r.responsible_phone?.trim()
    if (email && !map.has(email)) {
      map.set(email, email)
    } else if (phone && !map.has(phone)) {
      map.set(phone, phone)
    }
  }
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
}

export function filterRecords(
  records: BudgetRecord[],
  filters: {
    searchTerm: string
    clientFilter: string
    attendantFilter: string
    startDate: string
    endDate: string
  },
): BudgetRecord[] {
  return records.filter(
    (r) =>
      matchesSearch(r, filters.searchTerm) &&
      matchesClient(r, filters.clientFilter) &&
      matchesAttendant(r, filters.attendantFilter) &&
      matchesDateRange(r, filters.startDate, filters.endDate),
  )
}
