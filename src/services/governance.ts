import pb from '@/lib/pocketbase/client'

/**
 * Camada de serviço da governança documental (padrão AvatarSi).
 * As coleções e os endpoints foram criados pela migração 0363
 * (governanca_documental_avatarsi) e 0364 (governance_numeration).
 */

export type GovernanceStatus =
  | 'em_elaboracao'
  | 'em_revisao'
  | 'em_aprovacao'
  | 'aprovado'
  | 'publicado'
  | 'obsoleto'
  | 'revogado'

export type GovernanceClassification = 'publico' | 'interno' | 'confidencial' | 'restrito'

export interface GovernanceDocument {
  id: string
  empresa: string
  title: string
  project_code: string
  type_code: string
  doc_code: string
  doc_number: number
  version_major: number
  version_minor: number
  version_patch: number
  version: string
  current_version: string
  status: GovernanceStatus
  classification: GovernanceClassification
  author: string
  reviewers: string
  approver: string
  approver_role: string
  purpose: string
  audience: string
  channels: string
  approval_evidence: string
  change_summary: string
  released_file_name: string
  released_at: string
  released_by: string
  approved_at: string
  pending_review: boolean
  created: string
  updated: string
}

export interface GovernanceProject {
  id: string
  empresa: string
  code: string
  name: string
  active: boolean
  created: string
  updated: string
}

export interface GovernanceDocumentType {
  id: string
  empresa: string
  code: string
  name: string
  active: boolean
  created: string
  updated: string
}

export interface GovernanceWorkflowConfig {
  id: string
  empresa: string
  elaboradores: string
  revisores_tecnicos: string
  revisores_identidade: string
  revisor_juridico: string
  revisor_fiscal: string
  revisor_financeiro: string
  aprovador: string
  liberador: string
  divulgador: string
  observacoes: string
  active: boolean
  created: string
  updated: string
}

export interface GovernanceAuditTrail {
  id: string
  empresa: string
  document_id: string
  doc_code: string
  doc_number: number
  version: string
  event: string
  user_name: string
  user_role: string
  details: string
  created: string
  updated: string
}

export interface GovernanceNorm {
  id: string
  empresa: string
  title: string
  content: string
  version: string
  active: boolean
  created: string
  updated: string
}

export interface GovernanceNormAck {
  id: string
  empresa: string
  norma_id: string
  norma_version: string
  user_name: string
  user_function: string
  acknowledged_at: string
  created: string
  updated: string
}

export interface GovernanceReleaseChecklistItem {
  id: string
  empresa: string
  document_id: string
  version: string
  item_key: string
  item_label: string
  confirmed: boolean
  confirmed_by: string
  confirmed_at: string
  created: string
  updated: string
}

export interface GovernanceDocumentVersion {
  id: string
  empresa: string
  document_id: string
  doc_code: string
  doc_number: number
  version: string
  status: string
  classification: string
  change_summary: string
  author: string
  approver: string
  approver_role: string
  approved_at: string
  released_at: string
  released_by: string
  file_name: string
  created_by: string
  created: string
  updated: string
}

const STATUS_LABEL_MAP: Record<string, string> = {
  em_elaboracao: 'Em elaboração (MINUTA)',
  em_revisao: 'Em revisão',
  em_aprovacao: 'Em aprovação',
  aprovado: 'Aprovado',
  publicado: 'Publicado / vigente',
  obsoleto: 'Obsoleto',
  revogado: 'Revogado',
}

const CLASSIFICATION_LABEL: Record<string, string> = {
  publico: 'Público',
  interno: 'Interno',
  confidencial: 'Confidencial',
  restrito: 'Restrito',
}

export const governanceStatusLabels = (s: string) => STATUS_LABEL_MAP[s] ?? s
export const governanceClassificationLabels = (c: string) => CLASSIFICATION_LABEL[c] ?? c

// ---------------------------------------------------------------
// Itens do checklist de liberação (chaves estáveis usadas no endpoint)
// ---------------------------------------------------------------
export const RELEASE_CHECKLIST_ITEMS = [
  { key: 'codigo_versao', label: 'Código, versão, data, classificação e status corretos' },
  { key: 'conteudo_fontes', label: 'Conteúdo, fontes e dados revisados' },
  { key: 'confidencialidade', label: 'Confidencialidade, público e destinatários verificados' },
  { key: 'marca_identidade', label: 'Logomarca, imagens e identidade visual conferidas' },
  {
    key: 'aprovacao_registrada',
    label: 'Aprovação expressa da versão, finalidade e canal registrada',
  },
  { key: 'arquivo_vigente', label: 'Arquivo final arquivado e versão vigente identificada' },
  {
    key: 'conteudo_externo',
    label:
      'Nomes, números, direitos de imagem, legibilidade, fatos x hipóteses x projeções e ausência de promessas de capacidades indisponíveis',
  },
  {
    key: 'dados_comerciais',
    label:
      'Institucional/prospecção: sem preços, percentuais de remuneração ou condições comerciais',
  },
] as const

