import pb from '@/lib/pocketbase/client'
import type { RouteCalcResult } from '@/lib/logistics-types'

export const updateGpsPosition = (data: {
  tracking_id?: string
  delivery_id?: string
  latitude: number
  longitude: number
  status?: string
  veiculo?: string
  motorista?: string
  cliente?: string
}) =>
  pb.send('/backend/v1/logistics/gps-update', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const simulateGpsMovement = (trackingId: string) =>
  pb.send('/backend/v1/logistics/gps-simulate', {
    method: 'POST',
    body: JSON.stringify({ tracking_id: trackingId }),
    headers: { 'Content-Type': 'application/json' },
  })

export const calculateRoute = (
  origin: string,
  destination: string,
  waypoints?: string[],
): Promise<RouteCalcResult> =>
  pb.send('/backend/v1/logistics/route-calc', {
    method: 'POST',
    body: JSON.stringify({ origin, destination, waypoints }),
    headers: { 'Content-Type': 'application/json' },
  })
