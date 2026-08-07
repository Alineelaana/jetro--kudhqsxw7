import pb from '@/lib/pocketbase/client'
import type { IndustrialThreshold } from '@/lib/industrial-thresholds-types'

export const getThresholds = () =>
  pb.collection('industrial_threshold_config').getFullList({ sort: 'category,key' }) as Promise<
    IndustrialThreshold[]
  >

export const updateThreshold = (id: string, data: Partial<IndustrialThreshold>) =>
  pb.collection('industrial_threshold_config').update(id, data) as Promise<IndustrialThreshold>

export const runIntelligenceDetect = () =>
  pb.send('/backend/v1/industrial/intelligence/detect', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: { 'Content-Type': 'application/json' },
  })
