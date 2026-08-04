import pb from '@/lib/pocketbase/client'
import {
  calculateINSS,
  calculateIRRF,
  calculateFGTS,
  type TaxBracket,
  type TaxCalcResult,
} from '@/lib/tax-calculations'

export interface PayrollItem {
  employee_id: string
  employee_name: string
  cargo: string
  departamento: string
  salario_base: number
  horas_extras: number
  adicional_noturno: number
  beneficios: number
  faltas_deducao: number
  adiantamentos: number
  pensao: number
  outros_descontos: number
  dependentes: number
  inss: TaxCalcResult
  irrf: TaxCalcResult
  fgts: number
  valor_bruto: number
  valor_liquido: number
}

export interface PayrollSimulation {
  competencia: string
  items: PayrollItem[]
  total_bruto: number
  total_liquido: number
  total_inss: number
  total_irrf: number
  total_fgts: number
  total_encargos: number
}

export interface TaxTables {
  inss: TaxBracket[]
  inss_teto: number
  irrf: TaxBracket[]
  dependent_deduction: number
  fgts_rate: number
}

export async function getTaxTables(): Promise<TaxTables> {
  const params = await pb.collection('system_parameters').getFullList({
    filter: 'module = "Folha"',
  })
  const get = (key: string) =>
    (params as Array<Record<string, unknown>>).find((p) => p.key === key)?.value as
      | string
      | undefined
  const inss = get('inss_table') ? JSON.parse(get('inss_table')!) : []
  const irrf = get('irrf_table') ? JSON.parse(get('irrf_table')!) : []
  return {
    inss,
    inss_teto: parseFloat(get('inss_teto') || '908.85'),
    irrf,
    dependent_deduction: parseFloat(get('irrf_dependent_deduction') || '189.59'),
    fgts_rate: parseFloat(get('fgts_rate') || '8'),
  }
}

export async function simulatePayroll(competencia: string): Promise<PayrollSimulation> {
  const [tables, employees, timeRecords, benefits] = await Promise.all([
    getTaxTables(),
    pb
      .collection('rh_employees')
      .getFullList({
        filter: 'situacao = "Ativo" || situacao = "Em Experiência" || situacao = "Em Experiencia"',
      })
      .catch(() => []),
    pb
      .collection('rh_time_records')
      .getFullList({
        filter: `data ~ "${competencia}"`,
      })
      .catch(() => []),
    pb
      .collection('rh_employee_benefits')
      .getFullList()
      .catch(() => []),
  ])

  const items: PayrollItem[] = (employees as any[]).map((emp) => {
    const salario = parseFloat(emp.salario) || 0
    const empTime = (timeRecords as any[]).filter(
      (t) => t.employee_name === emp.nome_completo || t.employee_id === emp.id,
    )
    const horasExtras = empTime.reduce((s, t) => {
      const h = parseFloat(t.horas_extras) || 0
      return s + (h > 0 ? h * (salario / 220) * 1.5 : 0)
    }, 0)
    const noturno = empTime.reduce((s, t) => s + (parseFloat(t.adicional_noturno) || 0), 0)
    const faltas = empTime.filter((t) => t.faltas && t.faltas !== '00:00').length
    const faltasDeducao = faltas * (salario / 30)
    const empBenefits = (benefits as any[]).filter(
      (b) => b.employee_name === emp.nome_completo || b.employee_id === emp.id,
    )
    const beneficiosDesconto = empBenefits.reduce(
      (s, b) => s + (parseFloat(b.valor_descontado) || 0),
      0,
    )
    const valorBruto = salario + horasExtras + noturno - faltasDeducao
    const inss = calculateINSS(valorBruto, tables.inss, tables.inss_teto)
    const irrfBase = valorBruto - inss.value
    const dependentes = Array.isArray(emp.dependentes) ? emp.dependentes.length : 0
    const irrf = calculateIRRF(irrfBase, tables.irrf, dependentes, tables.dependent_deduction)
    const fgts = calculateFGTS(salario, tables.fgts_rate)
    const valorLiquido = valorBruto - inss.value - irrf.value - beneficiosDesconto

    return {
      employee_id: emp.id,
      employee_name: emp.nome_completo || '\u2014',
      cargo: emp.cargo || '\u2014',
      departamento: emp.departamento || '\u2014',
      salario_base: salario,
      horas_extras: Math.round(horasExtras * 100) / 100,
      adicional_noturno: Math.round(noturno * 100) / 100,
      beneficios: Math.round(beneficiosDesconto * 100) / 100,
      faltas_deducao: Math.round(faltasDeducao * 100) / 100,
      adiantamentos: 0,
      pensao: 0,
      outros_descontos: 0,
      dependentes,
      inss,
      irrf,
      fgts,
      valor_bruto: Math.round(valorBruto * 100) / 100,
      valor_liquido: Math.round(valorLiquido * 100) / 100,
    }
  })

  const totals = items.reduce(
    (acc, item) => ({
      bruto: acc.bruto + item.valor_bruto,
      liquido: acc.liquido + item.valor_liquido,
      inss: acc.inss + item.inss.value,
      irrf: acc.irrf + item.irrf.value,
      fgts: acc.fgts + item.fgts,
    }),
    { bruto: 0, liquido: 0, inss: 0, irrf: 0, fgts: 0 },
  )

  return {
    competencia,
    items,
    total_bruto: Math.round(totals.bruto * 100) / 100,
    total_liquido: Math.round(totals.liquido * 100) / 100,
    total_inss: Math.round(totals.inss * 100) / 100,
    total_irrf: Math.round(totals.irrf * 100) / 100,
    total_fgts: Math.round(totals.fgts * 100) / 100,
    total_encargos: Math.round((totals.inss + totals.irrf + totals.fgts) * 100) / 100,
  }
}
