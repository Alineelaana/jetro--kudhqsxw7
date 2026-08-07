export interface Phase0FieldInfo {
  name: string
  type: string
}

export interface Phase0CollectionInfo {
  name: string
  exists: boolean
  fields: Phase0FieldInfo[]
  rules: {
    listRule: string
    viewRule: string
    createRule: string
    updateRule: string
    deleteRule: string
  }
  indexes: string[]
  recordCount: number
  error?: string
}

export interface Phase0RelationInfo {
  from: string
  field: string
  to: string
  fromExists: boolean
  toExists: boolean
  valid: boolean
}

export interface Phase0Acceptance {
  structuralExistence: boolean
  persistence: boolean
  functionalImplementation: boolean
  integration: boolean
  architecturalCompliance: boolean
}

export interface Phase0SeedData {
  products: number
  bomVersions: number
  bomComponents: number
  resources: number
  routes: number
  routeOps: number
  costs: number
}

export interface Phase0ValidationResult {
  stage: string
  passed: boolean
  collections: Phase0CollectionInfo[]
  relations: Phase0RelationInfo[]
  seedData: Phase0SeedData | null
  acceptance: Phase0Acceptance
  timestamp: string
}

export interface Phase0StageStatus {
  stage: number
  approved: boolean
  key: string
}

export interface Phase0StatusResponse {
  stages: Phase0StageStatus[]
  allApproved: boolean
}
