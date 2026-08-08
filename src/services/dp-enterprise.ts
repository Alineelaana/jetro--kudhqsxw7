import pb from '@/lib/pocketbase/client'
import { dpGetList, dpCreate, dpUpdate } from '@/services/dp'

export const DP_ENTERPRISE_COLLECTIONS = {
  bankHoursLedger: 'dp_bank_hours_ledger',
  fgtsDigital: 'dp_fgts_digital',
  taxTables: 'dp_tax_tables_versioned',
  consignments: 'dp_consignments',
  unions: 'dp_unions',
  collectiveAgreements: 'dp_collective_agreements',
  wageAdjustments: 'dp_wage_adjustments',
  provisions: 'dp_provisions',
  reinstatements: 'dp_reinstatements',
  esocialLayouts: 'dp_esocial_layouts',
  payrollSnapshots: 'dp_payroll_snapshots',
  contractChanges: 'dp_contract_changes',
} as const

export const getBankHoursLedger = () => dpGetList(DP_ENTERPRISE_COLLECTIONS.bankHoursLedger)
export const getFgtsDigital = () => dpGetList(DP_ENTERPRISE_COLLECTIONS.fgtsDigital)
export const getTaxTables = () => dpGetList(DP_ENTERPRISE_COLLECTIONS.taxTables)
export const getConsignments = () => dpGetList(DP_ENTERPRISE_COLLECTIONS.consignments)
export const getUnions = () => dpGetList(DP_ENTERPRISE_COLLECTIONS.unions)
export const getCollectiveAgreements = () =>
  dpGetList(DP_ENTERPRISE_COLLECTIONS.collectiveAgreements)
export const getWageAdjustments = () => dpGetList(DP_ENTERPRISE_COLLECTIONS.wageAdjustments)
export const getProvisions = () => dpGetList(DP_ENTERPRISE_COLLECTIONS.provisions)
export const getReinstatements = () => dpGetList(DP_ENTERPRISE_COLLECTIONS.reinstatements)
export const getEsocialLayouts = () => dpGetList(DP_ENTERPRISE_COLLECTIONS.esocialLayouts)
export const getContractChanges = () => dpGetList(DP_ENTERPRISE_COLLECTIONS.contractChanges)

export async function getBankHoursBalance(employeeName: string): Promise<number> {
  const records = await pb.collection(DP_ENTERPRISE_COLLECTIONS.bankHoursLedger).getFullList({
    filter: `employee_name = "${employeeName}"`,
    sort: 'data',
  })
  return (records as any[]).reduce((acc, r) => {
    if (r.tipo === 'credito') return acc + (r.minutos || 0)
    if (r.tipo === 'debito') return acc - (r.minutos || 0)
    return acc
  }, 0)
}

export async function getEsocialEventsByStatus(status: string): Promise<any[]> {
  return pb.collection('dp_esocial_events').getFullList({
    filter: `situacao = "${status}"`,
    sort: '-created',
  }) as Promise<any[]>
}

export async function getFgtsByCompetencia(competencia: string): Promise<any[]> {
  return pb.collection(DP_ENTERPRISE_COLLECTIONS.fgtsDigital).getFullList({
    filter: `competencia = "${competencia}"`,
    sort: '-created',
  }) as Promise<any[]>
}

export async function createPayrollSnapshot(
  payrollId: string,
  competencia: string,
  data: Record<string, unknown>,
): Promise<any> {
  return dpCreate(DP_ENTERPRISE_COLLECTIONS.payrollSnapshots, {
    payroll_id: payrollId,
    competencia,
    snapshot_data: data,
    hash: `${payrollId}-${competencia}-${Date.now()}`,
    situacao: 'Imutável',
  })
}

export async function getActiveTaxTable(tipo: string): Promise<any | null> {
  const results = (await pb.collection(DP_ENTERPRISE_COLLECTIONS.taxTables).getFullList({
    filter: `tipo = "${tipo}" && situacao = "Ativo"`,
    sort: '-vigencia_inicio',
  })) as any[]
  return results[0] || null
}
