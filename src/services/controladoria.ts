import pb from '@/lib/pocketbase/client'

export const CTRL_COLLECTIONS = {
  dreStructure: 'controladoria_dre_structure',
  accountMapping: 'controladoria_account_mapping',
  reclassifications: 'controladoria_reclassifications',
  resultVersions: 'controladoria_result_versions',
  budgets: 'controladoria_budgets',
  forecasts: 'controladoria_forecasts',
  closing: 'controladoria_closing',
  snapshots: 'controladoria_snapshots',
  kpis: 'controladoria_kpis',
  drivers: 'controladoria_drivers',
  materiality: 'controladoria_materiality',
  simulations: 'controladoria_simulations',
  consolidation: 'controladoria_consolidation',
  comments: 'controladoria_comments',
  savedViews: 'controladoria_saved_views',
} as const

export const ctrlGetList = (c: string, filter?: string) =>
  pb.collection(c).getFullList({ sort: '-created', filter: filter || undefined })
export const ctrlCreate = (c: string, d: Record<string, unknown>) => pb.collection(c).create(d)
export const ctrlUpdate = (c: string, id: string, d: Record<string, unknown>) =>
  pb.collection(c).update(id, d)
export const ctrlDelete = (c: string, id: string) => pb.collection(c).delete(id)

export const getDREStructure = () =>
  pb.collection(CTRL_COLLECTIONS.dreStructure).getFullList({ sort: 'order' })
export const getAccountMappings = () => ctrlGetList(CTRL_COLLECTIONS.accountMapping)
export const getReclassifications = () => ctrlGetList(CTRL_COLLECTIONS.reclassifications)
export const getResultVersions = () => ctrlGetList(CTRL_COLLECTIONS.resultVersions)
export const getBudgets = () => ctrlGetList(CTRL_COLLECTIONS.budgets)
export const getForecasts = () => ctrlGetList(CTRL_COLLECTIONS.forecasts)
export const getClosings = () => ctrlGetList(CTRL_COLLECTIONS.closing)
export const getSnapshots = () => ctrlGetList(CTRL_COLLECTIONS.snapshots)
export const getKPIs = () => pb.collection(CTRL_COLLECTIONS.kpis).getFullList({ sort: 'category' })
export const getDrivers = () =>
  pb.collection(CTRL_COLLECTIONS.drivers).getFullList({ sort: 'type,category' })
export const getMateriality = () => ctrlGetList(CTRL_COLLECTIONS.materiality)
export const getSimulations = () => ctrlGetList(CTRL_COLLECTIONS.simulations)
export const getConsolidations = () => ctrlGetList(CTRL_COLLECTIONS.consolidation)
export const getComments = (filter?: string) => ctrlGetList(CTRL_COLLECTIONS.comments, filter)
export const getSavedViews = (filter?: string) => ctrlGetList(CTRL_COLLECTIONS.savedViews, filter)

export function logControladoriaAudit(action: string, targetId: string, summary: string) {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action,
      module: 'controladoria',
      target_collection: 'controladoria',
      target_id: targetId,
      target_summary: summary,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}

export const createSnapshot = (
  closingId: string,
  period: string,
  data: Record<string, unknown>,
) => {
  const user = pb.authStore.record as Record<string, unknown> | null
  return ctrlCreate(CTRL_COLLECTIONS.snapshots, {
    period,
    version_type: 'oficial',
    data: JSON.stringify(data),
    hash: JSON.stringify(data).length.toString(36),
    created_by: user?.id || '',
    created_by_name: (user?.name as string) || 'Sistema',
    closing_id: closingId,
    company: '',
    branch: '',
  })
}

export const CTRL_NEW_COLLECTIONS = {
  resultCenters: 'controladoria_result_centers',
  ebitdaConfig: 'controladoria_ebitda_config',
  margins: 'controladoria_margins',
} as const

export const getResultCenters = () =>
  pb.collection(CTRL_NEW_COLLECTIONS.resultCenters).getFullList({ sort: 'code' })
export const createResultCenter = (d: Record<string, unknown>) =>
  ctrlCreate(CTRL_NEW_COLLECTIONS.resultCenters, d)
export const updateResultCenter = (id: string, d: Record<string, unknown>) =>
  ctrlUpdate(CTRL_NEW_COLLECTIONS.resultCenters, id, d)
export const deleteResultCenter = (id: string) => ctrlDelete(CTRL_NEW_COLLECTIONS.resultCenters, id)

export const getEbitdaConfigs = () => ctrlGetList(CTRL_NEW_COLLECTIONS.ebitdaConfig)
export const createEbitdaConfig = (d: Record<string, unknown>) =>
  ctrlCreate(CTRL_NEW_COLLECTIONS.ebitdaConfig, d)

export const getMargins = (dimension?: string) =>
  dimension
    ? pb
        .collection(CTRL_NEW_COLLECTIONS.margins)
        .getFullList({ filter: `dimension = "${dimension}"`, sort: '-created' })
    : ctrlGetList(CTRL_NEW_COLLECTIONS.margins)

export const createComment = (d: Record<string, unknown>) =>
  ctrlCreate(CTRL_COLLECTIONS.comments, d)
export const deleteComment = (id: string) => ctrlDelete(CTRL_COLLECTIONS.comments, id)

export const createSavedView = (d: Record<string, unknown>) =>
  ctrlCreate(CTRL_COLLECTIONS.savedViews, d)
export const deleteSavedView = (id: string) => ctrlDelete(CTRL_COLLECTIONS.savedViews, id)

export const getBudgetsByPeriod = (period: string, orgFilter?: string) =>
  pb
    .collection(CTRL_COLLECTIONS.budgets)
    .getFullList({
      filter: orgFilter ? `period = "${period}" && (${orgFilter})` : `period = "${period}"`,
    })
export const getForecastsByPeriod = (period: string, orgFilter?: string) =>
  pb
    .collection(CTRL_COLLECTIONS.forecasts)
    .getFullList({
      filter: orgFilter ? `period = "${period}" && (${orgFilter})` : `period = "${period}"`,
    })