// ---------------------------------------------------------------
// Leitura (sempre isolada por empresa)
// ---------------------------------------------------------------
export async function listGovernanceDocuments(empresaId: string) {
  return pb.collection('governance_documents').getFullList<GovernanceDocument>({
    filter: `empresa = "${empresaId}"`,
    sort: '-created',
  })
}

export async function listGovernanceProjects(empresaId: string) {
  return pb.collection('governance_projects').getFullList<GovernanceProject>({
    filter: `empresa = "${empresaId}"`,
    sort: 'code',
  })
}

export async function listGovernanceTypes(empresaId: string) {
  return pb.collection('governance_document_types').getFullList<GovernanceDocumentType>({
    filter: `empresa = "${empresaId}"`,
    sort: 'code',
  })
}

export async function listGovernanceWorkflowConfig(empresaId: string) {
  return pb.collection('governance_workflow_config').getFullList<GovernanceWorkflowConfig>({
    filter: `empresa = "${empresaId}"`,
  })
}

export async function listGovernanceAudit(empresaId: string) {
  return pb.collection('governance_audit_trail').getFullList<GovernanceAuditTrail>({
    filter: `empresa = "${empresaId}"`,
    sort: '-created',
  })
}

export async function listGovernanceNorms(empresaId: string) {
  return pb.collection('governance_norms').getFullList<GovernanceNorm>({
    filter: `empresa = "${empresaId}"`,
    sort: '-created',
  })
}

export async function listGovernanceNormAcks(normaId: string) {
  return pb.collection('governance_norm_acknowledgments').getFullList<GovernanceNormAck>({
    filter: `norma_id = "${normaId}"`,
    sort: '-created',
  })
}

export async function listGovernanceReleaseChecklist(documentId: string, version: string) {
  return pb.collection('governance_release_checklist').getFullList<GovernanceReleaseChecklistItem>({
    filter: `document_id = "${documentId}" && version = "${version}"`,
  })
}

export async function listGovernanceDocumentVersions(documentId: string) {
  return pb.collection('governance_document_versions').getFullList<GovernanceDocumentVersion>({
    filter: `document_id = "${documentId}"`,
    sort: '-created',
  })
}

// ---------------------------------------------------------------
// Escrita — configuração isolada por empresa
// ---------------------------------------------------------------
export async function createGovernanceProject(empresaId: string, code: string, name: string) {
  return pb
    .collection('governance_projects')
    .create({ empresa: empresaId, code, name, active: true })
}

export async function createGovernanceType(empresaId: string, code: string, name: string) {
  return pb
    .collection('governance_document_types')
    .create({ empresa: empresaId, code, name, active: true })
}

export async function upsertGovernanceWorkflowConfig(
  empresaId: string,
  data: Partial<GovernanceWorkflowConfig>,
) {
  const existing = await listGovernanceWorkflowConfig(empresaId)
  if (existing.length > 0) {
    return pb.collection('governance_workflow_config').update(existing[0].id, data)
  }
  return pb
    .collection('governance_workflow_config')
    .create({ empresa: empresaId, ...data, active: true })
}

export async function createGovernanceDocument(
  data: Partial<GovernanceDocument> & { empresa: string; title: string },
) {
  return pb.collection('governance_documents').create(data)
}

export async function createGovernanceNorm(
  empresaId: string,
  data: { title: string; content: string; version: string },
) {
  return pb.collection('governance_norms').create({ empresa: empresaId, ...data, active: true })
}

// ---------------------------------------------------------------
// Endpoints de governança (pb hooks — governance_api.js)
// ---------------------------------------------------------------
export interface GovernanceTransitionPayload {
  document_id: string
  action: 'enviar_revisao' | 'aprovar' | 'devolver' | 'rejeitar' | 'liberar' | 'revogar' | 'retomar'
  version?: string
  motivo?: string
}

export async function submitGovernanceTransition(payload: GovernanceTransitionPayload) {
  return pb.send<{ ok: boolean; document_id: string; status: string; version: string }>(
    '/api/governance/transition',
    { method: 'POST', body: payload },
  )
}

export async function confirmGovernanceChecklistItem(payload: {
  document_id: string
  version: string
  item_key: string
  item_label: string
  confirmed: boolean
}) {
  return pb.send<{ ok: boolean; item: string; confirmed: boolean }>('/api/governance/checklist', {
    method: 'POST',
    body: payload,
  })
}

