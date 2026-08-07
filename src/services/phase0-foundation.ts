import pb from '@/lib/pocketbase/client'
import type { SchemaValidationResult, FunctionalTestResult } from '@/lib/phase0-foundation-types'

export const validateFoundationSchema = (): Promise<SchemaValidationResult> =>
  pb.send('/backend/v1/phase0/foundation/validate', { method: 'GET' })

export const runFoundationTests = (): Promise<FunctionalTestResult> =>
  pb.send('/backend/v1/phase0/foundation/test', { method: 'GET' })
