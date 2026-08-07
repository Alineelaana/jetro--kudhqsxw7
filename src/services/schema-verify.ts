import pb from '@/lib/pocketbase/client'

export interface AutodateCheckDetail {
  collection: string
  created: boolean
  updated: boolean
  status: string
}

export interface AutodateVerifyResult {
  checked: number
  withBoth: number
  missingCreated: string[]
  missingUpdated: string[]
  missingBoth: string[]
  details: AutodateCheckDetail[]
  allValid: boolean
}

export const verifyAutodateFields = (): Promise<AutodateVerifyResult> =>
  pb.send('/backend/v1/schema/verify-autodate', { method: 'GET' })
