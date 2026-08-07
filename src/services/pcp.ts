import pb from '@/lib/pocketbase/client'

export interface MasterProductionPlan {
  id: string
  plan_number: string
  product_id: string
  period: string
  forecast_quantity: number
  actual_quantity: number
  status: string
  items: unknown
  responsible: string
  company: string
  branch: string
  created: string
  updated: string
  expand?: { product_id?: { id: string; name: string } }
}

export interface ApsSchedule {
  id: string
  production_order_id: string
  resource_id: string
  operation_name: string
  scheduled_start: string
  scheduled_end: string
  duration_minutes: number
  status: string
  sequence: number
  constraints: unknown
  simulation_id: string
  created: string
  updated: string
  expand?: {
    production_order_id?: { id: string; order_number: string }
    resource_id?: { id: string; name: string }
  }
}

export interface ProductionSimulation {
  id: string
  name: string
  description: string
  scenario_type: string
  parameters: unknown
  results: unknown
  status: string
  responsible: string
  created: string
  updated: string
}

export const getMasterPlans = () =>
  pb.collection('master_production_plans').getFullList({
    sort: '-created',
    expand: 'product_id',
  }) as Promise<MasterProductionPlan[]>

export const createMasterPlan = (data: Partial<MasterProductionPlan>) =>
  pb.collection('master_production_plans').create(data) as Promise<MasterProductionPlan>

export const updateMasterPlan = (id: string, data: Partial<MasterProductionPlan>) =>
  pb.collection('master_production_plans').update(id, data) as Promise<MasterProductionPlan>

export const getApsSchedules = () =>
  pb.collection('aps_schedules').getFullList({
    sort: 'scheduled_start',
    expand: 'production_order_id,resource_id',
  }) as Promise<ApsSchedule[]>

export const createApsSchedule = (data: Partial<ApsSchedule>) =>
  pb.collection('aps_schedules').create(data) as Promise<ApsSchedule>

export const updateApsSchedule = (id: string, data: Partial<ApsSchedule>) =>
  pb.collection('aps_schedules').update(id, data) as Promise<ApsSchedule>

export const getSimulations = () =>
  pb.collection('production_simulations').getFullList({
    sort: '-created',
  }) as Promise<ProductionSimulation[]>

export const createSimulation = (data: Partial<ProductionSimulation>) =>
  pb.collection('production_simulations').create(data) as Promise<ProductionSimulation>

export const generateMasterPlan = (planId: string) =>
  pb.send('/backend/v1/industrial/master-plan/generate', {
    method: 'POST',
    body: JSON.stringify({ plan_id: planId }),
    headers: { 'Content-Type': 'application/json' },
  })

export const getApsSuggestions = () =>
  pb.send('/backend/v1/industrial/aps/schedule', { method: 'GET' })

export const getCapacityLoad = (period?: string) =>
  pb.send(`/backend/v1/industrial/capacity/load${period ? `?period=${period}` : ''}`, {
    method: 'GET',
  })

export const getOeeCalculation = (resourceId?: string, period?: string) => {
  const params = new URLSearchParams()
  if (resourceId) params.set('resource_id', resourceId)
  if (period) params.set('period', period)
  return pb.send(`/backend/v1/industrial/oee/calculate?${params.toString()}`, { method: 'GET' })
}

export const absorbCosts = (orderId: string) =>
  pb.send('/backend/v1/industrial/cost/absorb', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
    headers: { 'Content-Type': 'application/json' },
  })

export const transitionOrder = (
  orderId: string,
  targetStatus: string,
  extra?: Record<string, unknown>,
) =>
  pb.send('/backend/v1/industrial/order/transition', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, target_status: targetStatus, ...extra }),
    headers: { 'Content-Type': 'application/json' },
  })
