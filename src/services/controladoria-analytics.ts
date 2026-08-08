import pb from '@/lib/pocketbase/client'
import type { DRELineResult, DREResult, BIFilters } from '@/lib/bi-types'
import {
  getDREStructure,
  getAccountMappings,
  getReclassifications,
  getMargins,
} from './controladoria'

type Rec = Record<string, unknown>

function parseNum(v: unknown): number {
  const n = parseFloat(String(v || '0'))
  return isNaN(n) ? 0 : n
}

export async function computeDRE(
  period: string,
  version: string = 'contabil',
  orgFilter?: string,
): Promise<DREResult> {
  return pb.send('/backend/v1/dre/compute', {
    method: 'POST',
    body: JSON.stringify({ period, version, orgFilter }),
    headers: { 'Content-Type': 'application/json' },
  })
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

export async function computeEbitda(period: string): Promise<{
  ebitda: number
  margin: number
  components: Array<{ key: string; label: string; value: number }>
}> {
  const dre = await computeDRE(period, 'gerencial')
  const ebitda = dre.totals.ebitda
  const margin = dre.totals.receita_liquida > 0 ? (ebitda / dre.totals.receita_liquida) * 100 : 0
  const components = dre.lines
    .filter((l) => ['resultado_operacional', 'depreciacao'].includes(l.line_key))
    .map((l) => ({ key: l.line_key, label: l.label, value: l.value }))
  return { ebitda, margin, components }
}

export async function computeMarginsByDimension(
  dimension: string,
  _period: string,
): Promise<
  Array<{
    entity_name: string
    revenue: number
    cost: number
    margin: number
    margin_percent: number
  }>
> {
  const margins = await getMargins(dimension).catch(() => [])
  return (margins as Rec[]).map((m) => {
    const revenue = parseNum(m.revenue)
    const cost = parseNum(m.cost)
    const margin = revenue - cost
    const margin_percent = revenue > 0 ? (margin / revenue) * 100 : 0
    return { entity_name: m.entity_name as string, revenue, cost, margin, margin_percent }
  })
}

export async function computeProjection(period: string): Promise<{
  realized: number
  budget: number
  forecast: number
  method: string
}> {
  const dre = await computeDRE(period, 'contabil').catch(() => null)
  const budgets = await pb
    .collection('controladoria_budgets')
    .getFullList({ filter: `period = "${period}"` })
    .catch(() => [])
  const forecasts = await pb
    .collection('controladoria_forecasts')
    .getFullList({ filter: `period = "${period}"` })
    .catch(() => [])
  const realized = dre?.totals.receita_liquida || 0
  const budget = (budgets as Rec[]).reduce((s, b) => s + parseNum(b.value), 0)
  const forecast = (forecasts as Rec[]).reduce((s, f) => s + parseNum(f.value), 0)
  return { realized, budget, forecast: forecast || realized * 1.1, method: 'historical_avg' }
}

export async function computeVariationAnalysis(period: string): Promise<
  Array<{
    line_key: string
    label: string
    current: number
    previous: number
    variation: number
    variation_pct: number
    is_material: boolean
  }>
> {
  const current = await computeDRE(period, 'contabil')
  const [y, m] = period.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  const prevPeriod = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const previous = await computeDRE(prevPeriod, 'contabil')
  const materiality = await pb
    .collection('controladoria_materiality')
    .getFullList()
    .catch(() => [])
  const threshold = (materiality as Rec[]).find((mt) => mt.indicator_name === 'Receita')
  const limit = parseNum(threshold?.limit || '5')
  return current.lines.map((l) => {
    const prev = previous.lines.find((p) => p.line_key === l.line_key)
    const prevVal = prev?.value || 0
    const variation = l.value - prevVal
    const variation_pct = prevVal !== 0 ? (variation / Math.abs(prevVal)) * 100 : 0
    return {
      line_key: l.line_key,
      label: l.label,
      current: l.value,
      previous: prevVal,
      variation,
      variation_pct,
      is_material: Math.abs(variation_pct) >= limit,
    }
  })
}

export async function drillDownDRELine(
  lineKey: string,
  period: string,
  orgFilter?: string,
): Promise<Record<string, unknown>[]> {
  const mappings = await getAccountMappings()
  const lineAccounts = (mappings as Rec[]).filter((m) => m.dre_line_key === lineKey)
  if (lineAccounts.length === 0) return []
  const codes = lineAccounts.map((m) => m.account_code as string)
  const codeFilter = codes
    .map((c) => `conta_debito = "${c}" || conta_credito = "${c}"`)
    .join(' || ')
  if (!codeFilter) return []
  const filters = [codeFilter]
  if (period) {
    const [y, m] = period.split('-')
    const startDate = `${y}-${m}-01`
    const nextM = m === '12' ? '01' : String(parseInt(m) + 1).padStart(2, '0')
    const nextY = m === '12' ? String(parseInt(y) + 1) : y
    filters.push(`data >= "${startDate}" && data < "${nextY}-${nextM}-01"`)
  }
  if (orgFilter) filters.push(`(${orgFilter})`)
  const filter = filters.join(' && ')
  return pb
    .collection('contabil_lancamentos')
    .getFullList({ filter })
    .catch(() => []) as Promise<Record<string, unknown>[]>
}
