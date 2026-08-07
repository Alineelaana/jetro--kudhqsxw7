import pb from '@/lib/pocketbase/client'

export interface RlsCollectionInfo {
  name: string
  type: string
  listRule: string | null
  viewRule: string | null
  createRule: string | null
  updateRule: string | null
  deleteRule: string | null
  nullRules: string[]
  complete: boolean
}

export interface RlsVerificationResult {
  totalCollections: number
  completeCollections: number
  incompleteCollections: number
  results: RlsCollectionInfo[]
}

export async function verifyRls(): Promise<RlsVerificationResult> {
  return pb.send('/backend/v1/rls/verify', { method: 'GET' })
}
