export interface ServiceOffered {
  id: string
  name: string
  description: string
  value: string
  max_discount: number
  observations: string
  active: boolean
  created: string
  updated: string
}

export interface ServiceFormState {
  name: string
  description: string
  value: string
  max_discount: string
  observations: string
}
