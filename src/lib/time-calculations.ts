export function parseTimeToMinutes(time: string): number {
  if (!time) return 0
  const parts = time.split(':')
  const hours = parseInt(parts[0]) || 0
  const minutes = parseInt(parts[1]) || 0
  const isNegative = time.trim().startsWith('-')
  const total = Math.abs(hours) * 60 + minutes
  return isNegative ? -total : total
}

export function minutesToTime(minutes: number): string {
  const sign = minutes < 0 ? '-' : ''
  const abs = Math.abs(minutes)
  const hours = Math.floor(abs / 60)
  const mins = abs % 60
  return `${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function calculateWorkedMinutes(record: {
  entrada?: string
  saida_intervalo?: string
  retorno_intervalo?: string
  saida?: string
}): number {
  const entrada = parseTimeToMinutes(record.entrada || '')
  const saidaIntervalo = parseTimeToMinutes(record.saida_intervalo || '')
  const retornoIntervalo = parseTimeToMinutes(record.retorno_intervalo || '')
  const saida = parseTimeToMinutes(record.saida || '')
  if (!entrada || !saida) return 0
  const morningWork = saidaIntervalo ? saidaIntervalo - entrada : 0
  const afternoonWork = retornoIntervalo ? saida - retornoIntervalo : saida - entrada
  return Math.max(0, morningWork + afternoonWork)
}

export function calculateOvertimeMinutes(workedMinutes: number, expectedMinutes = 480): number {
  return Math.max(0, workedMinutes - expectedMinutes)
}

export interface TimeCalcResult {
  workedMinutes: number
  workedTime: string
  overtimeMinutes: number
  overtimeTime: string
  bankChange: number
  bankChangeTime: string
  lateMinutes: number
  lateTime: string
}

export function calculateTimeRecord(
  record: {
    entrada?: string
    saida_intervalo?: string
    retorno_intervalo?: string
    saida?: string
    horas_extras?: string
    banco_horas?: string
    atrasos?: string
  },
  expectedMinutes = 480,
): TimeCalcResult {
  const worked = calculateWorkedMinutes(record)
  const overtime =
    parseTimeToMinutes(record.horas_extras || '') ||
    calculateOvertimeMinutes(worked, expectedMinutes)
  const bankChange = parseTimeToMinutes(record.banco_horas || '') || worked - expectedMinutes
  const late = parseTimeToMinutes(record.atrasos || '') || 0
  return {
    workedMinutes: worked,
    workedTime: minutesToTime(worked),
    overtimeMinutes: overtime,
    overtimeTime: minutesToTime(overtime),
    bankChange,
    bankChangeTime: minutesToTime(bankChange),
    lateMinutes: late,
    lateTime: minutesToTime(late),
  }
}
