export interface FinancialEntry {
  id: string
  date: string
  responsible_user: string
  type: string
  amount: string
  description: string
  note?: string
}

export interface RestrictionEntry {
  id: string
  action: 'activate' | 'remove'
  reason: string
  responsible_user: string
  date: string
}

export interface DocumentMetadata {
  id: string
  name: string
  category: string
  uploaded_at: string
  responsible_user: string
  file_field: string
}

export interface PartnerFormState {
  partner_type: string
  person_type: 'PF' | 'PJ'
  email: string
  phone: string
  cep: string
  address: string
  address_number: string
  address_complement: string
  address_district: string
  address_city: string
  address_state: string
  reference_point: string
  full_name: string
  cpf: string
  birth_date: string
  marital_status: string
  profession: string
  monthly_income: string
  rg_cnh: string
  document_type: string
  document_number: string
  document_issuer: string
  document_issue_date: string
  document_validity: string
  company_name: string
  trade_name: string
  cnpj: string
  state_registration: string
  observations: string
  password: string
  active: boolean
  blocked: boolean
}

export const EMPTY_PARTNER_FORM: PartnerFormState = {
  partner_type: 'Cliente',
  person_type: 'PF',
  email: '',
  phone: '',
  cep: '',
  address: '',
  address_number: '',
  address_complement: '',
  address_district: '',
  address_city: '',
  address_state: '',
  reference_point: '',
  full_name: '',
  cpf: '',
  birth_date: '',
  marital_status: '',
  profession: '',
  monthly_income: '',
  rg_cnh: '',
  document_type: '',
  document_number: '',
  document_issuer: '',
  document_issue_date: '',
  document_validity: '',
  company_name: '',
  trade_name: '',
  cnpj: '',
  state_registration: '',
  observations: '',
  password: '',
  active: true,
  blocked: false,
}
