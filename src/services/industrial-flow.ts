import pb from '@/lib/pocketbase/client'
import type { ExecutiveDashboardData, TraceabilityResult } from '@/lib/industrial-flow-types'

export const transitionPhase = (
  phaseId: string,
  targetStatus: string,
  extra?: Record<string, unknown>,
) =>
  pb.send('/backend/v1/industrial/phase/transition', {
    method: 'POST',
    body: JSON.stringify({ phase_id: phaseId, target_status: targetStatus, ...extra }),
    headers: { 'Content-Type': 'application/json' },
  })

export const feedPhaseCosts = (phaseId: string) =>
  pb.send('/backend/v1/industrial/phase/cost-feed', {
    method: 'POST',
    body: JSON.stringify({ phase_id: phaseId }),
    headers: { 'Content-Type': 'application/json' },
  })

export const queryTraceability = (direction: string, id: string) =>
  pb.send(`/backend/v1/industrial/traceability/${direction}/${id}`, {
    method: 'GET',
  }) as Promise<TraceabilityResult>

export const getExecutiveDashboard = () =>
  pb.send('/backend/v1/industrial/executive-dashboard', {
    method: 'GET',
  }) as Promise<ExecutiveDashboardData>

export const performQualityCheck = (
  phaseId: string,
  result: string,
  extra?: Record<string, unknown>,
) =>
  pb.send('/backend/v1/industrial/quality/check', {
    method: 'POST',
    body: JSON.stringify({ phase_id: phaseId, result, ...extra }),
    headers: { 'Content-Type': 'application/json' },
  })

export const convertDemandToOrder = (demandId: string) =>
  pb.send('/backend/v1/industrial/demand-to-order', {
    method: 'POST',
    body: JSON.stringify({ demand_id: demandId }),
    headers: { 'Content-Type': 'application/json' },
  })
