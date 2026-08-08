import pb from '@/lib/pocketbase/client'
import { sstGetList, sstCreate, sstUpdate, sstDelete } from '@/services/sst'

export const SST_ENTERPRISE_COLLECTIONS = {
  riskMatrixConfig: 'sst_risk_matrix_config',
  environmentalAssessments: 'sst_environmental_assessments',
  ltcat: 'sst_ltcat',
  medicalRecords: 'sst_occupational_medical_records',
  exposureGroups: 'sst_exposure_groups',
  workEnvironments: 'sst_work_environments',
  cipa: 'sst_cipa',
  sesmt: 'sst_sesmt',
  ergonomics: 'sst_ergonomics',
  emergencies: 'sst_emergencies',
  brigade: 'sst_brigade',
  trainingMatrix: 'sst_training_matrix',
  esocialEvents: 'sst_esocial_sst_events',
  complianceStatus: 'sst_compliance_status',
  moc: 'sst_management_of_change',
  lockout: 'sst_lockout',
  nrCatalog: 'sst_nr_catalog',
  auditTrail: 'sst_audit_trail',
  confinedSpaces: 'sst_confined_spaces',
  heightWork: 'sst_height_work',
} as const

export const getRiskMatrixConfigs = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.riskMatrixConfig)
export const getEnvironmentalAssessments = () =>
  sstGetList(SST_ENTERPRISE_COLLECTIONS.environmentalAssessments)
export const getLTCAT = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.ltcat)
export const getExposureGroups = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.exposureGroups)
export const getWorkEnvironments = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.workEnvironments)
export const getCIPA = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.cipa)
export const getSESMT = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.sesmt)
export const getErgonomics = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.ergonomics)
export const getEmergencies = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.emergencies)
export const getBrigade = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.brigade)
export const getTrainingMatrix = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.trainingMatrix)
export const getEsocialSSTEvents = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.esocialEvents)
export const getComplianceStatus = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.complianceStatus)
export const getMOC = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.moc)
export const getLockouts = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.lockout)
export const getNRCatalog = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.nrCatalog)
export const getConfinedSpaces = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.confinedSpaces)
export const getHeightWork = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.heightWork)
export const getSSTAuditTrail = () => sstGetList(SST_ENTERPRISE_COLLECTIONS.auditTrail)

export const SST_EXTENSION_COLLECTIONS = {
  ppp: 'sst_ppp',
  investigations: 'sst_investigations',
  nr10Electrical: 'sst_nr10_electrical',
  nr12Machines: 'sst_nr12_machines',
  nr13Boilers: 'sst_nr13_boilers',
  nr11MaterialHandling: 'sst_nr11_material_handling',
  nr15Insalubridade: 'sst_nr15_insalubridade',
  nr16Periculosidade: 'sst_nr16_periculosidade',
  obligations: 'sst_obligations',
  auditChecklists: 'sst_audit_checklists',
} as const

export const getPpp = () => sstGetList(SST_EXTENSION_COLLECTIONS.ppp)
export const getInvestigations = () => sstGetList(SST_EXTENSION_COLLECTIONS.investigations)
export const getNr10Electrical = () => sstGetList(SST_EXTENSION_COLLECTIONS.nr10Electrical)
export const getNr12Machines = () => sstGetList(SST_EXTENSION_COLLECTIONS.nr12Machines)
export const getNr13Boilers = () => sstGetList(SST_EXTENSION_COLLECTIONS.nr13Boilers)
export const getNr11MaterialHandling = () =>
  sstGetList(SST_EXTENSION_COLLECTIONS.nr11MaterialHandling)
export const getNr15Insalubridade = () => sstGetList(SST_EXTENSION_COLLECTIONS.nr15Insalubridade)
export const getNr16Periculosidade = () => sstGetList(SST_EXTENSION_COLLECTIONS.nr16Periculosidade)
export const getSstObligations = () => sstGetList(SST_EXTENSION_COLLECTIONS.obligations)
export const getAuditChecklists = () => sstGetList(SST_EXTENSION_COLLECTIONS.auditChecklists)

export async function getOverdueObligations() {
  const items = await getSstObligations()
  const now = new Date()
  return items.filter(
    (o: any) => o.data_prevista && new Date(o.data_prevista) < now && o.situacao !== 'Concluída',
  )
}

export async function getUpcomingObligations(days: number = 30) {
  const items = await getSstObligations()
  const now = new Date()
  const future = new Date(now.getTime() + days * 86400000)
  return items.filter((o: any) => {
    if (!o.data_prevista || o.situacao === 'Concluída') return false
    const d = new Date(o.data_prevista)
    return d >= now && d <= future
  })
}

