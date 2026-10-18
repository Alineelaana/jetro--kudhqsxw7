/**
 * Suíte de testes de unidade para validação obrigatória dos horários, fusos e tratamentos.
 * Pode ser executada pelo runner ou invocada em runtime para garantia de 0 regressões.
 */
import {
  getSaudacaoPorHoraMinuto,
  getMensagemTratamento,
  extrairPrimeiroNome,
  resolveSafeTimeZone,
  isValidTimeZone,
} from './jetro-greeting'

export interface TestResult {
  passed: boolean
  description: string
  expected: unknown
  actual: unknown
}

export function runGreetingValidationSuite(): {
  allPassed: boolean
  results: TestResult[]
} {
  const results: TestResult[] = []

  // 1. CASOS DE TESTE OBRIGATÓRIOS ESPECIFICADOS NO BRIEFING:
  // - 04:59 → Boa noite
  // - 05:00 → Bom dia
  // - 11:59 → Bom dia
  // - 12:00 → Boa tarde
  // - 17:59 → Boa tarde
  // - 18:00 → Boa noite
  // - 23:59 → Boa noite
  // - 00:00 → Boa noite

  const testCases: Array<{
    h: number
    m: number
    expected: 'Bom dia' | 'Boa tarde' | 'Boa noite'
  }> = [
    { h: 4, m: 59, expected: 'Boa noite' },
    { h: 5, m: 0, expected: 'Bom dia' },
    { h: 11, m: 59, expected: 'Bom dia' },
    { h: 12, m: 0, expected: 'Boa tarde' },
    { h: 17, m: 59, expected: 'Boa tarde' },
    { h: 18, m: 0, expected: 'Boa noite' },
    { h: 23, m: 59, expected: 'Boa noite' },
    { h: 0, m: 0, expected: 'Boa noite' },
  ]

  for (const tc of testCases) {
    const res = getSaudacaoPorHoraMinuto(tc.h, tc.m)
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
    const timeStr = `${pad(tc.h)}:${pad(tc.m)}`
    results.push({
      passed: res.saudacao === tc.expected,
      description: `Horário ${timeStr} deve retornar "${tc.expected}"`,
      expected: tc.expected,
      actual: res.saudacao,
    })
  }

  // 2. CASOS DE TRATAMENTO OBRIGATÓRIOS
  // - Masculino: "Seja bem-vindo ao Jetro Sistema Inteligente!"
  // - Feminino: "Seja bem-vinda ao Jetro Sistema Inteligente!"
  // - Sem preferência/neutro: "Seja bem vindo (a) ao Jetro ,Sistema Inteligente!"
  const treatmentCases = [
    { input: 'masculino', expected: 'Seja bem-vindo ao Jetro Sistema Inteligente!' },
    { input: 'feminino', expected: 'Seja bem-vinda ao Jetro Sistema Inteligente!' },
    { input: 'neutro', expected: 'Seja bem vindo (a) ao Jetro ,Sistema Inteligente!' },
    { input: '', expected: 'Seja bem vindo (a) ao Jetro ,Sistema Inteligente!' },
    { input: null, expected: 'Seja bem vindo (a) ao Jetro ,Sistema Inteligente!' },
    { input: undefined, expected: 'Seja bem vindo (a) ao Jetro ,Sistema Inteligente!' },
  ]

  for (const tc of treatmentCases) {
    const res = getMensagemTratamento(tc.input)
    results.push({
      passed: res === tc.expected,
      description: `Tratamento "${tc.input}" deve retornar "${tc.expected}"`,
      expected: tc.expected,
      actual: res,
    })
  }

  // 3. CASOS DE EXTRAÇÃO DE PRIMEIRO NOME (Sem nomes fictícios, real do cadastro)
  const nameCases = [
    { name: 'Carlos Eduardo Silva', email: 'carlos@jetro.com.br', expected: 'Carlos' },
    { name: 'ANA BEATRIZ', email: 'ana@jetro.com.br', expected: 'Ana' },
    { name: 'pedro', email: 'pedro@jetro.com.br', expected: 'Pedro' },
    { name: '', email: 'mariana.costa@empresa.com.br', expected: 'Mariana' },
    { name: null, email: null, expected: 'Usuário' },
  ]

  for (const tc of nameCases) {
    const res = extrairPrimeiroNome(tc.name, tc.email)
    results.push({
      passed: res === tc.expected,
      description: `Nome "${tc.name || ''}" (${tc.email || ''}) deve extrair "${tc.expected}"`,
      expected: tc.expected,
      actual: res,
    })
  }

  // 4. TRATAMENTO SEGURO DE FUSO HORÁRIO
  results.push({
    passed: isValidTimeZone('America/Sao_Paulo'),
    description: 'Fuso America/Sao_Paulo deve ser válido',
    expected: true,
    actual: isValidTimeZone('America/Sao_Paulo'),
  })
  results.push({
    passed: !isValidTimeZone('FusoInvalido123'),
    description: 'Fuso inválido deve ser rejeitado com segurança',
    expected: false,
    actual: isValidTimeZone('FusoInvalido123'),
  })
  results.push({
    passed: resolveSafeTimeZone('FusoInvalido123') !== 'FusoInvalido123',
    description: 'Fallback seguro quando fuso for inválido',
    expected: true,
    actual: resolveSafeTimeZone('FusoInvalido123') !== 'FusoInvalido123',
  })

  const allPassed = results.every((r) => r.passed)
  return { allPassed, results }
}
