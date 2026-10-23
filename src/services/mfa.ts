import pb from '@/lib/pocketbase/client'

export interface MfaSetupResponse {
  secret: string
  otpauth_url: string
}

export interface MfaStatusResponse {
  enabled: boolean
  has_secret: boolean
  verified_at: string | null
  mfa_active?: boolean
}

export interface MfaVerifyResponse {
  verified: boolean
  enabled?: boolean
  user?: any
}

export const mfaService = {
  async getStatus(): Promise<MfaStatusResponse> {
    const res = await pb.send<{
      enabled: boolean
      has_secret: boolean
      verified_at: string | null
      mfa_active?: boolean
    }>('/backend/v1/mfa/status', {
      method: 'GET',
    })
    return {
      ...res,
      mfa_active: res.mfa_active ?? res.enabled,
    }
  },

  async setup(): Promise<MfaSetupResponse> {
    return pb.send<MfaSetupResponse>('/backend/v1/mfa/setup', {
      method: 'POST',
    })
  },

  async verify(code: string): Promise<MfaVerifyResponse> {
    return pb.send<MfaVerifyResponse>('/backend/v1/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },

  async challengeVerify(challengeToken: string, code: string): Promise<MfaVerifyResponse> {
    return pb.send<MfaVerifyResponse>('/backend/v1/mfa/challenge-verify', {
      method: 'POST',
      body: JSON.stringify({ challenge_token: challengeToken, code }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },

  async loginVerify(code: string): Promise<MfaVerifyResponse> {
    return pb.send<MfaVerifyResponse>('/backend/v1/mfa/login-verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },

  async disable(): Promise<{ disabled: boolean }> {
    return pb.send<{ disabled: boolean }>('/backend/v1/mfa/disable', {
      method: 'POST',
    })
  },
}

// Aliases para compatibilidade com componentes existentes
export const setupMfa = mfaService.setup
export const verifyMfa = mfaService.verify
export const getMfaStatus = mfaService.getStatus
export const disableMfa = mfaService.disable
export const loginVerifyMfa = mfaService.loginVerify
export const challengeVerifyMfa = mfaService.challengeVerify

// Para segurança e privacidade, o segredo e otpauth_url NUNCA são vazados para geradores QR externos
export function getQrCodeImageUrl(_otpauthUrl: string, _size: number = 200): string {
  return ''
}
