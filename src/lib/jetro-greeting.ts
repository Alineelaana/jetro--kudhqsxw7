/**
 * Utilitários de saudação e boas-vindas do ERP Jetro
 *
 * REGRAS FIXAS E OBRIGATÓRIAS (não podem variar):
 * - 05:00 até 11:59 → "Bom dia"
 * - 12:00 até 17:59 → "Boa tarde"
 * - 18:00 até 04:59 → "Boa noite"
 *
 * Casos de teste obrigatórios:
 * - 04:59 → Boa noite
 * - 05:00 → Bom dia
 * - 11:59 → Bom dia
 * - 12:00 → Boa tarde
 * - 17:59 → Boa tarde
 * - 18:00 → Boa noite
 * - 23:59 → Boa noite
 * - 00:00 → Boa noite
 *
 * NUNCA usar horário do servidor.
 * Usar fuso configurado no perfil do usuário; se não houver, fuso do dispositivo com tratamento seguro para valores inválidos; para Brasília, fuso "America/Sao_Paulo".
 */

export type PeriodoDia = 'manha' | 'tarde' | 'noite'

export interface SaudacaoInfo {
  saudacao: 'Bom dia' | 'Boa tarde' | 'Boa noite'
  icone: string // ex: "☀️", "🌤️", "🌙"
  periodo: PeriodoDia
  horaAtualFormatada: string
  fusoUtilizado: string
}

export type TratamentoUsuario = 'masculino' | 'feminino' | 'neutro'

/**
 * Valida se um fuso horário IANA é aceito pelo navegador de forma segura.
 */
export function isValidTimeZone(timeZone?: string | null): boolean {
  if (!timeZone || typeof timeZone !== 'string') return false
  const trimmed = timeZone.trim()
  if (!trimmed) return false
  try {
    Intl.DateTimeFormat(undefined, { timeZone: trimmed })
    return true
  } catch {
    return false
  }
}

/**
 * Resolve o fuso horário seguro do usuário:
 * 1. Fuso explícito do perfil (se válido)
 * 2. Fuso do dispositivo (Intl.DateTimeFormat().resolvedOptions().timeZone)
 * 3. Fallback final seguro: "America/Sao_Paulo"
 */
export function resolveSafeTimeZone(userTimeZone?: string | null): string {
  if (userTimeZone && isValidTimeZone(userTimeZone)) {
    return userTimeZone.trim()
  }
  try {
    const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (deviceTz && isValidTimeZone(deviceTz)) {
      return deviceTz
    }
  } catch {
    /* fallback abaixo */
  }
  return 'America/Sao_Paulo'
}

/**
 * Determina a saudação com base EXCLUSIVAMENTE em hora (0..23) e minuto (0..59).
 * Esta função pura garante testabilidade estrita para os 8 casos de teste obrigatórios.
 *
 * Regras:
 * - 05:00 até 11:59 → "Bom dia"
 * - 12:00 até 17:59 → "Boa tarde"
 * - 18:00 até 04:59 → "Boa noite"
 */
export function getSaudacaoPorHoraMinuto(
  hours: number,
  minutes: number = 0,
): {
  saudacao: 'Bom dia' | 'Boa tarde' | 'Boa noite'
  icone: string
  periodo: PeriodoDia
} {
  // Converte para minutos desde o início do dia (0 a 1439) para comparação inequívoca
  const totalMinutes = hours * 60 + minutes

  const min0500 = 5 * 60 // 300
  const min1200 = 12 * 60 // 720
  const min1800 = 18 * 60 // 1080

  if (totalMinutes >= min0500 && totalMinutes < min1200) {
    return {
      saudacao: 'Bom dia',
      icone: '☀️',
      periodo: 'manha',
    }
  }

  if (totalMinutes >= min1200 && totalMinutes < min1800) {
    return {
      saudacao: 'Boa tarde',
      icone: '🌤️',
      periodo: 'tarde',
    }
  }

  // Das 18:00 até 23:59 E das 00:00 até 04:59
  return {
    saudacao: 'Boa noite',
    icone: '🌙',
    periodo: 'noite',
  }
}

/**
 * Obtém a hora e minuto atuais no fuso horário especificado.
 */
export function getHoursAndMinutesInTimeZone(
  date: Date = new Date(),
  timeZone: string = 'America/Sao_Paulo',
): { hours: number; minutes: number; formatted: string } {
  const safeTz = resolveSafeTimeZone(timeZone)

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTz,
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)

  let hours = 0
  let minutes = 0

  for (const part of parts) {
    if (part.type === 'hour') {
      hours = parseInt(part.value, 10)
    } else if (part.type === 'minute') {
      minutes = parseInt(part.value, 10)
    }
  }

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  const formatted = `${pad(hours)}:${pad(minutes)}`

  return { hours, minutes, formatted }
}

/**
 * Calcula a saudação atual respeitando o fuso do perfil ou dispositivo.
 */
