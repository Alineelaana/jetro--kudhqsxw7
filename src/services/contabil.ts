import pb from '@/lib/pocketbase/client'

export const CONTABIL_COLLECTIONS = {
  lancamentos: 'contabil_lancamentos',
  lotes: 'contabil_lotes',
  integrationRules: 'contabil_integration_rules',
  pendingIntegrations: 'contabil_pending_integrations',
  reconciliations: 'contabil_reconciliations',
  provisions: 'contabil_provisions',
  periods: 'contabil_periods',
  fiscalYears: 'contabil_fiscal_years',
  dreConfig: 'contabil_dre_config',
  balanceSheetConfig: 'contabil_balance_sheet_config',
} as const

export const ctGetList = (c: string) => pb.collection(c).getFullList({ sort: '-created' })
export const ctCreate = (c: string, d: Record<string, unknown>) => pb.collection(c).create(d)
export const ctUpdate = (c: string, id: string, d: Record<string, unknown>) =>
  pb.collection(c).update(id, d)
export const ctDelete = (c: string, id: string) => pb.collection(c).delete(id)

export const getLancamentos = () => ctGetList(CONTABIL_COLLECTIONS.lancamentos)
export const getLotes = () => ctGetList(CONTABIL_COLLECTIONS.lotes)
export const getIntegrationRules = () => ctGetList(CONTABIL_COLLECTIONS.integrationRules)
export const getPendingIntegrations = () => ctGetList(CONTABIL_COLLECTIONS.pendingIntegrations)
export const getReconciliations = () => ctGetList(CONTABIL_COLLECTIONS.reconciliations)
export const getProvisions = () => ctGetList(CONTABIL_COLLECTIONS.provisions)
export const getPeriods = () => ctGetList(CONTABIL_COLLECTIONS.periods)
export const getFiscalYears = () => ctGetList(CONTABIL_COLLECTIONS.fiscalYears)
export const getDreConfig = () => ctGetList(CONTABIL_COLLECTIONS.dreConfig)
export const getBalanceSheetConfig = () => ctGetList(CONTABIL_COLLECTIONS.balanceSheetConfig)

export const getPlanoContas = () => pb.collection('plano_contas').getFullList({ sort: 'code' })
export const getCentrosCusto = () => pb.collection('centros_custo').getFullList({ sort: 'code' })

export const autoGenerateEntry = (data: Record<string, unknown>) =>
  pb.send('/backend/v1/contabil/auto-generate', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
export const processLote = (loteId: string) =>
  pb.send('/backend/v1/contabil/process-lote', {
    method: 'POST',
    body: JSON.stringify({ lote_id: loteId }),
    headers: { 'Content-Type': 'application/json' },
  })
export const preCloseCheck = (periodo: string, empresa: string) =>
  pb.send('/backend/v1/contabil/pre-close', {
    method: 'POST',
    body: JSON.stringify({ periodo, empresa }),
    headers: { 'Content-Type': 'application/json' },
  })
