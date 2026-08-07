import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { loginVerifyMfa } from '@/services/mfa'

interface MfaVerifyScreenProps {
  onVerify: (code: string) => Promise<{ error: string | null }>
  onCancel: () => void
}

export function MfaVerifyScreen({ onVerify, onCancel }: MfaVerifyScreenProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Digite o código de 6 dígitos.')
      return
    }
    setLoading(true)
    setError('')
    const result = await onVerify(code)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      setCode('')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-2 border-[#005B2E]/30 shadow-2xl">
        <CardHeader className="bg-[#01361D] text-white border-b border-[#C89B3C]/40 pb-6 rounded-t-lg">
          <CardTitle className="text-xl sm:text-2xl font-black text-center text-white flex items-center justify-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#E4C46A]" />
            Verificação MFA
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center mb-6">
            Digite o código de 6 dígitos do seu app autenticador.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="mfa-code" className="text-sm font-semibold text-foreground">
                Código de Verificação
              </Label>
              <Input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ''))
                  if (error) setError('')
                }}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] font-bold focus-visible:ring-[#005B2E] border-border"
                autoComplete="one-time-code"
                autoFocus
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/30">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-extrabold text-base shadow-lg h-12 rounded-xl"
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Verificar
                </>
              )}
            </Button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground font-medium pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao login
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
