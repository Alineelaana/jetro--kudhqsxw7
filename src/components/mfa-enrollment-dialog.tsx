import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ShieldCheck, QrCode, AlertCircle } from 'lucide-react'
import { setupMfa, verifyMfa, getQrCodeImageUrl } from '@/services/mfa'
import { toast } from '@/hooks/use-toast'

interface MfaEnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function MfaEnrollmentDialog({ open, onOpenChange, onSuccess }: MfaEnrollmentDialogProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup')
  const [secret, setSecret] = useState('')
  const [otpauthUrl, setOtpauthUrl] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSetup = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await setupMfa()
      setSecret(result.secret)
      setOtpauthUrl(result.otpauth_url)
      setStep('verify')
    } catch {
      setError('Erro ao configurar MFA. Tente novamente.')
    }
    setLoading(false)
  }

  const handleVerify = async () => {
    if (!code.trim() || code.trim().length !== 6) {
      setError('Digite o código de 6 dígitos.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await verifyMfa(code.trim())
      toast({ title: 'MFA ativado com sucesso!' })
      onOpenChange(false)
      onSuccess?.()
      setStep('setup')
      setCode('')
      setSecret('')
      setOtpauthUrl('')
    } catch {
      setError('Código inválido. Verifique no seu app autenticador e tente novamente.')
    }
    setLoading(false)
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setStep('setup')
      setCode('')
      setSecret('')
      setOtpauthUrl('')
      setError('')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Autenticação de Dois Fatores
          </DialogTitle>
        </DialogHeader>
        {step === 'setup' ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Proteja sua conta com uma camada extra de segurança. Ao ativar o MFA, você precisará
              informar um código do seu app autenticador (Google Authenticator, Authy, etc.) a cada
              login.
            </p>
            <Button
              onClick={handleSetup}
              className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4 mr-2" />
              )}
              Iniciar Configuração
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-muted/60 rounded-lg border text-center space-y-2 w-full">
                <div className="text-xs font-semibold text-foreground">
                  Chave Secreta TOTP (RFC 6238)
                </div>
                <p className="text-xs text-muted-foreground">
                  Por segurança e privacidade, a chave não é enviada para APIs externas de QR Code.
                  Insira a chave abaixo no seu aplicativo autenticador (Google Authenticator, Authy
                  ou Microsoft Authenticator):
                </p>
                <div className="flex justify-center">
                  <code className="text-sm bg-background border px-3 py-2 rounded font-mono font-bold tracking-wider break-all select-all text-primary">
                    {secret}
                  </code>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mfa-code" className="text-sm font-semibold">
                Código de Verificação
              </Label>
              <Input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] font-bold focus-visible:ring-[#005B2E]"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/30">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={handleVerify}
                className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
                disabled={loading || code.length !== 6}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                )}
                Verificar e Ativar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
