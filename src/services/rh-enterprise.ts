import pb from '@/lib/pocketbase/client'
import { rhGetList, rhCreate, rhUpdate, rhDelete } from '@/services/rh'

export const RH_ENTERPRISE_COLLECTIONS = {
  competencies: 'rh_competencies',
  cargoCompetencies: 'rh_cargo_competencies',
  employeeCompetencies: 'rh_employee_competencies',
  pdi: 'rh_pdi',
  pdiItems: 'rh_pdi_items',
  calibration: 'rh_calibration_sessions',
  feedback: 'rh_feedback',
  succession: 'rh_succession_plans',
  recognitions: 'rh_recognitions',
  onboarding: 'rh_onboarding_flows',
  offboarding: 'rh_offboarding_flows',
  positionsSlots: 'rh_positions_slots',
  performanceCycles: 'rh_performance_cycles',
} as const

export const getCompetencies = () => rhGetList(RH_ENTERPRISE_COLLECTIONS.competencies)
export const getEmployeeCompetencies = () =>
  rhGetList(RH_ENTERPRISE_COLLECTIONS.employeeCompetencies)
export const getPdi = () => rhGetList(RH_ENTERPRISE_COLLECTIONS.pdi)
export const getPdiItems = () => rhGetList(RH_ENTERPRISE_COLLECTIONS.pdiItems)
export const getCalibration = () => rhGetList(RH_ENTERPRISE_COLLECTIONS.calibration)
export const getFeedback = () => rhGetList(RH_ENTERPRISE_COLLECTIONS.feedback)
export const getSuccession = () => rhGetList(RH_ENTERPRISE_COLLECTIONS.succession)
export const getRecognitions = () => rhGetList(RH_ENTERPRISE_COLLECTIONS.recognitions)
export const getOnboarding = () => rhGetList(RH_ENTERPRISE_COLLECTIONS.onboarding)
export const getOffboarding = () => rhGetList(RH_ENTERPRISE_COLLECTIONS.offboarding)
export const getPositionsSlots = () => rhGetList(RH_ENTERPRISE_COLLECTIONS.positionsSlots)
export const getPerformanceCycles = () => rhGetList(RH_ENTERPRISE_COLLECTIONS.performanceCycles)

export const createPerformanceCycle = (d: Record<string, unknown>) =>
  rhCreate(RH_ENTERPRISE_COLLECTIONS.performanceCycles, d)
export const updatePerformanceCycle = (id: string, d: Record<string, unknown>) =>
  rhUpdate(RH_ENTERPRISE_COLLECTIONS.performanceCycles, id, d)

export async function getNineBoxData(): Promise<{
  highPotHighPerf: any[]
  highPotMidPerf: any[]
  highPotLowPerf: any[]
  midPotHighPerf: any[]
  midPotMidPerf: any[]
  midPotLowPerf: any[]
  lowPotHighPerf: any[]
  lowPotMidPerf: any[]
  lowPotLowPerf: any[]
}> {
  const [evals, succession] = await Promise.all([
    rhGetList('rh_performance_evaluations').catch(() => []),
    getSuccession().catch(() => []),
  ])
  const readinessMap = new Map<string, number>()
  for (const s of succession as any[]) {
    if (s.employee_name) {
      const score =
        s.nivel_prontidao === 'Pronto agora'
          ? 3
          : s.nivel_prontidao === 'Pronto em 1 ano'
            ? 2
            : s.nivel_prontidao === 'Pronto em 2 anos'
              ? 1
              : 0
      readinessMap.set(s.employee_name, score)
    }
  }
  const boxes = {
    highPotHighPerf: [],
    highPotMidPerf: [],
    highPotLowPerf: [],
    midPotHighPerf: [],
    midPotMidPerf: [],
    midPotLowPerf: [],
    lowPotHighPerf: [],
    lowPotMidPerf: [],
    lowPotLowPerf: [],
  }
  for (const e of evals as any[]) {
    const perfScore = parseFloat(e.nota_final) || 0
    const potScore = readinessMap.get(e.employee_name) ?? 1
    const perf = perfScore >= 4 ? 'high' : perfScore >= 3 ? 'mid' : 'low'
    const pot = potScore >= 2 ? 'high' : potScore >= 1 ? 'mid' : 'low'
    const key = `${pot}Pot${perf.charAt(0).toUpperCase() + perf.slice(1)}Perf`
    boxes[key].push(e)
  }
  return boxes
}

export async function getTalentReview(filters?: {
  area?: string
  gestor?: string
}): Promise<any[]> {
  const [evals, succession, pdi] = await Promise.all([
    rhGetList('rh_performance_evaluations').catch(() => []),
    getSuccession().catch(() => []),
    getPdi().catch(() => []),
  ])
  const succMap = new Map<string, any>(
    (succession as any[]).map((s: any) => [s.employee_name as string, s] as [string, any]),
  )
  const pdiMap = new Map<string, any>(
    (pdi as any[]).map((p: any) => [p.employee_name as string, p] as [string, any]),
  )
  let results = evals.map((e: any) => ({
    ...e,
    succession: succMap.get(e.employee_name),
    pdi: pdiMap.get(e.employee_name),
  }))
  if (filters?.area) results = results.filter((r) => r.departamento === filters.area)
  if (filters?.gestor) results = results.filter((r) => r.gestor === filters.gestor)
  return results
}

export async function getOrgChartData(): Promise<any[]> {
  const [employees, departments, positions] = await Promise.all([
    rhGetList('rh_employees').catch(() => []),
    rhGetList('rh_departments').catch(() => []),
    getPositionsSlots().catch(() => []),
  ])
  const deptMap = new Map<string, any[]>()
  for (const emp of employees as any[]) {
    const dept = emp.departamento || 'Sem Departamento'
    if (!deptMap.has(dept)) deptMap.set(dept, [])
    deptMap.get(dept).push(emp)
  }
  return Array.from(deptMap.entries()).map(([dept, emps]) => ({
    departamento: dept,
    colaboradores: emps,
    total: emps.length,
  }))
}

export async function sendRhNotification(
  recipientId: string,
  title: string,
  message: string,
  type: string,
  link?: string,
): Promise<void> {
  try {
    await pb.collection('notifications').create({
      title,
      message,
      type,
      recipient: recipientId,
      read: false,
      link: link || '',
    })
  } catch {
    // noop
  }
}

export async function createRhWorkflow(data: {
  workflow_key: string
  entity_type: string
  entity_id?: string
  entity_summary?: string
  module_origin: string
}): Promise<any> {
  return pb
    .send('/backend/v1/rh/workflow', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
    .catch(() => null)
}
