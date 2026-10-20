import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { type FieldErrors } from '@/lib/pocketbase/errors'
import { Lock, User, AlertCircle, Loader2, MapPin } from 'lucide-react'
import { MfaVerifyScreen } from '@/components/mfa-verify-screen'
import { AttributionFooter } from '@/components/attribution-footer'
import { logoHuramDark } from '@/lib/brand-assets'

export function AdminLogin() {
  const { login, mfaRequired, mfaLoginVerify, mfaCancel } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [allowLocation, setAllowLocation] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const clearErrors = () => {
    if (error) setError('')
    if (Object.keys(fieldErrors).length > 0) setFieldErrors({})
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    clearErrors()
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    clearErrors()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Preencha todos os campos.')
      setFieldErrors({})
      return
    }
    setSubmitting(true)
    setError('')
    setFieldErrors({})

    let coords: { latitude: number; longitude: number; accuracy: number } | null = null
    if (allowLocation && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        coords = await new Promise<{ latitude: number; longitude: number; accuracy: number }>(
          (resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                resolve({
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracy: pos.coords.accuracy,
                })
              },
              () => resolve(null as any),
              { timeout: 4000, maximumAge: 60000 },
            )
          },
        )
      } catch (_) {
        coords = null
      }
    }

    const { error: loginError, fieldErrors: fErrors } = await login(
      username.trim(),
      password,
      coords,
    )
    setSubmitting(false)
    if (loginError) {
      setError(loginError)
      setFieldErrors(fErrors || {})
    }
  }

  const hasFieldError = !!fieldErrors.email || !!fieldErrors.username || !!fieldErrors.password

  if (mfaRequired) {
    return <MfaVerifyScreen onVerify={mfaLoginVerify} onCancel={mfaCancel} />
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 space-y-4">
      <Card className="w-full max-w-md border-2 border-[#D6A755]/40 shadow-2xl bg-white">
        <CardHeader className="bg-[#003D30] text-white border-b border-[#D6A755]/40 pb-6 rounded-t-lg text-center flex flex-col items-center">
          <img
            src={logoHuramDark}
            alt="HURAM — Sistema Inteligente de Gestão"
            className="h-24 w-auto object-contain rounded-xl border border-[#D6A755]/40 mb-3 shadow-lg bg-[#003D30] p-1"
          />
          <CardTitle className="text-lg sm:text-xl font-black text-center text-white flex items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-[#D6A755]" />
            Área Restrita — HURAM
          </CardTitle>
          <p className="text-xs text-white/80 mt-1 font-medium">Sistema Inteligente de Gestão</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-semibold text-foreground">
                Usuário
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Digite seu usuário"
                  className="pl-10 focus-visible:ring-[#003D30] border-border"
                  autoComplete="username"
                />
              </div>
              {(fieldErrors.email || fieldErrors.username) && (
                <p className="text-sm text-destructive font-medium">
                  {fieldErrors.email || fieldErrors.username}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Digite sua senha"
                  className="pl-10 focus-visible:ring-[#003D30] border-border"
                  autoComplete="current-password"
                />
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-destructive font-medium">{fieldErrors.password}</p>
              )}
            </div>
            {error && !hasFieldError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/30">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/60 bg-muted/30">
              <input
                id="allow-location"
                type="checkbox"
                checked={allowLocation}
                onChange={(e) => setAllowLocation(e.target.checked)}
                className="mt-1 rounded border-[#003D30] text-[#003D30] focus:ring-[#003D30] h-4 w-4 cursor-pointer"
              />
              <label
                htmlFor="allow-location"
                className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
              >
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#003D30]" />
                  Autorizar localização precisa neste acesso
                </span>
                <span>
                  (Opcional para auditoria de segurança da sessão. Sem rastreamento contínuo).
                </span>
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#003D30] hover:bg-[#002820] text-white font-extrabold text-base shadow-lg h-12 rounded-xl"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Entrar
                </>
              )}
            </Button>
            <Link
              to="/admin/recuperar-senha"
              className="block text-center text-sm text-[#003D30] hover:underline font-bold pt-2"
            >
              Esqueci minha senha
            </Link>

            <div className="pt-3 border-t border-border mt-3">
              <Button
                asChild
                variant="outline"
                className="w-full border-[#D6A755]/70 hover:bg-[#D6A755]/15 text-[#003D30] font-bold text-sm rounded-xl"
              >
                <Link to="/site" className="flex items-center justify-center gap-2">
                  Acesse o site da HURAM
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <AttributionFooter variant="inline" className="text-[11px] text-muted-foreground/70" />
    </div>
  )
}
