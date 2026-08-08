import pb from '@/lib/pocketbase/client'

export interface CertificationTestCase {
  case: number
  name: string
  steps: string[]
  expected: string
  actual: string
  passed: boolean
}

export interface CertificationResult {
  tests: CertificationTestCase[]
  totalPassed: number
  totalTests: number
  executedAt: string
  executedBy: string
}

export async function runCertificationTests(): Promise<CertificationResult> {
  return pb.send('/backend/v1/collection-center/certification', { method: 'POST' })
}
