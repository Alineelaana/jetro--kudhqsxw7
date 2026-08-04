export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'number'
  | 'date'
  | 'file'
  | 'switch'

export interface CadastroField {
  name: string
  label: string
  type: FieldType
  required?: boolean
  span?: 1 | 2
  options?: string[]
}

export interface CadastroConfig {
  key: string
  label: string
  collection: string
  isNew: boolean
  existingComponent?: 'products' | 'services' | 'users' | 'partners' | 'priceTables'
  nameLabel?: string
  fields: CadastroField[]
}

export interface CadastroRecord {
  id: string
  code: string
  name: string
  active: boolean
  responsible_user: string
  created: string
  updated: string
  [key: string]: unknown
}

export const f = (
  name: string,
  label: string,
  type: FieldType,
  required = false,
  span: 1 | 2 = 1,
  options?: string[],
): CadastroField => ({ name, label, type, required, span, options })

export interface CadastroGroup {
  label: string
  keys: string[]
}
