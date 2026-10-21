import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { type FieldErrors } from '@/lib/pocketbase/errors'
import {
  Lock,
  User,
  AlertCircle,
  Loader2,
  Globe,
  ShieldCheck,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react'
import { MfaVerifyScreen } from '@/components/mfa-verify-screen'
import { AttributionFooter } from '@/components/attribution-footer'
import { logoHuramLight, logoHuramDark, HURAM_PALETTE } from '@/lib/brand-assets'
import { useBrand } from '@/hooks/use-brand'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, loading, mfaRequired, mfaLoginVerify, mfaCancel } = useAuth()
  const { loginBrand } = useBrand()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [inactivityNotice, setInactivityNotice] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // Captura mensagem de inatividade se redirecionado pelo InactivityTracker
  useEffect(() => {
    const state = location.state as { inactivityMessage?: string } | null
    if (state?.inactivityMessage) {
      setInactivityNotice(state.inactivityMessage)
      // Limpa do state do histórico para não reaparecer após refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

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
    const { error: loginError, fieldErrors: fErrors } = await login(username.trim(), password)
    setSubmitting(false)
    if (loginError) {
      setError(loginError)
      setFieldErrors(fErrors || {})
    } else {
      navigate('/admin')
    }
  }

  const hasFieldError = !!fieldErrors.email || !!fieldErrors.username || !!fieldErrors.password

  if (mfaRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#001c10] via-[#002817] to-[#00140b] flex items-center justify-center p-4">
        <MfaVerifyScreen onVerify={mfaLoginVerify} onCancel={mfaCancel} />
      </div>
    )
  }

  const corPrimaria = loginBrand.corPrimaria || HURAM_PALETTE.green
  const corSecundaria = loginBrand.corSecundaria || HURAM_PALETTE.gold
  const nomeExibicao = loginBrand.nomeExibicao || 'HURAM'
  const logoSrc = loginBrand.logoDarkUrl || logoHuramDark

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAF9] via-white to-[#F1F4F2] flex flex-col justify-between relative overflow-hidden text-[#202B28]">
      {/* Elementos visuais decorativos de fundo suaves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: corPrimaria }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: corSecundaria }}
        />
      </div>

      {/* Topo com botão de acesso institucional */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#E4EAE6] bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            src={logoSrc}
            alt={`${nomeExibicao} — Sistema Inteligente de Gestão`}
            className="h-10 sm:h-11 w-auto max-w-[140px] object-contain rounded-lg border border-[#C69B45]/40 shadow-xs p-1"
            style={{ backgroundColor: corPrimaria }}
          />
          <div className="hidden sm:flex flex-col">
            <span
              className="text-sm font-bold tracking-tight leading-none"
              style={{ color: corPrimaria }}
            >
              {nomeExibicao}
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
              style={{ color: corSecundaria }}
            >
              Acesso ao Sistema
            </span>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="border-[#063D30]/30 bg-white hover:bg-[#063D30] text-[#063D30] hover:text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-xl transition-all shadow-2xs group cursor-pointer"
        >
          <Link to="/site" className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#C69B45] group-hover:text-white transition-colors" />
            <span>Acesse o site institucional</span>
            <ChevronRight className="w-4 h-4 text-[#C69B45] group-hover:text-white transition-colors" />
          </Link>
        </Button>
      </header>

      {/* Área central com Card de Login */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <Card className="w-full max-w-md border border-[#E4EAE6] bg-white shadow-xl text-[#202B28] rounded-2xl overflow-hidden animate-fade-in">
          <CardHeader
            className="text-white pb-6 pt-7 px-6 text-center flex flex-col items-center relative transition-colors duration-200"
            style={{
              backgroundColor: corPrimaria,
              borderBottom: `2px solid ${corSecundaria}`,
            }}
          >
            <div className="relative mb-3">
              <img
                src={logoSrc}
                alt={`${nomeExibicao} — Sistema Inteligente de Gestão`}
                className="h-20 sm:h-24 w-auto max-w-[220px] object-contain rounded-2xl border p-1.5 shadow-lg bg-black/20"
                style={{ borderColor: `${corSecundaria}80` }}
              />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-center text-white flex items-center justify-center gap-2 mt-1">
              <Lock className="w-5 h-5" style={{ color: corSecundaria }} />
              Acesso ao Sistema — {nomeExibicao}
            </CardTitle>
            <p className="text-xs text-white/90 mt-1 font-medium max-w-xs mx-auto">
              Sistema Inteligente de Gestão
            </p>
          </CardHeader>

          <CardContent className="pt-6 pb-6 px-6 sm:px-8 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="system-username" className="text-sm font-semibold text-[#202B28]">
                  Usuário ou E-mail
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736D]" />
                  <Input
                    id="system-username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Digite seu usuário ou e-mail"
                    style={{ '--tw-ring-color': corPrimaria } as React.CSSProperties}
                    className="pl-10 h-11 border-[#E4EAE6] bg-white text-[#202B28]"
                    autoComplete="username"
                  />
                </div>
                {(fieldErrors.email || fieldErrors.username) && (
                  <p className="text-xs text-destructive font-medium">
                    {fieldErrors.email || fieldErrors.username}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <Label htmlFor="system-password" className="text-sm font-semibold text-[#202B28]">
                    Senha
                  </Label>
                  <Link
                    to="/admin/recuperar-senha"
                    className="text-xs hover:underline font-semibold"
                    style={{ color: corPrimaria }}
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736D]" />
                  <Input
                    id="system-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Digite sua senha"
                    style={{ '--tw-ring-color': corPrimaria } as React.CSSProperties}
                    className="pl-10 pr-10 h-11 border-[#E4EAE6] bg-white text-[#202B28]"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#66736D] hover:text-[#202B28] p-0.5 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-[#063D30] transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-destructive font-medium">{fieldErrors.password}</p>
                )}
              </div>

              {inactivityNotice && (
                <div className="flex items-start gap-2.5 text-sm text-amber-800 bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-medium text-xs sm:text-sm leading-relaxed">
                    {inactivityNotice}
                  </span>
                </div>
              )}

              {error && !hasFieldError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/30">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium text-xs sm:text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                style={{ backgroundColor: corPrimaria }}
                className="w-full hover:opacity-90 text-white font-bold text-base shadow-md h-11 rounded-xl transition-all duration-200 cursor-pointer"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Entrando no sistema...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Entrar no Sistema
                  </>
                )}
              </Button>
            </form>

            <div className="pt-3 border-t border-[#E4EAE6] flex flex-col gap-2.5 text-center text-xs">
              <div className="flex items-center justify-center gap-1.5 text-[#66736D]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ambiente Seguro com Criptografia de Ponta</span>
              </div>

              {/* Botão secundário de redirecionamento */}
              <div className="pt-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#063D30]/30 hover:bg-[#063D30]/5 text-[#063D30] font-semibold text-xs sm:text-sm py-2 rounded-xl cursor-pointer"
                >
                  <Link to="/site" className="flex items-center justify-center gap-2">
                    <Globe className="w-4 h-4 text-[#C69B45]" />
                    <span>Acesse o site institucional</span>
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Rodapé discreto da tela de login */}
      <footer className="relative z-10 w-full px-4 py-4 text-center text-xs text-[#66736D] border-t border-[#E4EAE6] bg-white/70 backdrop-blur-sm space-y-1.5">
        <p>
          © {new Date().getFullYear()} {nomeExibicao} — Sistema Inteligente de Gestão. Todos os
          direitos reservados.
        </p>
        <AttributionFooter variant="inline" className="text-[#66736D]" />
      </footer>
    </div>
  )
}
