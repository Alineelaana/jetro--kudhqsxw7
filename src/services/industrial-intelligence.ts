import pb from '@/lib/pocketbase/client'
import type {
  IntelligenceAlert,
  IntelligenceRecommendation,
  IntelligencePrediction,
  IntelligenceInsight,
  ExecutivePanelData,
  ResolveAction,
} from '@/lib/industrial-intelligence-types'

export const detectIntelligence = () =>
  pb.send('/backend/v1/industrial/intelligence/detect', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: { 'Content-Type': 'application/json' },
  })

export const getExecutivePanel = () =>
  pb.send('/backend/v1/industrial/intelligence/executive-panel', {
    method: 'GET',
  }) as Promise<ExecutivePanelData>

export const getIntelligenceAlerts = () =>
  pb.collection('industrial_intelligence_alerts').getFullList({
    sort: '-created',
  }) as Promise<IntelligenceAlert[]>

export const getIntelligenceRecommendations = () =>
  pb.collection('industrial_intelligence_recommendations').getFullList({
    sort: '-created',
  }) as Promise<IntelligenceRecommendation[]>

export const getIntelligencePredictions = () =>
  pb.collection('industrial_intelligence_predictions').getFullList({
    sort: '-created',
  }) as Promise<IntelligencePrediction[]>

export const getIntelligenceInsights = () =>
  pb.collection('industrial_intelligence_insights').getFullList({
    sort: '-created',
  }) as Promise<IntelligenceInsight[]>

export const resolveIntelligence = (
  collection: string,
  id: string,
  action: ResolveAction,
  note?: string,
) =>
  pb.send('/backend/v1/industrial/intelligence/resolve', {
    method: 'POST',
    body: JSON.stringify({ collection, id, action, note: note || '' }),
    headers: { 'Content-Type': 'application/json' },
  })
