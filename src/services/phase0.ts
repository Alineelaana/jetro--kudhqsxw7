import pb from '@/lib/pocketbase/client'
import type { Phase0ValidationResult, Phase0StatusResponse } from '@/lib/phase0-types'

export const getPhase0Status = () =>
  pb.send('/backend/v1/phase0/status', { method: 'GET' }) as Promise<Phase0StatusResponse>

export const validatePhase0Stage = (stage: string) =>
  pb.send(`/backend/v1/phase0/validate/${stage}`, {
    method: 'GET',
  }) as Promise<Phase0ValidationResult>

export const approvePhase0Stage = (stage: string) =>
  pb.send(`/backend/v1/phase0/approve/${stage}`, {
    method: 'POST',
    body: JSON.stringify({}),
    headers: { 'Content-Type': 'application/json' },
  }) as Promise<{ stage: string; approved: boolean; message: string }>
