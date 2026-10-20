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
import { logoHuramLight, logoHuramDark } from '@/lib/brand-assets'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, loading, mfaRequired, mfaLoginVerify, mfaCancel } = useAuth()
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001c10] via-[#002817] to-[#00140b] flex flex-col justify-between relative overflow-hidden text-white">
      {/* Elementos visuais decorativos de fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#005B2E]/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#C89B3C]/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,155,60,0.06)_0%,transparent_70%)]" />
      </div>

      {/* Topo com botão de acesso institucional */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between border-b border-[#C89B3C]/20 bg-[#001c10]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            src={logoHuramDark}
            alt="HURAM — Sistema Inteligente de Gestão"
            className="h-10 sm:h-12 w-auto object-contain rounded-lg border border-[#D6A755]/40 shadow-md"
          />
          <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-[#D6A755] font-extrabold">
            Acesso ao Sistema
          </span>
        </div>

        <Button
          asChild
          variant="outline"
          className="border-[#D6A755] bg-[#003D30]/90 hover:bg-[#D6A755] text-[#D6A755] hover:text-[#003D30] font-bold text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-xl transition-all shadow-md group"
        >
          <Link to="/site" className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#D6A755] group-hover:text-[#003D30] transition-colors" />
            <span>Acesse o site da HURAM</span>
            <ChevronRight className="w-4 h-4 text-[#D6A755] group-hover:text-[#003D30] transition-colors" />
          </Link>
        </Button>
      </header>

      {/* Área central com Card de Login */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <Card className="w-full max-w-md border-2 border-[#D6A755]/40 bg-white shadow-2xl text-foreground rounded-2xl overflow-hidden animate-fade-in">
          <CardHeader className="bg-gradient-to-b from-[#003D30] to-[#002820] text-white border-b border-[#D6A755]/40 pb-6 pt-7 px-6 text-center flex flex-col items-center relative">
            <div className="relative mb-3 group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D6A755] via-[#F27616] to-[#D6A755] opacity-75 blur-sm group-hover:opacity-100 transition duration-500" />
              <img
                src={logoHuramDark}
                alt="HURAM — Sistema Inteligente de Gestão"
                className="relative h-24 sm:h-28 w-auto object-contain rounded-2xl border-2 border-[#D6A755]/70 p-1.5 bg-[#003D30] shadow-xl"
              />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-center text-white flex items-center justify-center gap-2 mt-1">
              <Lock className="w-5 h-5 text-[#D6A755]" />
              Acesso ao Sistema HURAM
            </CardTitle>
            <p className="text-xs text-white/85 mt-1.5 font-medium max-w-xs mx-auto">
              Sistema Inteligente de Gestão
            </p>
          </CardHeader>

          <CardContent className="pt-6 pb-6 px-6 sm:px-8 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="system-username" className="text-sm font-semibold text-foreground">
                  Usuário ou E-mail
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="system-username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Digite seu usuário ou e-mail"
                    className="pl-10 h-11 border-border focus-visible:ring-[#003D30]"
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
                  <Label
                    htmlFor="system-password"
                    className="text-sm font-semibold text-foreground"
                  >
                    Senha
                  </Label>
                  <Link
                    to="/admin/recuperar-senha"
                    className="text-xs text-[#003D30] hover:underline font-semibold"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="system-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Digite sua senha"
                    className="pl-10 pr-10 h-11 border-border focus-visible:ring-[#003D30]"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-[#005B2E] transition-colors"
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
                <div className="flex items-start gap-2.5 text-sm text-amber-800 bg-amber-500/15 dark:text-amber-300 dark:bg-amber-950/40 rounded-lg p-3 border border-amber-500/30">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
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
                className="w-full bg-[#003D30] hover:bg-[#002820] text-white font-extrabold text-base shadow-lg h-12 rounded-xl transition-all duration-200"
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

            <div className="pt-3 border-t border-border flex flex-col gap-2.5 text-center text-xs">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ambiente Seguro com Criptografia de Ponta</span>
              </div>

              {/* Botão em destaque no card também para fácil acesso */}
              <div className="pt-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#D6A755]/70 hover:bg-[#D6A755]/15 text-[#003D30] font-bold text-xs sm:text-sm py-2 rounded-xl"
                >
                  <Link to="/site" className="flex items-center justify-center gap-2">
                    <Globe className="w-4 h-4 text-[#D6A755]" />
                    <span>Acesse o site da HURAM</span>
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Rodapé discreto da tela de login */}
      <footer className="relative z-10 w-full px-4 py-4 text-center text-xs text-white/60 border-t border-white/10 bg-[#001c10]/70 backdrop-blur-sm space-y-1.5">
        <p>
          © {new Date().getFullYear()} HURAM — Sistema Inteligente de Gestão. Todos os direitos
          reservados.
        </p>
        <AttributionFooter variant="inline" className="text-white/70" />
      </footer>
    </div>
  )
}
