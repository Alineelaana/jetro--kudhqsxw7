import pb from '@/lib/pocketbase/client'
import { mergeTenantFilter, withTenantData } from '@/lib/multitenancy'

const DP_EMPRESA_COLLECTIONS = new Set(['dp_admissions', 'dp_work_contracts', 'dp_labor_charges'])

export function dpGetList(collection: string, filter?: string) {
  const isPerEmpresa = DP_EMPRESA_COLLECTIONS.has(collection)
  const merged = isPerEmpresa ? mergeTenantFilter('empresa', filter) : filter
  return pb.collection(collection).getFullList({
    sort: '-created',
    filter: merged || undefined,
  })
}
export function dpCreate(collection: string, data: Record<string, unknown>) {
  const isPerEmpresa = DP_EMPRESA_COLLECTIONS.has(collection)
  const tenantData = isPerEmpresa ? withTenantData(data, 'empresa') : data
  return pb.collection(collection).create(tenantData)
}
export function dpUpdate(collection: string, id: string, data: Record<string, unknown>) {
  return pb.collection(collection).update(id, data)
}
export function dpDelete(collection: string, id: string) {
  return pb.collection(collection).delete(id)
}
