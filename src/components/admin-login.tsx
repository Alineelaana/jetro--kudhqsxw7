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
import { logoHuramDark, HURAM_PALETTE } from '@/lib/brand-assets'
import { useBrand } from '@/hooks/use-brand'

export function AdminLogin() {
  const { login, mfaRequired, mfaLoginVerify, mfaCancel } = useAuth()
  const { loginBrand } = useBrand()
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

  const corPrimaria = loginBrand.corPrimaria || HURAM_PALETTE.green
  const corSecundaria = loginBrand.corSecundaria || HURAM_PALETTE.gold
  const nomeExibicao = loginBrand.nomeExibicao || 'HURAM'
  const logoSrc = loginBrand.logoDarkUrl || logoHuramDark

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 space-y-4 bg-background">
      <Card className="w-full max-w-md border border-[#E4EAE6] shadow-xl bg-white rounded-2xl overflow-hidden">
        <CardHeader
          className="text-white pb-6 rounded-t-2xl text-center flex flex-col items-center transition-colors duration-200"
          style={{
            backgroundColor: corPrimaria,
            borderBottom: `2px solid ${corSecundaria}`,
          }}
        >
          <img
            src={logoSrc}
            alt={`${nomeExibicao} — Sistema Inteligente de Gestão`}
            className="h-20 w-auto max-w-[200px] object-contain rounded-xl border mb-3 shadow-md bg-black/20 p-1.5"
            style={{ borderColor: `${corSecundaria}80` }}
          />
          <CardTitle className="text-lg sm:text-xl font-bold text-center text-white flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" style={{ color: corSecundaria }} />
            Área Restrita — {nomeExibicao}
          </CardTitle>
          <p className="text-xs text-white/80 mt-1 font-medium">Sistema Inteligente de Gestão</p>
        </CardHeader>
        <CardContent className="pt-6 px-6 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-semibold text-[#202B28]">
                Login ou E-mail
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736D]" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Digite seu login (ex: patricia) ou e-mail"
                  className="pl-10 border-[#E4EAE6] bg-white text-[#202B28]"
                  style={{ outlineColor: corPrimaria }}
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
              <Label htmlFor="password" className="text-sm font-semibold text-[#202B28]">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736D]" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Digite sua senha"
                  className="pl-10 border-[#E4EAE6] bg-white text-[#202B28]"
                  style={{ outlineColor: corPrimaria }}
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

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#E4EAE6] bg-[#F8FAF9]">
              <input
                id="allow-location"
                type="checkbox"
                checked={allowLocation}
                onChange={(e) => setAllowLocation(e.target.checked)}
                className="mt-1 rounded border-[#E4EAE6] h-4 w-4 cursor-pointer"
                style={{ accentColor: corPrimaria }}
              />
              <label
                htmlFor="allow-location"
                className="text-xs text-[#66736D] leading-relaxed cursor-pointer select-none"
              >
                <span className="font-semibold text-[#202B28] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" style={{ color: corPrimaria }} />
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
              style={{ backgroundColor: corPrimaria }}
              className="w-full hover:opacity-90 text-white font-bold text-base shadow-md h-11 rounded-xl cursor-pointer"
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
              style={{ color: corPrimaria }}
              className="block text-center text-sm hover:underline font-semibold pt-1"
            >
              Esqueci minha senha
            </Link>
          </form>
        </CardContent>
      </Card>
      <AttributionFooter variant="inline" className="text-[11px] text-muted-foreground/70" />
    </div>
  )
}
