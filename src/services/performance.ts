import pb from '@/lib/pocketbase/client'
import type {
  PerformanceKpi,
  PerformanceScore,
  PerformanceAlert,
  PerformancePrediction,
  PerformanceGamification,
  PerformanceConfig,
  PerformanceBenchmark,
  PerformanceAiAnalysis,
} from '@/lib/performance-types'

export const getKpis = (module?: string) =>
  pb.collection('performance_kpis').getFullList({
    filter: module ? `module = "${module}"` : '',
    sort: 'module,weight',
  }) as Promise<PerformanceKpi[]>

export const getScores = (entityType?: string) =>
  pb.collection('performance_scores').getFullList({
    filter: entityType ? `entity_type = "${entityType}"` : '',
    sort: '-created',
  }) as Promise<PerformanceScore[]>

export const getAlerts = (resolved?: boolean) =>
  pb.collection('performance_alerts').getFullList({
    filter: resolved !== undefined ? `resolved = ${resolved}` : '',
    sort: '-created',
  }) as Promise<PerformanceAlert[]>

export const resolveAlert = (id: string, userName: string) =>
  pb.collection('performance_alerts').update(id, {
    resolved: true,
    resolved_by: userName,
    resolved_at: new Date().toISOString(),
  })

export const getPredictions = () =>
  pb.collection('performance_predictions').getFullList({ sort: '-created' }) as Promise<
    PerformancePrediction[]
  >

export const getGamification = () =>
  pb.collection('performance_gamification').getFullList({ sort: '-created' }) as Promise<
    PerformanceGamification[]
  >

export const createGamification = (data: Partial<PerformanceGamification>) =>
  pb.collection('performance_gamification').create(data)

export const updateGamification = (id: string, data: Partial<PerformanceGamification>) =>
  pb.collection('performance_gamification').update(id, data)

export const deleteGamification = (id: string) =>
  pb.collection('performance_gamification').delete(id)

export const getConfig = () =>
  pb.collection('performance_config').getFullList({ sort: '-created' }) as Promise<
    PerformanceConfig[]
  >

export const saveConfig = (id: string, data: Partial<PerformanceConfig>) =>
  pb.collection('performance_config').update(id, data)

export const createConfig = (data: Partial<PerformanceConfig>) =>
  pb.collection('performance_config').create(data)

export const getBenchmarks = () =>
  pb.collection('performance_benchmarks').getFullList({ sort: '-created' }) as Promise<
    PerformanceBenchmark[]
  >

export const getAiAnalysis = () =>
  pb.collection('performance_ai_analysis').getFullList({ sort: '-created' }) as Promise<
    PerformanceAiAnalysis[]
  >

export const triggerCompute = () => pb.send('/backend/v1/performance/compute', { method: 'POST' })

export const triggerAiAnalyze = () =>
  pb.send('/backend/v1/performance/ai-analyze', { method: 'POST' })

export const triggerPredict = () => pb.send('/backend/v1/performance/predict', { method: 'POST' })
