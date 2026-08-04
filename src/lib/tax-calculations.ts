export interface TaxBracket {
  min: number
  max: number
  rate: number
  deduction: number
}

export interface TaxCalcResult {
  base: number
  bracketLabel: string
  rate: number
  deduction: number
  value: number
}

export function calculateINSS(base: number, brackets: TaxBracket[], teto: number): TaxCalcResult {
  if (base <= 0) return { base: 0, bracketLabel: 'Isento', rate: 0, deduction: 0, value: 0 }
  let value = 0
  let label = ''
  for (const b of brackets) {
    if (base > b.min) {
      const taxable = Math.min(base, b.max) - b.min
      value += taxable * (b.rate / 100)
      label = `Faixa ${b.rate}% ate R$ ${b.max.toFixed(2)}`
    }
  }
  if (value > teto) {
    value = teto
    label = `Teto INSS - R$ ${teto.toFixed(2)}`
  }
  return { base, bracketLabel: label, rate: 0, deduction: 0, value: Math.round(value * 100) / 100 }
}

export function calculateIRRF(
  base: number,
  brackets: TaxBracket[],
  dependents: number,
  dependentDeduction: number,
): TaxCalcResult {
  const dependentTotal = dependents * dependentDeduction
  const baseCalculo = Math.max(0, base - dependentTotal)
  if (baseCalculo <= 0) return { base: 0, bracketLabel: 'Isento', rate: 0, deduction: 0, value: 0 }
  for (const b of brackets) {
    if (baseCalculo >= b.min && baseCalculo <= b.max) {
      const value = Math.max(0, baseCalculo * (b.rate / 100) - b.deduction)
      return {
        base: baseCalculo,
        bracketLabel: `Faixa ${b.rate}% - R$ ${b.min.toFixed(2)} a R$ ${b.max > 999999 ? '\u221e' : b.max.toFixed(2)}`,
        rate: b.rate,
        deduction: b.deduction,
        value: Math.round(value * 100) / 100,
      }
    }
  }
  return { base: baseCalculo, bracketLabel: 'Isento', rate: 0, deduction: 0, value: 0 }
}

export function calculateFGTS(base: number, rate: number): number {
  return Math.round(base * (rate / 100) * 100) / 100
}
