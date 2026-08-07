import pb from '@/lib/pocketbase/client'

export interface MfaSetupResult {
  secret: string
  otpauth_url: string
}

export interface MfaStatusResult {
  enabled: boolean
  has_secret: boolean
  verified_at: string
  mfa_required_for_admins: boolean
  is_admin: boolean
  mfa_active: boolean
}

export async function setupMfa(): Promise<MfaSetupResult> {
  return pb.send('/backend/v1/mfa/setup', { method: 'POST' })
}

export async function verifyMfa(code: string): Promise<{ verified: boolean; enabled: boolean }> {
  return pb.send('/backend/v1/mfa/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function loginVerifyMfa(code: string): Promise<{ verified: boolean }> {
  return pb.send('/backend/v1/mfa/login-verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function disableMfa(code: string): Promise<{ disabled: boolean }> {
  return pb.send('/backend/v1/mfa/disable', {
    method: 'POST',
    body: JSON.stringify({ code }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getMfaStatus(): Promise<MfaStatusResult> {
  return pb.send('/backend/v1/mfa/status', { method: 'GET' })
}

export function getQrCodeImageUrl(otpauthUrl: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(otpauthUrl)}`
}
