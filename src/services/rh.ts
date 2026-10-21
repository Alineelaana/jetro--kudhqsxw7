import pb from '@/lib/pocketbase/client'
import { mergeTenantFilter, withTenantData } from '@/lib/multitenancy'

export const RH_COLLECTIONS = {
  employees: 'rh_employees',
  positions: 'rh_positions',
  departments: 'rh_departments',
  timeRecords: 'rh_time_records',
  scales: 'rh_scales',
  vacations: 'rh_vacations',
  payroll: 'rh_payroll',
  payrollEvents: 'rh_payroll_events',
  benefits: 'rh_benefits',
  employeeBenefits: 'rh_employee_benefits',
  trainings: 'rh_trainings',
  trainingParticipants: 'rh_training_participants',
  documents: 'rh_documents',
  approvals: 'rh_approvals',
  dismissals: 'rh_dismissals',
  employeeHistory: 'rh_employee_history',
} as const

export function rhGetList(collection: string, filter?: string) {
  // Aplicar filtro multitenancy para coleções organizadas por empresa
  const isPerEmpresa =
    collection === RH_COLLECTIONS.employees ||
    collection === RH_COLLECTIONS.departments ||
    collection === RH_COLLECTIONS.payroll
  const merged = isPerEmpresa ? mergeTenantFilter('empresa', filter) : filter
  return pb.collection(collection).getFullList({
    sort: '-created',
    filter: merged || undefined,
  })
}
export function rhCreate(collection: string, data: Record<string, unknown>) {
  const isPerEmpresa =
    collection === RH_COLLECTIONS.employees ||
    collection === RH_COLLECTIONS.departments ||
    collection === RH_COLLECTIONS.payroll
  const tenantData = isPerEmpresa ? withTenantData(data, 'empresa') : data
  return pb.collection(collection).create(tenantData)
}
export function rhUpdate(collection: string, id: string, data: Record<string, unknown>) {
  return pb.collection(collection).update(id, data)
}
export function rhDelete(collection: string, id: string) {
  return pb.collection(collection).delete(id)
}

export const getEmployees = () => rhGetList(RH_COLLECTIONS.employees)
export const createEmployee = (d: Record<string, unknown>) => rhCreate(RH_COLLECTIONS.employees, d)
export const updateEmployee = (id: string, d: Record<string, unknown>) =>
  rhUpdate(RH_COLLECTIONS.employees, id, d)

export const getTimeRecords = () => rhGetList(RH_COLLECTIONS.timeRecords)
export const getVacations = () => rhGetList(RH_COLLECTIONS.vacations)
export const getPayroll = () => rhGetList(RH_COLLECTIONS.payroll)
export const getPayrollEvents = () => rhGetList(RH_COLLECTIONS.payrollEvents)
export const getBenefits = () => rhGetList(RH_COLLECTIONS.benefits)
export const getTrainings = () => rhGetList(RH_COLLECTIONS.trainings)
export const getDocuments = () => rhGetList(RH_COLLECTIONS.documents)
export const getApprovals = () => rhGetList(RH_COLLECTIONS.approvals)
export const getDismissals = () => rhGetList(RH_COLLECTIONS.dismissals)
export const getEmployeeHistory = (employeeId: string) =>
  pb
    .collection(RH_COLLECTIONS.employeeHistory)
    .getFullList({ filter: `employee_id = "${employeeId}"`, sort: '-created' })
