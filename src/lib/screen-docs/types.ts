export type ScreenDocTopicKey =
  | 'objective'
  | 'features'
  | 'businessRules'
  | 'workflow'
  | 'dataSource'
  | 'integrations'
  | 'permissions'
  | 'dependencies'
  | 'errorHandling'

export interface ScreenDocSection {
  title: string
  content: string
  pendingValidation?: boolean
}

export interface ScreenDocEntry {
  route: string
  title: string
  moduleGroup: string
  docVersion: string
  lastUpdated: string
  author: string
  /** 9 tópicos obrigatórios */
  objective: ScreenDocSection
  features: ScreenDocSection
  businessRules: ScreenDocSection
  workflow: ScreenDocSection
  dataSource: ScreenDocSection
  integrations: ScreenDocSection
  permissions: ScreenDocSection
  dependencies: ScreenDocSection
  errorHandling: ScreenDocSection
}

export interface ScreenDocHistoryRecord {
  id?: string
  screen_route: string
  screen_title: string
  module_group: string
  changed_item: string
  description: string
  previous_version?: string
  current_version: string
  update_origin?: string
  author?: string
  created?: string
  updated?: string
}

export const SCREEN_DOC_TOPICS: { key: ScreenDocTopicKey; label: string }[] = [
  { key: 'objective', label: '1. Objetivo' },
  { key: 'features', label: '2. Funcionalidades' },
  { key: 'businessRules', label: '3. Regras de Negócio' },
  { key: 'workflow', label: '4. Fluxo de Funcionamento' },
  { key: 'dataSource', label: '5. Origem dos Dados' },
  { key: 'integrations', label: '6. Integrações' },
  { key: 'permissions', label: '7. Permissões' },
  { key: 'dependencies', label: '8. Dependências' },
  { key: 'errorHandling', label: '9. Tratamento de Erros' },
]

export function isEntryPendingValidation(entry: ScreenDocEntry): boolean {
  const sections: ScreenDocSection[] = [
    entry.objective,
    entry.features,
    entry.businessRules,
    entry.workflow,
    entry.dataSource,
    entry.integrations,
    entry.permissions,
    entry.dependencies,
    entry.errorHandling,
  ]
  return sections.some(
    (s) => s.pendingValidation === true || s.content.includes('Pendente de validação técnica'),
  )
}
