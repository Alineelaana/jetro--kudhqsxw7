export interface ServiceOffered {
  id: string
  name: string
  description: string
  value: string
  tax_value: string
  max_discount: number
  professional_name: string
  service_area: string
  service_code: string
  observations: string
  active: boolean
  created: string
  updated: string
}

export interface ServiceFormState {
  name: string
  description: string
  value: string
  tax_value: string
  max_discount: string
  professional_name: string
  service_area: string
  observations: string
}
