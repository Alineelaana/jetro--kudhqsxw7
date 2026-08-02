import pb from '@/lib/pocketbase/client'
import type { ContractOperation } from '@/lib/contract-types'

export async function getContractsOperations(): Promise<ContractOperation[]> {
  const records = await pb.collection('contracts_operations').getFullList({ sort: '-created' })
  return records as unknown as ContractOperation[]
}

export async function createContractOperation(data: {
  name: string
  services: unknown[]
  total_value: string
  status: string
}) {
  return pb.collection('contracts_operations').create(data)
}

export async function updateContractOperation(id: string, data: Record<string, unknown>) {
  return pb.collection('contracts_operations').update(id, data)
}

export async function deleteContractOperation(id: string) {
  return pb.collection('contracts_operations').delete(id)
}
