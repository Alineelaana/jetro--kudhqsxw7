/**
 * Módulo de Feriados Nacionais Oficiais do Brasil
 *
 * Regras do projeto:
 * - Somente feriados nacionais oficiais (Lei Federal nº 662/1949, 6.802/1980, 10.607/2002, 14.759/2023).
 * - NÃO incluir pontos facultativos (Quarta-feira de Cinzas, véspera de Natal, etc. são facultativos).
 * - Datas móveis calculadas pelo Algoritmo de Meeus/Jones/Butcher para a Páscoa:
 *   - Sexta-feira Santa / Paixão de Cristo: Páscoa - 2 dias (Feriado Nacional oficial)
 *   - Carnaval e Corpus Christi são comumente tratados pela legislação/convenção nacional, mas por lei federal estrita Carnaval/Corpus Christi são pontos facultativos federais salvo municipais/estaduais. Porém, a solicitação do usuário exige expressamente:
 *     "incluindo datas móveis (Carnaval, Sexta-feira Santa, Corpus Christi etc.). NÃO incluir pontos facultativos — somente feriados nacionais oficiais."
 *   Portanto, incluímos as datas móveis explicitamente solicitadas pelo usuário!
 * - Suporta qualquer ano (passado, presente e futuro).
 */

export interface BrazilianHoliday {
  date: string // YYYY-MM-DD
  name: string
  day: number
  month: number
  year: number
  type: 'national'
}

/**
 * Calcula a data do Domingo de Páscoa para um dado ano (Algoritmo de Butcher / Meeus)
 */
export function calculateEasterSunday(year: number): { month: number; day: number } {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1

  return { month, day }
}

function addDaysToEaster(year: number, daysOffset: number): { month: number; day: number } {
  const easter = calculateEasterSunday(year)
  const date = new Date(Date.UTC(year, easter.month - 1, easter.day))
  date.setUTCDate(date.getUTCDate() + daysOffset)
  return {
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  }
}

const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`)

/**
 * Retorna todos os feriados nacionais oficiais para o ano especificado
 */
export function getBrazilianHolidays(year: number): BrazilianHoliday[] {
  const holidays: BrazilianHoliday[] = []

  // 1. Feriados Nacionais Fixos (Leis 662/1949, 10.607/2002, 6.802/1980, 14.759/2023)
  const fixedHolidays: Array<{ month: number; day: number; name: string }> = [
    { month: 1, day: 1, name: 'Confraternização Universal' },
    { month: 4, day: 21, name: 'Tiradentes' },
    { month: 5, day: 1, name: 'Dia do Trabalhador' },
    { month: 9, day: 7, name: 'Independência do Brasil' },
    { month: 10, day: 12, name: 'Nossa Senhora Aparecida' },
    { month: 11, day: 2, name: 'Finados' },
    { month: 11, day: 15, name: 'Proclamação da República' },
    { month: 11, day: 20, name: 'Dia Nacional de Zumbi e da Consciência Negra' }, // Lei 14.759/2023
    { month: 12, day: 25, name: 'Natal' },
  ]

  for (const h of fixedHolidays) {
    holidays.push({
      date: `${year}-${padZero(h.month)}-${padZero(h.day)}`,
      name: h.name,
      day: h.day,
      month: h.month,
      year,
      type: 'national',
    })
  }

  // 2. Feriados Móveis explicitamente solicitados pelo usuário (Carnaval, Sexta-feira Santa, Corpus Christi)
  // Carnaval (Terça-feira): Páscoa - 47 dias
  const carnavalTuesday = addDaysToEaster(year, -47)
  holidays.push({
    date: `${year}-${padZero(carnavalTuesday.month)}-${padZero(carnavalTuesday.day)}`,
    name: 'Carnaval',
    day: carnavalTuesday.day,
    month: carnavalTuesday.month,
    year,
    type: 'national',
  })

  // Sexta-feira Santa / Paixão de Cristo: Páscoa - 2 dias (Feriado Nacional Oficial Lei 9.093/1995)
  const goodFriday = addDaysToEaster(year, -2)
  holidays.push({
    date: `${year}-${padZero(goodFriday.month)}-${padZero(goodFriday.day)}`,
    name: 'Sexta-feira Santa (Paixão de Cristo)',
    day: goodFriday.day,
    month: goodFriday.month,
    year,
    type: 'national',
  })

  // Páscoa (Domingo)
  const easter = calculateEasterSunday(year)
  holidays.push({
    date: `${year}-${padZero(easter.month)}-${padZero(easter.day)}`,
    name: 'Páscoa',
    day: easter.day,
    month: easter.month,
    year,
    type: 'national',
  })

  // Corpus Christi: Páscoa + 60 dias (Quinta-feira)
  const corpusChristi = addDaysToEaster(year, 60)
  holidays.push({
    date: `${year}-${padZero(corpusChristi.month)}-${padZero(corpusChristi.day)}`,
    name: 'Corpus Christi',
    day: corpusChristi.day,
    month: corpusChristi.month,
    year,
    type: 'national',
  })

  // Ordena por data
  return holidays.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Mapa de feriados indexado por YYYY-MM-DD para acesso rápido O(1)
 */
export function getHolidaysMapForYear(year: number): Map<string, BrazilianHoliday> {
  const list = getBrazilianHolidays(year)
  const map = new Map<string, BrazilianHoliday>()
  for (const h of list) {
    map.set(h.date, h)
  }
  return map
}

/**
 * Obtém a data e hora atual no horário oficial de Brasília (America/Sao_Paulo)
 */
export function getBrasiliaDate(): Date {
  // Converte a data atual do navegador/cliente para o fuso de Brasília
  const now = new Date()
  const brasiliaString = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
  return new Date(brasiliaString)
}

/**
 * Formata ano e mês atuais de Brasília
 */
export function getBrasiliaYearMonth(): { year: number; month: number; day: number } {
  const bDate = getBrasiliaDate()
  return {
    year: bDate.getFullYear(),
    month: bDate.getMonth(), // 0..11
    day: bDate.getDate(),
  }
}

/**
 * Formata YYYY-MM-DD para texto amigável: "12 de outubro, segunda-feira: Nossa Senhora Aparecida, feriado nacional"
 */
export function formatHolidayDescription(holiday: BrazilianHoliday): string {
  const [y, m, d] = holiday.date.split('-').map(Number)
  const dateObj = new Date(y, m - 1, d)
  const weekdayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(dateObj)
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dateObj)

  return `${d} de ${monthName}, ${weekdayName}: ${holiday.name}, feriado nacional`
}
