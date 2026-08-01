export interface FinancialEntry {
  id: string
  date: string
  description: string
  amount: string
  type: 'credit' | 'debit'
  note: string
}

export interface PartnerFormState {
  partner_type: string
  person_type: 'PF' | 'PJ'
  email: string
  phone: string
  cep: string
  address: string
  reference_point: string
  full_name: string
  cpf: string
  birth_date: string
  marital_status: string
  profession: string
  monthly_income: string
  rg_cnh: string
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
  reference_point: '',
  full_name: '',
  cpf: '',
  birth_date: '',
  marital_status: '',
  profession: '',
  monthly_income: '',
  rg_cnh: '',
  company_name: '',
  trade_name: '',
  cnpj: '',
  state_registration: '',
  observations: '',
  password: '',
  active: true,
  blocked: false,
}
