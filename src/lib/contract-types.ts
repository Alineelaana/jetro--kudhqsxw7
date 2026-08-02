export interface ContractService {
  id: string
  name: string
  service_code: string
  value: string
}

export interface ContractOperation {
  id: string
  name: string
  services: ContractService[]
  total_value: string
  status: 'Rascunho' | 'Ativo' | 'Concluído' | 'Cancelado'
  created: string
  updated: string
}

export const CONTRACT_STATUS_OPTIONS = ['Rascunho', 'Ativo', 'Concluído', 'Cancelado'] as const