export async function acknowledgeGovernanceNorm(payload: {
  norma_id: string
  user_name: string
  user_function: string
}) {
  return pb.send<{ ok: boolean; ack: string }>('/api/governance/norm-ack', {
    method: 'POST',
    body: payload,
  })
}

export async function nextGovernanceVersion(payload: {
  document_id: string
  change_type: 'patch' | 'minor' | 'major'
}) {
  return pb.send<{
    document_id: string
    current_version: string
    change_type: string
    next_version: string
  }>('/api/governance/next-version', { method: 'POST', body: payload })
}

// ---------------------------------------------------------------
// Exportação de filename — AVSI_<CÓDIGO>_V<versão>_<data>.pdf
// ---------------------------------------------------------------
export function buildGovernanceFileName(doc: {
  doc_code: string
  version: string
  updated: string
}): string {
  const data = (doc.updated || '').slice(0, 10)
  const ext = 'pdf'
  return `AVSI_${doc.doc_code || 'SEM_CODIGO'}_V${doc.version || '0.0.0'}_${data}.${ext}`
}

// ---------------------------------------------------------------
// Aliases usados pela tela (governance-screen.tsx)
// ---------------------------------------------------------------
export type GovernanceTipo = GovernanceDocumentType
export type GovernanceWfc = GovernanceWorkflowConfig
export type GovernanceNorma = GovernanceNorm

export interface ChecklistItem {
  key: string
  label: string
  hint: string
}

const CHECKLIST_HINTS: Record<string, string> = {
  codigo_versao: 'Cabeçalho padronizado com código documental, versão, data e classificação.',
  conteudo_fontes: 'Revisão técnica de conteúdo, fontes e dados do documento.',
  confidencialidade: 'Público-alvo, destinatários e nível de confidencialidade conferidos.',
  marca_identidade: 'Logomarca, imagens e identidade visual conforme o manual da marca.',
  aprovacao_registrada: 'Aprovação expressa registrada com versão, finalidade e canal.',
  arquivo_vigente: 'Arquivo final arquivado e versão vigente identificada no acervo.',
  conteudo_externo: 'Conferência de nomes, números, direitos de imagem e promessas.',
  dados_comerciais: 'Sem preços, percentuais de remuneração ou condições comerciais.',
}

export const CLASSIFICACOES: { value: GovernanceClassification; label: string }[] = (
  Object.keys(CLASSIFICATION_LABEL) as GovernanceClassification[]
).map((value) => ({ value, label: CLASSIFICATION_LABEL[value] }))

export const ITENS_CHECKLIST: ChecklistItem[] = RELEASE_CHECKLIST_ITEMS.map((i) => ({
  key: i.key,
  label: i.label,
  hint: CHECKLIST_HINTS[i.key] || '',
}))

export const STATUS_LABEL: Record<string, string> = { ...STATUS_LABEL_MAP }
export const CLASSIFICACAO_LABEL: Record<string, string> = { ...CLASSIFICATION_LABEL }

export const STATUS_BADGE: Record<string, string> = {
  em_elaboracao: 'bg-amber-100 text-amber-800 border-amber-300',
  em_revisao: 'bg-blue-100 text-blue-800 border-blue-300',
  em_aprovacao: 'bg-violet-100 text-violet-800 border-violet-300',
  aprovado: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  publicado: 'bg-green-600 text-white border-green-700',
  obsoleto: 'bg-gray-100 text-gray-600 border-gray-300',
  revogado: 'bg-red-100 text-red-800 border-red-300',
}

export function parseVersion(v: string): { major: number; minor: number; patch: number } {
  const partes = String(v || '0.1.0').split('.')
  return {
    major: Number(partes[0]) || 0,
    minor: Number(partes[1]) || 0,
    patch: Number(partes[2]) || 0,
  }
}

export function calcularProximaVersao(
  major: number,
  minor: number,
  patch: number,
  changeType: string,
): [number, number, number] {
  if (changeType === 'patch') return [major, minor, patch + 1]
  if (changeType === 'major') return [major + 1, 0, 0]
  return [major, minor + 1, 0]
}

export function transitionAction(
  documentId: string,
  action: GovernanceTransitionPayload['action'],
  version?: string,
  motivo?: string,
) {
  return submitGovernanceTransition({ document_id: documentId, action, version, motivo })
}

export function confirmChecklistItem(
  documentId: string,
  version: string,
  itemKey: string,
  itemLabel: string,
) {
  return confirmGovernanceChecklistItem({
    document_id: documentId,
    version,
    item_key: itemKey,
    item_label: itemLabel,
    confirmed: true,
  })
}

export function acknowledgeNorma(
  normaId: string,
  dados: { user_name: string; user_function: string },
) {
  return acknowledgeGovernanceNorm({ norma_id: normaId, ...dados })
}
