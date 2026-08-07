import pb from '@/lib/pocketbase/client'
import type {
  IndustrialPhase,
  IndustrialPhaseCost,
  IndustrialDemand,
} from '@/lib/industrial-flow-types'

export const getPhases = (orderId?: string) =>
  pb.collection('industrial_phases').getFullList({
    sort: 'sequence',
    filter: orderId ? `production_order_id = "${orderId}"` : undefined,
    expand: 'production_order_id,resource_id',
  }) as Promise<IndustrialPhase[]>

export const createPhase = (data: Partial<IndustrialPhase>) =>
  pb.collection('industrial_phases').create(data) as Promise<IndustrialPhase>

export const updatePhase = (id: string, data: Partial<IndustrialPhase>) =>
  pb.collection('industrial_phases').update(id, data) as Promise<IndustrialPhase>

export const getPhaseCosts = (phaseId: string) =>
  pb.collection('industrial_phase_costs').getFullList({
    sort: '-created',
    filter: `phase_id = "${phaseId}"`,
  }) as Promise<IndustrialPhaseCost[]>

export const getDemands = () =>
  pb.collection('industrial_demand').getFullList({
    sort: '-created',
    expand: 'product_id',
  }) as Promise<IndustrialDemand[]>

export const createDemand = (data: Partial<IndustrialDemand>) =>
  pb.collection('industrial_demand').create(data) as Promise<IndustrialDemand>

export const updateDemand = (id: string, data: Partial<IndustrialDemand>) =>
  pb.collection('industrial_demand').update(id, data) as Promise<IndustrialDemand>
