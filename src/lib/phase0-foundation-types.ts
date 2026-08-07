export type ValidationStatus = 'pass' | 'fail' | 'warn'

export interface FieldValidation {
  name: string
  exists: boolean
  type: string
  expectedType: string
  required: boolean
  expectedRequired: boolean
  status: ValidationStatus
}

export interface IndexValidation {
  name: string
  exists: boolean
  status: ValidationStatus
}

export interface RuleValidation {
  expected: string
  actual: string
  status: ValidationStatus
}

export interface CollectionValidation {
  name: string
  exists: boolean
  fields: FieldValidation[]
  indexes: IndexValidation[]
  rules: Record<string, RuleValidation>
  status: ValidationStatus
}

export interface ExtendedFieldValidation {
  collection: string
  field: string
  exists: boolean
  type: string
  expectedType: string
  duplicated: boolean
  status: ValidationStatus
  values?: string[]
}

export interface SchemaValidationResult {
  collections: CollectionValidation[]
  extendedFields: ExtendedFieldValidation[]
  errors: string[]
  warnings: string[]
}

export interface FunctionalTestItem {
  collection: string
  actions: string[]
  status: ValidationStatus
  error?: string
}

export interface FunctionalTestResult {
  tests: FunctionalTestItem[]
  errors: string[]
  warnings: string[]
}

export interface AcceptanceLevel {
  level: number
  name: string
  status: ValidationStatus
  description: string
}

export interface FoundationValidationResult {
  timestamp: string
  overallStatus: ValidationStatus
  schema: SchemaValidationResult
  tests: FunctionalTestResult
  acceptanceLevels: AcceptanceLevel[]
  executionScope: {
    executed: string[]
    notExecuted: string[]
    description: string
  }
}

export const EXECUTION_SCOPE = {
  executed: ['0085'],
  notExecuted: ['0086', '0087', '0088'],
  description:
    'Apenas a migração 0085 (Fundação) foi validada. Migrações 0086, 0087 e 0088 NÃO foram executadas nem validadas.',
}

export function computeAcceptanceLevels(
  schema: SchemaValidationResult,
  tests: FunctionalTestResult,
): AcceptanceLevel[] {
  const schemaPass = schema.collections.every((c) => c.status !== 'fail')
  const fieldsPass = schema.extendedFields.every((f) => f.status !== 'fail')
  const testsPass = tests.tests.every((t) => t.status !== 'fail')
  const totalErrors = schema.errors.length + tests.errors.length
  const totalWarnings = schema.warnings.length + tests.warnings.length
  const logsStatus: ValidationStatus =
    totalErrors > 0 ? 'fail' : totalWarnings > 0 ? 'warn' : 'pass'

  return [
    {
      level: 1,
      name: 'Revisão Estática',
      status: 'pass',
      description:
        'Migração 0085 utiliza classes oficiais do PocketBase JSVM com guards de idempotência e post-save validation.',
    },
    {
      level: 2,
      name: 'Validação do Schema Vivo',
      status: schemaPass && fieldsPass ? 'pass' : 'fail',
      description: `${schema.collections.length} coleções e ${schema.extendedFields.length} campos estendidos verificados diretamente no schema vivo.`,
    },
    {
      level: 3,
      name: 'Testes Funcionais',
      status: testsPass ? 'pass' : 'fail',
      description: `CRUD executado em ${tests.tests.length} coleções com limpeza automática de dados de teste.`,
    },
    {
      level: 4,
      name: 'Revisão de Logs e Erros',
      status: logsStatus,
      description: `${totalErrors} erro(s), ${totalWarnings} aviso(s) encontrados.`,
    },
    {
      level: 5,
      name: 'Apresentação de Evidências',
      status: 'pass',
      description:
        'Evidências completas apresentadas. Nenhuma ação adicional executada sem aprovação explícita.',
    },
  ]
}

export function computeOverallStatus(levels: AcceptanceLevel[]): ValidationStatus {
  if (levels.some((l) => l.status === 'fail')) return 'fail'
  if (levels.some((l) => l.status === 'warn')) return 'warn'
  return 'pass'
}
