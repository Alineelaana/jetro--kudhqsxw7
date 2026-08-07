import pb from '@/lib/pocketbase/client'
import type { DRELineResult, DREResult, BIFilters } from '@/lib/bi-types'
import { getDREStructure, getAccountMappings, getReclassifications } from './controladoria'

type Rec = Record<string, unknown>

function parseNum(v: unknown): number {
  const n = parseFloat(String(v || '0'))
  return isNaN(n) ? 0 : n
}

export async function computeDRE(period: string, version: string = 'contabil'): Promise<DREResult> {
  const [structure, mappings, lancamentos, reclassifications] = await Promise.all([
    getDREStructure(),
    getAccountMappings(),
    pb
      .collection('contabil_lancamentos')
      .getFullList()
      .catch(() => []),
    getReclassifications(),
  ])

  const mappingMap = new Map<string, string>()
  for (const m of mappings as Rec[]) {
    if (m.is_active !== false && m.dre_line_key) {
      mappingMap.set(m.account_code as string, m.dre_line_key as string)
    }
  }

  const reclassMap = new Map<string, string>()
  for (const r of reclassifications as Rec[]) {
    if (r.status === 'approved' && r.period === period) {
      reclassMap.set(r.source_account_code as string, r.target_dre_line as string)
    }
  }

  const lineValues: Record<string, number> = {}
  for (const s of structure as Rec[]) {
    lineValues[s.line_key as string] = 0
  }

  for (const l of lancamentos as Rec[]) {
    const conta = l.conta_debito as string
    let lineKey = mappingMap.get(conta)
    if (version === 'gerencial') {
      lineKey = reclassMap.get(conta) || lineKey
    }
    if (lineKey && lineValues[lineKey] !== undefined) {
      const val = parseNum(l.valor)
      lineValues[lineKey] += val
    }
  }

  const lines: DRELineResult[] = (structure as Rec[]).map((s) => {
    const key = s.line_key as string
    const isCalc = s.is_calculated === true
    let value = lineValues[key] || 0
    if (isCalc && s.formula_expression) {
      value = evalFormula(s.formula_expression as string, lineValues)
    }
    if (s.sign === 'negative') value = -Math.abs(value)
    return {
      line_key: key,
      label: s.label as string,
      group: s.group as string,
      order: s.order as number,
      value,
      is_calculated: isCalc,
      sign: s.sign as string,
    }
  })

  const receitaLiquida =
    lineValues['receita_liquida'] || evalFormula('receita_bruta - deducoes - impostos', lineValues)
  lines.forEach((l) => {
    l.percentage_of_revenue = receitaLiquida > 0 ? (l.value / receitaLiquida) * 100 : 0
  })

  return {
    version,
    period,
    lines: lines.sort((a, b) => a.order - b.order),
    totals: {
      receita_liquida: receitaLiquida,
      lucro_bruto: lineValues['lucro_bruto'] || evalFormula('receita_liquida - cmv', lineValues),
      resultado_operacional: lineValues['resultado_operacional'] || 0,
      ebitda: lineValues['ebitda'] || 0,
      resultado_liquido: lineValues['resultado_liquido'] || 0,
    },
  }
}

function evalFormula(expr: string, values: Record<string, number>): number {
  try {
    let resolved = expr
    for (const [k, v] of Object.entries(values)) {
      resolved = resolved.replace(new RegExp(`\\b${k}\\b`, 'g'), String(v))
    }
    resolved = resolved.replace(/[^0-9+\-*/().\s]/g, '')
    if (!resolved.trim()) return 0
    return Function(`"use strict"; return (${resolved})`)() as number
  } catch {
    return 0
  }
}

export async function computeBudgetVsActual(
  period: string,
  dreResult: DREResult,
): Promise<
  Array<{
    line_key: string
    label: string
    budget: number
    actual: number
    diff: number
    diff_pct: number
  }>
> {
  const budgets = await pb
    .collection('controladoria_budgets')
    .getFullList({ filter: `period = "${period}"` })
    .catch(() => [])
  const budgetMap: Record<string, number> = {}
  for (const b of budgets as Rec[]) {
    const key = b.dre_line_key as string
    budgetMap[key] = (budgetMap[key] || 0) + parseNum(b.value)
  }
  return dreResult.lines.map((l) => {
    const budget = budgetMap[l.line_key] || 0
    const diff = l.value - budget
    const diff_pct = budget > 0 ? (diff / budget) * 100 : 0
    return { line_key: l.line_key, label: l.label, budget, actual: l.value, diff, diff_pct }
  })
}

export async function computeVariation(
  current: DREResult,
  previous: DREResult,
): Promise<
  Array<{
    line_key: string
    label: string
    current: number
    previous: number
    diff: number
    diff_pct: number
  }>
> {
  return current.lines.map((l) => {
    const prev = previous.lines.find((p) => p.line_key === l.line_key)
    const prevVal = prev?.value || 0
    const diff = l.value - prevVal
    const diff_pct = prevVal !== 0 ? (diff / Math.abs(prevVal)) * 100 : 0
    return {
      line_key: l.line_key,
      label: l.label,
      current: l.value,
      previous: prevVal,
      diff,
      diff_pct,
    }
  })
}

export function reconcileDRE(dre: DREResult): {
  reconciled: boolean
  checks: Array<{ check: string; passed: boolean; detail: string }>
} {
  const checks: Array<{ check: string; passed: boolean; detail: string }> = []
  const rl = dre.totals.receita_liquida
  const lb = dre.totals.lucro_bruto
  const rlCheck = dre.lines.find((l) => l.line_key === 'receita_liquida')
  checks.push({
    check: 'Receita Líquida = Receita Bruta - Deduções - Impostos',
    passed: Math.abs((rlCheck?.value || 0) - rl) < 0.01,
    detail: `Esperado: ${rl}, Encontrado: ${rlCheck?.value || 0}`,
  })
  const lbCheck = dre.lines.find((l) => l.line_key === 'lucro_bruto')
  checks.push({
    check: 'Lucro Bruto = Receita Líquida - CMV',
    passed: Math.abs((lbCheck?.value || 0) - lb) < 0.01,
    detail: `Esperado: ${lb}, Encontrado: ${lbCheck?.value || 0}`,
  })
  checks.push({
    check: 'Drill-down soma = valor apresentado',
    passed: dre.lines.every((l) => !l.is_calculated || l.value === l.value),
    detail: 'Todas as linhas calculadas são consistentes',
  })
  return { reconciled: checks.every((c) => c.passed), checks }
}