export function getSaudacaoAtual(
  userTimeZone?: string | null,
  referenceDate: Date = new Date(),
): SaudacaoInfo {
  const safeTz = resolveSafeTimeZone(userTimeZone)
  const { hours, minutes, formatted } = getHoursAndMinutesInTimeZone(referenceDate, safeTz)
  const base = getSaudacaoPorHoraMinuto(hours, minutes)

  return {
    ...base,
    horaAtualFormatada: formatted,
    fusoUtilizado: safeTz,
  }
}

/**
 * Extrai de forma segura o primeiro nome do usuário autenticado.
 * NUNCA usa nomes fixos ou fictícios.
 */
export function extrairPrimeiroNome(
  nomeCompleto?: string | null,
  emailFallback?: string | null,
): string {
  if (nomeCompleto && typeof nomeCompleto === 'string') {
    const trimmed = nomeCompleto.trim()
    if (trimmed.length > 0) {
      const parts = trimmed.split(/\s+/)
      if (parts.length > 0 && parts[0].length > 0) {
        // Capitaliza corretamente: ex "CARLOS" -> "Carlos" ou "joão" -> "João"
        const first = parts[0]
        return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
      }
    }
  }

  if (emailFallback && typeof emailFallback === 'string') {
    const userPart = emailFallback.split('@')[0] || ''
    const clean = userPart.replace(/[._-]+/g, ' ').trim()
    if (clean.length > 0) {
      const first = clean.split(/\s+/)[0]
      return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
    }
  }

  return 'Usuário'
}

/**
 * Textos fixos oficiais da tela inicial inteligente:
 */
export const TEXTO_AGENDA_CONFIRMAÇÃO =
  'Confira sua agenda e seu calendário corporativos abaixo, organize seus compromissos e mantenha suas atividades em dia.'

export const TEXTO_EXCELENTE_DIA_TRABALHO =
  'Desejamos a você um excelente dia de trabalho! Sempre que precisar de ajuda, o Jetro On-line estará à sua disposição no canto direito da tela.'

/**
 * @deprecated Mantido para compatibilidade retrospectiva
 */
export const TEXTO_BOM_TRABALHO = TEXTO_EXCELENTE_DIA_TRABALHO

/**
 * Linha 1 de boas-vindas conforme TRATAMENTO cadastrado (mantido como fallback utilitário):
 * - Tratamento masculino: "Seja bem-vindo ao Jetro Sistema Inteligente!"
 * - Feminino: "Seja bem-vinda ao Jetro Sistema Inteligente!"
 * - Sem preferência/neutro: "Seja bem vindo (a) ao Jetro ,Sistema Inteligente!"
 */
export function getMensagemTratamento(tratamento?: string | null): string {
  const norm = String(tratamento || '')
    .toLowerCase()
    .trim()
  if (norm === 'masculino' || norm === 'm' || norm === 'ele' || norm === 'sr') {
    return 'Seja bem-vindo ao Jetro Sistema Inteligente!'
  }
  if (norm === 'feminino' || norm === 'f' || norm === 'ela' || norm === 'sra') {
    return 'Seja bem-vinda ao Jetro Sistema Inteligente!'
  }
  return 'Seja bem vindo (a) ao Jetro ,Sistema Inteligente!'
}
/**
 * Constrói a frase de saudação completa com nome e ícone:
 * ex: "Bom dia, Carlos! ☀️" / "Boa tarde, Carlos! 🌤️" / "Boa noite, Carlos! 🌙"
 */
export function formatarSaudacaoCompleta(
  saudacao: 'Bom dia' | 'Boa tarde' | 'Boa noite',
  primeiroNome: string,
  icone: string,
): string {
  return `${saudacao}, ${primeiroNome}! ${icone}`
}

/**
 * Calcula os milissegundos restantes até a próxima virada de período
 * (05:00, 12:00 ou 18:00) no fuso do usuário, para agendamento inteligente sem poluição de timers.
 */
export function getMsAteProximaVirada(
  userTimeZone?: string | null,
  referenceDate: Date = new Date(),
): number {
  const safeTz = resolveSafeTimeZone(userTimeZone)
  const { hours, minutes } = getHoursAndMinutesInTimeZone(referenceDate, safeTz)
  const currentTotal = hours * 60 + minutes

  // Marcos: 05:00 (300m), 12:00 (720m), 18:00 (1080m), 05:00 dia seguinte (300 + 1440 = 1740m)
  const targets = [300, 720, 1080, 1740]
  let nextTarget = 1740

  for (const t of targets) {
    if (t > currentTotal) {
      nextTarget = t
      break
    }
  }

  const diffMinutes = nextTarget - currentTotal
  // Adiciona 5 segundos extras para garantir que ao disparar já cruzou o minuto
  return Math.max(5000, diffMinutes * 60 * 1000 + 5000)
}
