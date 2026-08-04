import pb from '@/lib/pocketbase/client'

export const getNfseRecords = () => pb.collection('nfse_records').getFullList({ sort: '-created' })
export const createNfseRecord = (data: Record<string, unknown>) =>
  pb.collection('nfse_records').create(data)
export const updateNfseRecord = (id: string, data: Record<string, unknown>) =>
  pb.collection('nfse_records').update(id, data)

export const getCteRecords = () => pb.collection('cte_records').getFullList({ sort: '-created' })
export const createCteRecord = (data: Record<string, unknown>) =>
  pb.collection('cte_records').create(data)
export const updateCteRecord = (id: string, data: Record<string, unknown>) =>
  pb.collection('cte_records').update(id, data)

export const getMdfeRecords = () => pb.collection('mdfe_records').getFullList({ sort: '-created' })
export const createMdfeRecord = (data: Record<string, unknown>) =>
  pb.collection('mdfe_records').create(data)
export const updateMdfeRecord = (id: string, data: Record<string, unknown>) =>
  pb.collection('mdfe_records').update(id, data)

export const getApuracoes = () => pb.collection('fiscal_apuracao').getFullList({ sort: '-created' })
export const createApuracao = (data: Record<string, unknown>) =>
  pb.collection('fiscal_apuracao').create(data)
export const updateApuracao = (id: string, data: Record<string, unknown>) =>
  pb.collection('fiscal_apuracao').update(id, data)

export const getReformConfigs = () =>
  pb.collection('reform_configs').getFullList({ sort: '-created' })
export const createReformConfig = (data: Record<string, unknown>) =>
  pb.collection('reform_configs').create(data)
export const updateReformConfig = (id: string, data: Record<string, unknown>) =>
  pb.collection('reform_configs').update(id, data)
export const deleteReformConfig = (id: string) => pb.collection('reform_configs').delete(id)

export const getReformClassifications = () =>
  pb.collection('reform_classifications').getFullList({ sort: '-created' })
export const createReformClassification = (data: Record<string, unknown>) =>
  pb.collection('reform_classifications').create(data)
export const updateReformClassification = (id: string, data: Record<string, unknown>) =>
  pb.collection('reform_classifications').update(id, data)

export const getReformRules = () => pb.collection('reform_rules').getFullList({ sort: '-created' })
export const createReformRule = (data: Record<string, unknown>) =>
  pb.collection('reform_rules').create(data)
export const updateReformRule = (id: string, data: Record<string, unknown>) =>
  pb.collection('reform_rules').update(id, data)

export const getReformTransitions = () =>
  pb.collection('reform_transition').getFullList({ sort: '-created' })
export const createReformTransition = (data: Record<string, unknown>) =>
  pb.collection('reform_transition').create(data)
export const updateReformTransition = (id: string, data: Record<string, unknown>) =>
  pb.collection('reform_transition').update(id, data)

export const getReformCredits = () =>
  pb.collection('reform_credits').getFullList({ sort: '-created' })
export const updateReformCredit = (id: string, data: Record<string, unknown>) =>
  pb.collection('reform_credits').update(id, data)

export const getReformSimulations = () =>
  pb.collection('reform_simulations').getFullList({ sort: '-created' })
export const createReformSimulation = (data: Record<string, unknown>) =>
  pb.collection('reform_simulations').create(data)

export const getReformComparatives = () =>
  pb.collection('reform_comparatives').getFullList({ sort: '-created' })
export const createReformComparative = (data: Record<string, unknown>) =>
  pb.collection('reform_comparatives').create(data)

export const getReformValidations = () =>
  pb.collection('reform_validations').getFullList({ sort: '-created' })

export const getCorrections = () =>
  pb.collection('fiscal_corrections').getFullList({ sort: '-created' })
export const createCorrection = (data: Record<string, unknown>) =>
  pb.collection('fiscal_corrections').create(data)
export const updateCorrection = (id: string, data: Record<string, unknown>) =>
  pb.collection('fiscal_corrections').update(id, data)

export const getManifestations = () =>
  pb.collection('fiscal_manifestations').getFullList({ sort: '-created' })
export const createManifestation = (data: Record<string, unknown>) =>
  pb.collection('fiscal_manifestations').create(data)
export const updateManifestation = (id: string, data: Record<string, unknown>) =>
  pb.collection('fiscal_manifestations').update(id, data)

export const getInutilizations = () =>
  pb.collection('fiscal_inutilizations').getFullList({ sort: '-created' })
export const createInutilization = (data: Record<string, unknown>) =>
  pb.collection('fiscal_inutilizations').create(data)
export const updateInutilization = (id: string, data: Record<string, unknown>) =>
  pb.collection('fiscal_inutilizations').update(id, data)

export const getCertificates = () =>
  pb.collection('fiscal_certificates').getFullList({ sort: '-created' })
export const createCertificate = (data: Record<string, unknown>) =>
  pb.collection('fiscal_certificates').create(data)
export const updateCertificate = (id: string, data: Record<string, unknown>) =>
  pb.collection('fiscal_certificates').update(id, data)

export const getFiscalConfigs = () =>
  pb.collection('fiscal_configurations').getFullList({ sort: '-created' })
export const createFiscalConfig = (data: Record<string, unknown>) =>
  pb.collection('fiscal_configurations').create(data)
export const updateFiscalConfig = (id: string, data: Record<string, unknown>) =>
  pb.collection('fiscal_configurations').update(id, data)

export const getSpedRecords = () => pb.collection('sped_records').getFullList({ sort: '-created' })
export const createSpedRecord = (data: Record<string, unknown>) =>
  pb.collection('sped_records').create(data)
export const updateSpedRecord = (id: string, data: Record<string, unknown>) =>
  pb.collection('sped_records').update(id, data)

export const getFiscalBooks = () => pb.collection('fiscal_books').getFullList({ sort: '-created' })
export const createFiscalBook = (data: Record<string, unknown>) =>
  pb.collection('fiscal_books').create(data)

export function logFiscalAudit(action: string, docType: string, docId: string, summary: string) {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action,
      module: 'fiscal',
      target_collection: docType,
      target_id: docId,
      target_summary: summary,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}
