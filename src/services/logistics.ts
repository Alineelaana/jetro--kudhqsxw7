import pb from '@/lib/pocketbase/client'
import type {
  LogisticsRoute,
  LogisticsDelivery,
  LogisticsVehicle,
  LogisticsDriver,
  LogisticsFreight,
  LogisticsOccurrence,
} from '@/lib/logistics-types'

export const getRoutes = (): Promise<LogisticsRoute[]> =>
  pb.collection('logistics_routes').getFullList({ sort: '-created' })
export const createRoute = (data: Record<string, unknown>): Promise<LogisticsRoute> =>
  pb.collection('logistics_routes').create(data)
export const updateRoute = (id: string, data: Record<string, unknown>): Promise<LogisticsRoute> =>
  pb.collection('logistics_routes').update(id, data)
export const deleteRoute = (id: string): Promise<void> =>
  pb.collection('logistics_routes').delete(id)

export const getDeliveries = (): Promise<LogisticsDelivery[]> =>
  pb.collection('logistics_deliveries').getFullList({ sort: '-created' })
export const createDelivery = (data: Record<string, unknown>): Promise<LogisticsDelivery> =>
  pb.collection('logistics_deliveries').create(data)
export const updateDelivery = (
  id: string,
  data: Record<string, unknown>,
): Promise<LogisticsDelivery> => pb.collection('logistics_deliveries').update(id, data)

export const getVehicles = (): Promise<LogisticsVehicle[]> =>
  pb.collection('logistics_vehicles').getFullList({ sort: '-created' })
export const createVehicle = (data: Record<string, unknown>): Promise<LogisticsVehicle> =>
  pb.collection('logistics_vehicles').create(data)
export const updateVehicle = (
  id: string,
  data: Record<string, unknown>,
): Promise<LogisticsVehicle> => pb.collection('logistics_vehicles').update(id, data)

export const getDrivers = (): Promise<LogisticsDriver[]> =>
  pb.collection('logistics_drivers').getFullList({ sort: '-created' })
export const createDriver = (data: Record<string, unknown>): Promise<LogisticsDriver> =>
  pb.collection('logistics_drivers').create(data)
export const updateDriver = (id: string, data: Record<string, unknown>): Promise<LogisticsDriver> =>
  pb.collection('logistics_drivers').update(id, data)

export const getFreights = (): Promise<LogisticsFreight[]> =>
  pb.collection('logistics_freights').getFullList({ sort: '-created' })
export const createFreight = (data: Record<string, unknown>): Promise<LogisticsFreight> =>
  pb.collection('logistics_freights').create(data)
export const updateFreight = (
  id: string,
  data: Record<string, unknown>,
): Promise<LogisticsFreight> => pb.collection('logistics_freights').update(id, data)

export const getFreightTables = (): Promise<Record<string, unknown>[]> =>
  pb.collection('logistics_freight_tables').getFullList({ sort: '-created' })
export const createFreightTable = (data: Record<string, unknown>) =>
  pb.collection('logistics_freight_tables').create(data)
export const updateFreightTable = (id: string, data: Record<string, unknown>) =>
  pb.collection('logistics_freight_tables').update(id, data)

export const getTracking = (): Promise<Record<string, unknown>[]> =>
  pb.collection('logistics_tracking').getFullList({ sort: '-created' })
export const updateTracking = (id: string, data: Record<string, unknown>) =>
  pb.collection('logistics_tracking').update(id, data)

export const getOccurrences = (): Promise<LogisticsOccurrence[]> =>
  pb.collection('logistics_occurrences').getFullList({ sort: '-created' })
export const createOccurrence = (data: Record<string, unknown>): Promise<LogisticsOccurrence> =>
  pb.collection('logistics_occurrences').create(data)
export const updateOccurrence = (
  id: string,
  data: Record<string, unknown>,
): Promise<LogisticsOccurrence> => pb.collection('logistics_occurrences').update(id, data)

export const getProofDeliveries = (): Promise<Record<string, unknown>[]> =>
  pb.collection('logistics_proof_delivery').getFullList({ sort: '-created' })
export const createProofDelivery = (data: Record<string, unknown>) =>
  pb.collection('logistics_proof_delivery').create(data)

export const getCosts = (): Promise<Record<string, unknown>[]> =>
  pb.collection('logistics_costs').getFullList({ sort: '-created' })
export const createCost = (data: Record<string, unknown>) =>
  pb.collection('logistics_costs').create(data)
