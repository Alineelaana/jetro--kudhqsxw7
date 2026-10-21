import pb from '@/lib/pocketbase/client'
import { mergeTenantFilter, withTenantData } from '@/lib/multitenancy'
import type {
  LogisticsRoute,
  LogisticsDelivery,
  LogisticsVehicle,
  LogisticsDriver,
  LogisticsFreight,
  LogisticsOccurrence,
} from '@/lib/logistics-types'

export const getRoutes = (filter?: string): Promise<LogisticsRoute[]> =>
  pb
    .collection('logistics_routes')
    .getFullList({ sort: '-created', filter: mergeTenantFilter('empresa', filter) || undefined })
export const createRoute = (data: Record<string, unknown>): Promise<LogisticsRoute> =>
  pb.collection('logistics_routes').create(withTenantData(data, 'empresa'))
export const updateRoute = (id: string, data: Record<string, unknown>): Promise<LogisticsRoute> =>
  pb.collection('logistics_routes').update(id, data)
export const deleteRoute = async (id: string): Promise<void> => {
  await pb.collection('logistics_routes').delete(id)
}

export const getDeliveries = (filter?: string): Promise<LogisticsDelivery[]> =>
  pb
    .collection('logistics_deliveries')
    .getFullList({ sort: '-created', filter: mergeTenantFilter('empresa', filter) || undefined })
export const createDelivery = (data: Record<string, unknown>): Promise<LogisticsDelivery> =>
  pb.collection('logistics_deliveries').create(withTenantData(data, 'empresa'))
export const updateDelivery = (
  id: string,
  data: Record<string, unknown>,
): Promise<LogisticsDelivery> => pb.collection('logistics_deliveries').update(id, data)

export const getVehicles = (filter?: string): Promise<LogisticsVehicle[]> =>
  pb
    .collection('logistics_vehicles')
    .getFullList({ sort: '-created', filter: mergeTenantFilter('empresa', filter) || undefined })
export const createVehicle = (data: Record<string, unknown>): Promise<LogisticsVehicle> =>
  pb.collection('logistics_vehicles').create(withTenantData(data, 'empresa'))
export const updateVehicle = (
  id: string,
  data: Record<string, unknown>,
): Promise<LogisticsVehicle> => pb.collection('logistics_vehicles').update(id, data)

export const getDrivers = (filter?: string): Promise<LogisticsDriver[]> =>
  pb
    .collection('logistics_drivers')
    .getFullList({ sort: '-created', filter: mergeTenantFilter('empresa', filter) || undefined })
export const createDriver = (data: Record<string, unknown>): Promise<LogisticsDriver> =>
  pb.collection('logistics_drivers').create(withTenantData(data, 'empresa'))
export const updateDriver = (id: string, data: Record<string, unknown>): Promise<LogisticsDriver> =>
  pb.collection('logistics_drivers').update(id, data)

export const getFreights = (filter?: string): Promise<LogisticsFreight[]> =>
  pb
    .collection('logistics_freights')
    .getFullList({ sort: '-created', filter: mergeTenantFilter('empresa', filter) || undefined })
export const createFreight = (data: Record<string, unknown>): Promise<LogisticsFreight> =>
  pb.collection('logistics_freights').create(withTenantData(data, 'empresa'))
export const updateFreight = (
  id: string,
  data: Record<string, unknown>,
): Promise<LogisticsFreight> => pb.collection('logistics_freights').update(id, data)

export const getFreightTables = (filter?: string): Promise<Record<string, unknown>[]> =>
  pb
    .collection('logistics_freight_tables')
    .getFullList({ sort: '-created', filter: mergeTenantFilter('empresa', filter) || undefined })
export const createFreightTable = (data: Record<string, unknown>) =>
  pb.collection('logistics_freight_tables').create(withTenantData(data, 'empresa'))
export const updateFreightTable = (id: string, data: Record<string, unknown>) =>
  pb.collection('logistics_freight_tables').update(id, data)

export const getTracking = (filter?: string): Promise<Record<string, unknown>[]> =>
  pb
    .collection('logistics_tracking')
    .getFullList({ sort: '-created', filter: mergeTenantFilter('empresa', filter) || undefined })
export const updateTracking = (id: string, data: Record<string, unknown>) =>
  pb.collection('logistics_tracking').update(id, data)

export const getOccurrences = (filter?: string): Promise<LogisticsOccurrence[]> =>
  pb
    .collection('logistics_occurrences')
    .getFullList({ sort: '-created', filter: mergeTenantFilter('empresa', filter) || undefined })
export const createOccurrence = (data: Record<string, unknown>): Promise<LogisticsOccurrence> =>
  pb.collection('logistics_occurrences').create(withTenantData(data, 'empresa'))
export const updateOccurrence = (
  id: string,
  data: Record<string, unknown>,
): Promise<LogisticsOccurrence> => pb.collection('logistics_occurrences').update(id, data)

export const getProofDeliveries = (filter?: string): Promise<Record<string, unknown>[]> =>
  pb
    .collection('logistics_proof_delivery')
    .getFullList({ sort: '-created', filter: mergeTenantFilter('empresa', filter) || undefined })
export const createProofDelivery = (data: Record<string, unknown>) =>
  pb.collection('logistics_proof_delivery').create(withTenantData(data, 'empresa'))

export const getCosts = (filter?: string): Promise<Record<string, unknown>[]> =>
  pb
    .collection('logistics_costs')
    .getFullList({ sort: '-created', filter: mergeTenantFilter('empresa', filter) || undefined })
export const createCost = (data: Record<string, unknown>) =>
  pb.collection('logistics_costs').create(withTenantData(data, 'empresa'))

export const getReverseOperations = (): Promise<Record<string, unknown>[]> =>
  pb.collection('logistics_reverse_operations').getFullList({ sort: '-created' })
export const createReverseOperation = (data: Record<string, unknown>) =>
  pb.collection('logistics_reverse_operations').create(data)
export const updateReverseOperation = (id: string, data: Record<string, unknown>) =>
  pb.collection('logistics_reverse_operations').update(id, data)