export async function getInvestigationsByAccident(accidentId: string) {
  return pb.collection(SST_EXTENSION_COLLECTIONS.investigations).getFullList({
    filter: `accident_id = "${accidentId}"`,
    sort: '-created',
  }) as Promise<any[]>
}

export function getMedicalRecords() {
  return pb.collection(SST_ENTERPRISE_COLLECTIONS.medicalRecords).getFullList({ sort: '-created' })
}

export async function getEsocialSSTByType(tipoEvento: string) {
  return pb.collection(SST_ENTERPRISE_COLLECTIONS.esocialEvents).getFullList({
    filter: `tipo_evento = "${tipoEvento}"`,
    sort: '-created',
  }) as Promise<any[]>
}

export async function getEsocialSSTStats() {
  const events = await getEsocialSSTEvents()
  return {
    s2210: {
      pending: events.filter((e: any) => e.tipo_evento === 'S-2210' && e.situacao === 'Pendente')
        .length,
      sent: events.filter((e: any) => e.tipo_evento === 'S-2210' && e.situacao === 'Enviado')
        .length,
      accepted: events.filter(
        (e: any) => e.tipo_evento === 'S-2210' && ['Aceito', 'Processado'].includes(e.situacao),
      ).length,
      rejected: events.filter((e: any) => e.tipo_evento === 'S-2210' && e.situacao === 'Rejeitado')
        .length,
    },
    s2220: {
      pending: events.filter((e: any) => e.tipo_evento === 'S-2220' && e.situacao === 'Pendente')
        .length,
      sent: events.filter((e: any) => e.tipo_evento === 'S-2220' && e.situacao === 'Enviado')
        .length,
      accepted: events.filter(
        (e: any) => e.tipo_evento === 'S-2220' && ['Aceito', 'Processado'].includes(e.situacao),
      ).length,
      rejected: events.filter((e: any) => e.tipo_evento === 'S-2220' && e.situacao === 'Rejeitado')
        .length,
    },
    s2221: {
      pending: events.filter((e: any) => e.tipo_evento === 'S-2221' && e.situacao === 'Pendente')
        .length,
      sent: events.filter((e: any) => e.tipo_evento === 'S-2221' && e.situacao === 'Enviado')
        .length,
      accepted: events.filter(
        (e: any) => e.tipo_evento === 'S-2221' && ['Aceito', 'Processado'].includes(e.situacao),
      ).length,
      rejected: events.filter((e: any) => e.tipo_evento === 'S-2221' && e.situacao === 'Rejeitado')
        .length,
    },
    s2240: {
      pending: events.filter((e: any) => e.tipo_evento === 'S-2240' && e.situacao === 'Pendente')
        .length,
      sent: events.filter((e: any) => e.tipo_evento === 'S-2240' && e.situacao === 'Enviado')
        .length,
      accepted: events.filter(
        (e: any) => e.tipo_evento === 'S-2240' && ['Aceito', 'Processado'].includes(e.situacao),
      ).length,
      rejected: events.filter((e: any) => e.tipo_evento === 'S-2240' && e.situacao === 'Rejeitado')
        .length,
    },
  }
}

export async function getComplianceByNR() {
  const items = await getComplianceStatus()
  return items.reduce((acc: Record<string, any[]>, item: any) => {
    const nr = item.nr || 'Outros'
    if (!acc[nr]) acc[nr] = []
    acc[nr].push(item)
    return acc
  }, {})
}

export async function getTrainingMatrixAlerts() {
  const items = await getTrainingMatrix()
  const now = new Date()
  const ninetyDays = new Date(now.getTime() + 90 * 86400000)
  return {
    expired: items.filter(
      (t: any) => t.situacao === 'Vencido' || (t.validade && new Date(t.validade) < now),
    ).length,
    expiring: items.filter((t: any) => {
      if (!t.validade) return false
      const d = new Date(t.validade)
      return d >= now && d <= ninetyDays
    }).length,
    pending: items.filter((t: any) => t.situacao === 'Pendente').length,
    valid: items.filter((t: any) => t.situacao === 'Válido').length,
  }
}

export async function logSSTAudit(action: string, module: string, detail: string) {
  const user = pb.authStore.record as Record<string, unknown> | null
  await sstCreate(SST_ENTERPRISE_COLLECTIONS.auditTrail, {
    acao: action,
    modulo: module,
    usuario: (user?.name as string) || 'System',
    detalhe: detail,
    situacao: 'Registrado',
  }).catch(() => {})
}

export const createSSTEnterprise = (col: string, data: Record<string, unknown>) =>
  sstCreate(col, data)
export const updateSSTEnterprise = (col: string, id: string, data: Record<string, unknown>) =>
  sstUpdate(col, id, data)
export const deleteSSTEnterprise = (col: string, id: string) => sstDelete(col, id)
